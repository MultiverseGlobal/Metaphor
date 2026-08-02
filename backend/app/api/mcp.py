import hashlib
import secrets
import base64
import time
import uuid
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Header, status
from fastapi.responses import JSONResponse, StreamingResponse, RedirectResponse
from pydantic import BaseModel, Field
from sqlmodel import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.models.identity import User, Organization
from app.models.operations import MCPOAuthClient, MCPOAuthAuthCode, MCPOAuthToken, MCPAuditLog
from app.services.identity import IdentityService
from app.services.mcp_server import (
    enforce_token_rate_limit,
    register_sse_stream,
    unregister_sse_stream,
    terminate_active_sse_streams,
    list_mcp_resources,
    read_mcp_resource,
    list_mcp_tools,
    call_mcp_tool,
    list_mcp_prompts,
    get_mcp_prompt
)

logger = logging.getLogger("metaphor.api.mcp")

router = APIRouter()

# Helper hash functions
def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()

def verify_pkce_challenge(code_verifier: str, code_challenge: str, method: str = "S256") -> bool:
    if method == "plain":
        return code_verifier == code_challenge
    elif method == "S256":
        # SHA-256 of verifier, base64url encoded without padding
        digest = hashlib.sha256(code_verifier.encode()).digest()
        computed_challenge = base64.urlsafe_b64encode(digest).decode().rstrip("=")
        return computed_challenge == code_challenge.rstrip("=")
    return False


# ── RFC 8414 OAuth Authorization Server Metadata Discovery ──────────────────────
@router.get("/.well-known/oauth-authorization-server")
@router.get("/oauth/.well-known/oauth-authorization-server")
async def oauth_discovery_metadata(request: Request):
    base_url = str(request.base_url).rstrip("/")
    return {
        "issuer": f"{base_url}/api/v1/mcp",
        "authorization_endpoint": f"{base_url}/api/v1/mcp/oauth/authorize",
        "token_endpoint": f"{base_url}/api/v1/mcp/oauth/token",
        "revocation_endpoint": f"{base_url}/api/v1/mcp/oauth/revoke",
        "registration_endpoint": f"{base_url}/api/v1/mcp/oauth/register",
        "response_types_supported": ["code"],
        "grant_types_supported": ["authorization_code", "refresh_token"],
        "code_challenge_methods_supported": ["S256", "plain"],
        "token_endpoint_auth_methods_supported": ["client_secret_post", "client_secret_basic", "none"],
        "scopes_supported": ["read:workspace", "read:graph", "read:docs"]
    }


# ── RFC 7591 Dynamic Client Registration ─────────────────────────────────────
class ClientRegistrationRequest(BaseModel):
    client_name: str
    redirect_uris: List[str]
    grant_types: Optional[List[str]] = ["authorization_code", "refresh_token"]

@router.post("/oauth/register")
async def register_mcp_client(
    payload: ClientRegistrationRequest,
    session: AsyncSession = Depends(get_session)
):
    identity_svc = IdentityService(session)
    org = await identity_svc.get_or_create_default_organization()
    
    client_id = f"mcp_client_{secrets.token_hex(12)}"
    client_secret = f"mcp_secret_{secrets.token_hex(24)}"
    secret_hash = hash_token(client_secret)
    
    client_obj = MCPOAuthClient(
        client_id=client_id,
        client_secret_hash=secret_hash,
        client_name=payload.client_name,
        redirect_uris_json={"uris": payload.redirect_uris},
        grant_types_json={"grants": payload.grant_types},
        organization_id=org.id
    )
    session.add(client_obj)
    await session.commit()
    await session.refresh(client_obj)
    
    return {
        "client_id": client_id,
        "client_secret": client_secret,
        "client_name": payload.client_name,
        "redirect_uris": payload.redirect_uris,
        "grant_types": payload.grant_types
    }


# ── OAuth 2.1 Authorize Endpoint (Mandatory PKCE) ────────────────────────────
@router.get("/oauth/authorize")
async def oauth_authorize(
    client_id: str = Query(...),
    redirect_uri: str = Query(...),
    response_type: str = Query("code"),
    code_challenge: str = Query(...),
    code_challenge_method: str = Query("S256"),
    scope: str = Query("read:workspace"),
    state: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_session)
):
    if response_type != "code":
        raise HTTPException(status_code=400, detail="Only response_type=code is supported.")
    
    if code_challenge_method not in ["S256", "plain"]:
        raise HTTPException(status_code=400, detail="Invalid code_challenge_method. Must be S256 or plain.")
    
    # Lookup client
    stmt = select(MCPOAuthClient).where(MCPOAuthClient.client_id == client_id)
    res = await session.execute(stmt)
    client_obj = res.scalar_one_or_none()
    
    if not client_obj:
        raise HTTPException(status_code=400, detail="Unknown client_id.")
    
    # Exact redirect_uri validation
    registered_uris = client_obj.redirect_uris_json.get("uris", [])
    if redirect_uri not in registered_uris:
        raise HTTPException(status_code=400, detail="Redirect URI mismatch against registered URIs.")
    
    identity_svc = IdentityService(session)
    user = await identity_svc.get_or_create_default_user()
    org = await identity_svc.get_or_create_default_organization()
    
    # Issue single-use Auth Code
    raw_code = f"mcp_code_{secrets.token_hex(20)}"
    code_obj = MCPOAuthAuthCode(
        code_hash=hash_token(raw_code),
        client_id=client_id,
        organization_id=org.id,
        user_id=user.id,
        redirect_uri=redirect_uri,
        code_challenge=code_challenge,
        code_challenge_method=code_challenge_method,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    session.add(code_obj)
    await session.commit()
    
    # Return code redirect
    separator = "&" if "?" in redirect_uri else "?"
    redirect_url = f"{redirect_uri}{separator}code={raw_code}"
    if state:
        redirect_url += f"&state={state}"
        
    return RedirectResponse(url=redirect_url, status_code=302)


# ── OAuth 2.1 Token Exchange & Refresh Endpoint ──────────────────────────────
class TokenExchangeRequest(BaseModel):
    grant_type: str
    code: Optional[str] = None
    redirect_uri: Optional[str] = None
    client_id: Optional[str] = None
    code_verifier: Optional[str] = None
    refresh_token: Optional[str] = None

@router.post("/oauth/token")
async def oauth_token_exchange(
    payload: TokenExchangeRequest,
    session: AsyncSession = Depends(get_session)
):
    identity_svc = IdentityService(session)
    org = await identity_svc.get_or_create_default_organization()
    user = await identity_svc.get_or_create_default_user()

    if payload.grant_type == "authorization_code":
        if not payload.code or not payload.code_verifier or not payload.client_id or not payload.redirect_uri:
            raise HTTPException(status_code=400, detail="Missing authorization_code, code_verifier, client_id, or redirect_uri.")
        
        c_stmt = select(MCPOAuthClient).where(MCPOAuthClient.client_id == payload.client_id)
        c_res = await session.execute(c_stmt)
        client_obj = c_res.scalar_one_or_none()
        if not client_obj:
            raise HTTPException(status_code=400, detail="Invalid client_id.")
        
        # Strict redirect_uri validation at token step
        registered_uris = client_obj.redirect_uris_json.get("uris", [])
        if payload.redirect_uri not in registered_uris:
            raise HTTPException(status_code=400, detail="Redirect URI mismatch at token exchange step.")
        
        code_h = hash_token(payload.code)
        code_stmt = select(MCPOAuthAuthCode).where(MCPOAuthAuthCode.code_hash == code_h, MCPOAuthAuthCode.used == False)
        code_res = await session.execute(code_stmt)
        auth_code_obj = code_res.scalar_one_or_none()
        
        if not auth_code_obj:
            raise HTTPException(status_code=400, detail="Invalid or expired authorization code.")
        
        if auth_code_obj.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Authorization code expired.")
        
        # Verify PKCE Verifier
        if not verify_pkce_challenge(payload.code_verifier, auth_code_obj.code_challenge, auth_code_obj.code_challenge_method):
            raise HTTPException(status_code=400, detail="Invalid PKCE code_verifier.")
        
        # Mark code as used
        auth_code_obj.used = True
        session.add(auth_code_obj)
        
        # Mint Access Token (1h) & Refresh Token (30d)
        raw_access_token = f"mtph_live_{secrets.token_hex(24)}"
        raw_refresh_token = f"mtph_rf_{secrets.token_hex(24)}"
        
        token_obj = MCPOAuthToken(
            token_hash=hash_token(raw_access_token),
            refresh_token_hash=hash_token(raw_refresh_token),
            preview=f"{raw_access_token[:12]}...{raw_access_token[-4:]}",
            client_id=payload.client_id,
            organization_id=auth_code_obj.organization_id,
            user_id=auth_code_obj.user_id,
            scope="read:workspace",
            expires_at=datetime.utcnow() + timedelta(hours=1),
            refresh_expires_at=datetime.utcnow() + timedelta(days=30)
        )
        session.add(token_obj)
        await session.commit()
        
        return {
            "access_token": raw_access_token,
            "token_type": "Bearer",
            "expires_in": 3600,
            "refresh_token": raw_refresh_token,
            "scope": "read:workspace"
        }

    elif payload.grant_type == "refresh_token":
        if not payload.refresh_token:
            raise HTTPException(status_code=400, detail="Missing refresh_token.")
        
        rf_hash = hash_token(payload.refresh_token)
        stmt = select(MCPOAuthToken).where(MCPOAuthToken.refresh_token_hash == rf_hash, MCPOAuthToken.revoked_at == None)
        res = await session.execute(stmt)
        token_obj = res.scalar_one_or_none()
        
        if not token_obj or (token_obj.refresh_expires_at and token_obj.refresh_expires_at < datetime.utcnow()):
            raise HTTPException(status_code=400, detail="Invalid or expired refresh token.")
        
        # Rotate refresh token
        new_access_token = f"mtph_live_{secrets.token_hex(24)}"
        new_refresh_token = f"mtph_rf_{secrets.token_hex(24)}"
        
        token_obj.token_hash = hash_token(new_access_token)
        token_obj.refresh_token_hash = hash_token(new_refresh_token)
        token_obj.preview = f"{new_access_token[:12]}...{new_access_token[-4:]}"
        token_obj.expires_at = datetime.utcnow() + timedelta(hours=1)
        token_obj.refresh_expires_at = datetime.utcnow() + timedelta(days=30)
        
        session.add(token_obj)
        await session.commit()
        
        return {
            "access_token": new_access_token,
            "token_type": "Bearer",
            "expires_in": 3600,
            "refresh_token": new_refresh_token,
            "scope": token_obj.scope
        }

    else:
        raise HTTPException(status_code=400, detail="Unsupported grant_type.")


# ── OAuth 2.1 Token Revocation Endpoint ──────────────────────────────────────
class RevokeTokenRequest(BaseModel):
    token: str

@router.post("/oauth/revoke")
async def oauth_revoke_token(
    payload: RevokeTokenRequest,
    session: AsyncSession = Depends(get_session)
):
    token_h = hash_token(payload.token)
    stmt = select(MCPOAuthToken).where(
        (MCPOAuthToken.token_hash == token_h) | (MCPOAuthToken.refresh_token_hash == token_h)
    )
    res = await session.execute(stmt)
    token_obj = res.scalar_one_or_none()
    
    if token_obj:
        token_obj.revoked_at = datetime.utcnow()
        session.add(token_obj)
        await session.commit()
        
        # Actively kill open SSE streams for this token
        terminate_active_sse_streams(str(token_obj.id))
        
    return {"status": "revoked"}


# ── Token Management & Audit Logs for UI ──────────────────────────────────────
@router.get("/oauth/tokens")
async def list_mcp_tokens(session: AsyncSession = Depends(get_session)):
    identity_svc = IdentityService(session)
    org = await identity_svc.get_or_create_default_organization()
    
    stmt = select(MCPOAuthToken).where(
        MCPOAuthToken.organization_id == org.id,
        MCPOAuthToken.revoked_at == None
    ).order_by(MCPOAuthToken.created_at.desc())
    
    res = await session.execute(stmt)
    tokens = res.scalars().all()
    
    output = []
    for t in tokens:
        # Fetch last audit log
        audit_stmt = select(MCPAuditLog).where(MCPAuditLog.token_id == t.id).order_by(MCPAuditLog.timestamp.desc()).limit(1)
        audit_res = await session.execute(audit_stmt)
        last_audit = audit_res.scalar_one_or_none()
        
        output.append({
            "id": str(t.id),
            "preview": t.preview,
            "client_id": t.client_id,
            "scope": t.scope,
            "created_at": t.created_at.isoformat(),
            "last_used": last_audit.timestamp.isoformat() if last_audit else None
        })
    return output

@router.delete("/oauth/tokens/{token_id}")
async def delete_mcp_token(token_id: str, session: AsyncSession = Depends(get_session)):
    try:
        t_uuid = uuid.UUID(token_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid token ID format.")
        
    stmt = select(MCPOAuthToken).where(MCPOAuthToken.id == t_uuid)
    res = await session.execute(stmt)
    token_obj = res.scalar_one_or_none()
    
    if token_obj:
        token_obj.revoked_at = datetime.utcnow()
        session.add(token_obj)
        await session.commit()
        
        # Kill open active SSE streams immediately
        terminate_active_sse_streams(str(t_uuid))
        
    return {"status": "revoked"}

@router.get("/audit-logs")
async def list_mcp_audit_logs(session: AsyncSession = Depends(get_session)):
    identity_svc = IdentityService(session)
    org = await identity_svc.get_or_create_default_organization()
    
    stmt = select(MCPAuditLog).where(MCPAuditLog.organization_id == org.id).order_by(MCPAuditLog.timestamp.desc()).limit(50)
    res = await session.execute(stmt)
    logs = res.scalars().all()
    
    return [
        {
            "id": str(l.id),
            "client_name": l.client_name,
            "call_type": l.call_type,
            "name": l.name,
            "query_summary": l.query_summary,
            "status_code": l.status_code,
            "response_time_ms": l.response_time_ms,
            "timestamp": l.timestamp.isoformat()
        } for l in logs
    ]


# ── Remote MCP Server Endpoint (JSON-RPC 2.0 & SSE Transport) ─────────────────
async def authenticate_mcp_token(request: Request, token_query: Optional[str] = None, session: AsyncSession = Depends(get_session)) -> MCPOAuthToken:
    raw_token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        raw_token = auth_header.split(" ", 1)[1]
    elif token_query:
        raw_token = token_query
    elif request.headers.get("X-MCP-Token"):
        raw_token = request.headers.get("X-MCP-Token")
        
    if not raw_token:
        raise HTTPException(status_code=401, detail="Unauthorized: Bearer token is missing.")
    
    token_h = hash_token(raw_token)
    stmt = select(MCPOAuthToken).where(MCPOAuthToken.token_hash == token_h)
    res = await session.execute(stmt)
    token_obj = res.scalar_one_or_none()
    
    if not token_obj:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid token.")
        
    if token_obj.revoked_at is not None:
        raise HTTPException(status_code=401, detail="Unauthorized: Token has been revoked.")
        
    if token_obj.expires_at and token_obj.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Unauthorized: Token has expired.")
        
    return token_obj


@router.post("")
@router.post("/")
async def remote_mcp_jsonrpc_endpoint(
    request: Request,
    token: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_session)
):
    token_obj = await authenticate_mcp_token(request, token, session)
    
    # Enforce sliding window rate limit (30 req/min)
    enforce_token_rate_limit(str(token_obj.id))
    
    start_time = time.time()
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON-RPC payload.")
        
    method = body.get("method")
    req_id = body.get("id")
    params = body.get("params", {})
    
    response_payload = None
    call_type = "system"
    name_called = method or "unknown"
    summary = None
    
    if method == "initialize":
        response_payload = {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"resources": {}, "tools": {}},
                "serverInfo": {"name": "Metaphor OS Context Engine", "version": "2.0.0"}
            }
        }
    elif method == "resources/list":
        call_type = "resource"
        resources = await list_mcp_resources()
        response_payload = {"jsonrpc": "2.0", "id": req_id, "result": {"resources": resources}}
        
    elif method == "resources/read":
        call_type = "resource"
        uri = params.get("uri", "")
        name_called = uri
        res_data = await read_mcp_resource(uri, token_obj.organization_id, session)
        response_payload = {"jsonrpc": "2.0", "id": req_id, "result": res_data}
        
    elif method == "tools/list":
        call_type = "tool"
        tools = await list_mcp_tools()
        response_payload = {"jsonrpc": "2.0", "id": req_id, "result": {"tools": tools}}
        
    elif method == "tools/call":
        call_type = "tool"
        tool_name = params.get("name", "")
        name_called = tool_name
        arguments = params.get("arguments", {})
        summary = str(arguments)
        tool_res = await call_mcp_tool(tool_name, arguments, token_obj.organization_id, session)
        response_payload = {"jsonrpc": "2.0", "id": req_id, "result": tool_res}

    elif method == "prompts/list":
        call_type = "prompt"
        prompts = await list_mcp_prompts()
        response_payload = {"jsonrpc": "2.0", "id": req_id, "result": {"prompts": prompts}}

    elif method == "prompts/get":
        call_type = "prompt"
        prompt_name = params.get("name", "")
        name_called = prompt_name
        arguments = params.get("arguments", {})
        summary = str(arguments)
        prompt_res = await get_mcp_prompt(prompt_name, arguments, token_obj.organization_id, session)
        response_payload = {"jsonrpc": "2.0", "id": req_id, "result": prompt_res}
        
    else:
        response_payload = {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {"code": -32601, "message": f"Method '{method}' not found."}
        }

    elapsed_ms = (time.time() - start_time) * 1000.0
    
    # Audit log entry
    audit = MCPAuditLog(
        organization_id=token_obj.organization_id,
        token_id=token_obj.id,
        client_name=token_obj.client_id,
        call_type=call_type,
        name=name_called,
        query_summary=summary,
        status_code=200,
        response_time_ms=elapsed_ms
    )
    session.add(audit)
    await session.commit()
    
    return response_payload


@router.get("/health-check")
@router.post("/health-check")
async def mcp_health_check(session: AsyncSession = Depends(get_session)):
    """
    Live connection test endpoint for Metaphor MCP Server.
    Executes internal self-test across resources, tools, and prompts.
    """
    start_time = time.time()
    tools = await list_mcp_tools()
    resources = await list_mcp_resources()
    prompts = await list_mcp_prompts()
    elapsed_ms = round((time.time() - start_time) * 1000.0, 2)
    
    return {
        "status": "online",
        "version": "2.0.0",
        "server_name": "Metaphor OS Context Engine",
        "latency_ms": elapsed_ms,
        "tools_count": len(tools),
        "resources_count": len(resources),
        "prompts_count": len(prompts),
        "authentication": "OAuth 2.1 (PKCE & Dynamic Registration)",
        "capabilities": {
            "resources": [r["uri"] for r in resources],
            "tools": [t["name"] for t in tools],
            "prompts": [p["name"] for p in prompts]
        }
    }


@router.get("/sse")
async def remote_mcp_sse_endpoint(
    request: Request,
    token: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_session)
):
    token_obj = await authenticate_mcp_token(request, token, session)
    enforce_token_rate_limit(str(token_obj.id))
    
    shutdown_event = register_sse_stream(str(token_obj.id))
    
    async def sse_generator():
        try:
            # Send initial endpoint event
            yield f"event: endpoint\ndata: /api/v1/mcp?token={token}\n\n"
            while not shutdown_event.is_set():
                if await request.is_disconnected():
                    break
                yield f": ping\n\n"
                await asyncio.sleep(5)
        finally:
            unregister_sse_stream(str(token_obj.id), shutdown_event)

    return StreamingResponse(sse_generator(), media_type="text/event-stream")
