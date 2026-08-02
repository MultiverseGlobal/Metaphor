import asyncio
import hashlib
import json
import base64
from httpx import AsyncClient, ASGITransport
from app.main import app

async def main():
    print("--- Running Local Async Test Flow ---")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Discovery
        r1 = await client.get("/.well-known/oauth-authorization-server")
        print("[1] Discovery:", r1.status_code, r1.json()["issuer"])

        # 2. DCR
        r2 = await client.post("/api/v1/mcp/oauth/register", json={"client_name": "ChatGPT Local", "redirect_uris": ["https://chatgpt.com/callback"]})
        print("[2] DCR:", r2.status_code, r2.json())
        c_id = r2.json()["client_id"]

        # 3. Authorize
        r3 = await client.get(f"/api/v1/mcp/oauth/authorize?client_id={c_id}&redirect_uri=https://chatgpt.com/callback&response_type=code&code_challenge=test_challenge&code_challenge_method=plain", follow_redirects=False)
        print("[3] Authorize:", r3.status_code, r3.headers.get("location"))
        loc = r3.headers.get("location")
        code = loc.split("code=")[1].split("&")[0]

        # 4. Token Exchange via Form Data
        r4 = await client.post(
            "/api/v1/mcp/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": c_id,
                "code": code,
                "redirect_uri": "https://chatgpt.com/callback",
                "code_verifier": "test_challenge"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        print("[4] Token Exchange:", r4.status_code, r4.text)

if __name__ == "__main__":
    asyncio.run(main())
