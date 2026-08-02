import uuid
import hashlib
import base64
import pytest
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timedelta

from app.main import app
from app.database.session import async_session_maker
from app.models.identity import Organization, User
from app.models.operations import MCPOAuthClient, MCPOAuthToken, MCPAuditLog
from app.services.mcp_server import hash_token

@pytest.mark.asyncio
async def test_mcp_oauth_discovery():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/v1/mcp/.well-known/oauth-authorization-server")
        assert resp.status_code == 200
        data = resp.json()
        assert data["issuer"] == "http://test/api/v1/mcp"
        assert "authorization_endpoint" in data
        assert "token_endpoint" in data
        assert "S256" in data["code_challenge_methods_supported"]

@pytest.mark.asyncio
async def test_mcp_dynamic_client_registration():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/mcp/oauth/register",
            json={"client_name": "Claude Desktop Test Client", "redirect_uris": ["http://localhost:8080/callback"]}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["client_id"].startswith("mcp_client_")
        assert data["client_secret"].startswith("mcp_secret_")

@pytest.mark.asyncio
async def test_mcp_pkce_enforcement_and_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register client
        reg_res = await client.post(
            "/api/v1/mcp/oauth/register",
            json={"client_name": "PKCE Client", "redirect_uris": ["http://localhost/callback"]}
        )
        c_id = reg_res.json()["client_id"]

        # 2. Authorize WITHOUT code_challenge -> HTTP 400
        bad_auth = await client.get(
            f"/api/v1/mcp/oauth/authorize?client_id={c_id}&redirect_uri=http://localhost/callback&response_type=code"
        )
        assert bad_auth.status_code == 422 or bad_auth.status_code == 400

        # 3. Valid Authorize with PKCE challenge (S256)
        verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
        digest = hashlib.sha256(verifier.encode()).digest()
        challenge = base64.urlsafe_b64encode(digest).decode().rstrip("=")

        auth_res = await client.get(
            f"/api/v1/mcp/oauth/authorize?client_id={c_id}&redirect_uri=http://localhost/callback&response_type=code&code_challenge={challenge}&code_challenge_method=S256"
        )
        assert auth_res.status_code == 302
        redirect_location = auth_res.headers["location"]
        code = redirect_location.split("code=")[1].split("&")[0]

        # 4. Token exchange with WRONG verifier -> HTTP 400
        bad_tok = await client.post(
            "/api/v1/mcp/oauth/token",
            json={
                "grant_type": "authorization_code",
                "client_id": c_id,
                "redirect_uri": "http://localhost/callback",
                "code": code,
                "code_verifier": "wrong_verifier_string"
            }
        )
        assert bad_tok.status_code == 400

        # 5. Token exchange with VALID verifier -> Success
        good_tok = await client.post(
            "/api/v1/mcp/oauth/token",
            json={
                "grant_type": "authorization_code",
                "client_id": c_id,
                "redirect_uri": "http://localhost/callback",
                "code": code,
                "code_verifier": verifier
            }
        )
        assert good_tok.status_code == 200
        tok_data = good_tok.json()
        assert "access_token" in tok_data
        assert "refresh_token" in tok_data

@pytest.mark.asyncio
async def test_mcp_strict_redirect_uri_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        reg_res = await client.post(
            "/api/v1/mcp/oauth/register",
            json={"client_name": "Strict URI Client", "redirect_uris": ["https://app.com/callback"]}
        )
        c_id = reg_res.json()["client_id"]

        # Mismatched redirect URI -> HTTP 400
        bad_uri = await client.get(
            f"/api/v1/mcp/oauth/authorize?client_id={c_id}&redirect_uri=https://attacker.com/callback&response_type=code&code_challenge=xyz&code_challenge_method=S256"
        )
        assert bad_uri.status_code == 400

@pytest.mark.asyncio
async def test_mcp_multi_tenant_isolation_all_resources_and_tools():
    async with async_session_maker() as session:
        # Create Org A & Org B
        org_a = Organization(id=uuid.uuid4(), name="Org A", slug=f"org-a-{uuid.uuid4().hex[:6]}")
        org_b = Organization(id=uuid.uuid4(), name="Org B", slug=f"org-b-{uuid.uuid4().hex[:6]}")
        user_a = User(id=uuid.uuid4(), email=f"user_a_{uuid.uuid4().hex[:6]}@orga.com", name="User A", hashed_password="pw")
        user_b = User(id=uuid.uuid4(), email=f"user_b_{uuid.uuid4().hex[:6]}@orgb.com", name="User B", hashed_password="pw")
        session.add_all([org_a, org_b, user_a, user_b])
        await session.commit()

        # Mint Token A (Org A) and Token B (Org B)
        raw_tok_a = f"mtph_live_test_a_{uuid.uuid4().hex}"
        raw_tok_b = f"mtph_live_test_b_{uuid.uuid4().hex}"

        tok_a = MCPOAuthToken(
            token_hash=hash_token(raw_tok_a),
            preview=raw_tok_a[:12],
            client_id="test_client",
            organization_id=org_a.id,
            user_id=user_a.id,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        tok_b = MCPOAuthToken(
            token_hash=hash_token(raw_tok_b),
            preview=raw_tok_b[:12],
            client_id="test_client",
            organization_id=org_b.id,
            user_id=user_b.id,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        session.add_all([tok_a, tok_b])
        await session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Unauthenticated Request -> HTTP 401
        unauth = await client.post("/api/v1/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"})
        assert unauth.status_code == 401

        # 2. Tampered / Malformed Token -> HTTP 401
        tampered = await client.post(
            "/api/v1/mcp",
            headers={"Authorization": "Bearer invalid_tampered_token_string"},
            json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"}
        )
        assert tampered.status_code == 401

        # 3. Test all 6 Resources with Token A (Org A)
        resources = [
            "workspace://projects",
            "workspace://docs",
            "workspace://graph",
            "workspace://architecture",
            "workspace://meetings",
            "workspace://repositories"
        ]
        for uri in resources:
            res = await client.post(
                "/api/v1/mcp",
                headers={"Authorization": f"Bearer {raw_tok_a}"},
                json={"jsonrpc": "2.0", "id": 1, "method": "resources/read", "params": {"uri": uri}}
            )
            assert res.status_code == 200
            res_json = res.json()
            assert "result" in res_json
            # Ensure content does NOT leak Org B
            assert str(org_b.id) not in json.dumps(res_json)

        # 4. Test all 8 Tools with Token A (Org A)
        tools = [
            ("search_context", {"query": "test query"}),
            ("retrieve_documents", {"limit": 5}),
            ("find_related", {"entity_name": "test"}),
            ("explain_architecture", {}),
            ("answer_from_workspace", {"question": "what is this architecture?"}),
            ("get_project", {"project_name": "metaphor"}),
            ("resolve_entity", {"query": "entity"}),
            ("list_recent_changes", {})
        ]
        for tool_name, args in tools:
            tool_res = await client.post(
                "/api/v1/mcp",
                headers={"Authorization": f"Bearer {raw_tok_a}"},
                json={"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": tool_name, "arguments": args}}
            )
            assert tool_res.status_code == 200
            t_json = tool_res.json()
            assert "result" in t_json
            assert str(org_b.id) not in json.dumps(t_json)

@pytest.mark.asyncio
async def test_mcp_rate_limiting_burst():
    async with async_session_maker() as session:
        org = Organization(id=uuid.uuid4(), name="Rate Limit Org", slug=f"rl-org-{uuid.uuid4().hex[:6]}")
        user = User(id=uuid.uuid4(), email=f"rl_{uuid.uuid4().hex[:6]}@test.com", name="RL User", hashed_password="pw")
        session.add_all([org, user])
        await session.commit()

        raw_tok_burst = f"mtph_live_burst_{uuid.uuid4().hex}"
        raw_tok_normal = f"mtph_live_normal_{uuid.uuid4().hex}"

        t_burst = MCPOAuthToken(
            token_hash=hash_token(raw_tok_burst),
            preview=raw_tok_burst[:12],
            client_id="burst_client",
            organization_id=org.id,
            user_id=user.id,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        t_normal = MCPOAuthToken(
            token_hash=hash_token(raw_tok_normal),
            preview=raw_tok_normal[:12],
            client_id="normal_client",
            organization_id=org.id,
            user_id=user.id,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        session.add_all([t_burst, t_normal])
        await session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Burst 30 requests -> Success
        for i in range(30):
            r = await client.post(
                "/api/v1/mcp",
                headers={"Authorization": f"Bearer {raw_tok_burst}"},
                json={"jsonrpc": "2.0", "id": i, "method": "initialize"}
            )
            assert r.status_code == 200

        # 31st request -> HTTP 429 Too Many Requests
        r_exceeded = await client.post(
            "/api/v1/mcp",
            headers={"Authorization": f"Bearer {raw_tok_burst}"},
            json={"jsonrpc": "2.0", "id": 99, "method": "initialize"}
        )
        assert r_exceeded.status_code == 429

        # Confirm normal token is UNAFFECTED and continues working
        r_normal = await client.post(
            "/api/v1/mcp",
            headers={"Authorization": f"Bearer {raw_tok_normal}"},
            json={"jsonrpc": "2.0", "id": 1, "method": "initialize"}
        )
        assert r_normal.status_code == 200

@pytest.mark.asyncio
async def test_mcp_token_revocation_immediate_invalidation():
    async with async_session_maker() as session:
        org = Organization(id=uuid.uuid4(), name="Revocation Org", slug=f"revoke-org-{uuid.uuid4().hex[:6]}")
        user = User(id=uuid.uuid4(), email=f"revoke_{uuid.uuid4().hex[:6]}@test.com", name="Revoke User", hashed_password="pw")
        session.add_all([org, user])
        await session.commit()

        raw_tok = f"mtph_live_revoke_{uuid.uuid4().hex}"
        tok_obj = MCPOAuthToken(
            token_hash=hash_token(raw_tok),
            preview=raw_tok[:12],
            client_id="revoke_client",
            organization_id=org.id,
            user_id=user.id,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        session.add(tok_obj)
        await session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Call tool before revocation -> HTTP 200
        before_res = await client.post(
            "/api/v1/mcp",
            headers={"Authorization": f"Bearer {raw_tok}"},
            json={"jsonrpc": "2.0", "id": 1, "method": "initialize"}
        )
        assert before_res.status_code == 200

        # 2. Revoke token via OAuth Revoke endpoint
        rev_res = await client.post("/api/v1/mcp/oauth/revoke", json={"token": raw_tok})
        assert rev_res.status_code == 200

        # 3. Call tool immediately after revocation -> HTTP 401
        after_res = await client.post(
            "/api/v1/mcp",
            headers={"Authorization": f"Bearer {raw_tok}"},
            json={"jsonrpc": "2.0", "id": 1, "method": "initialize"}
        )
        assert after_res.status_code == 401
