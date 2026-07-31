import asyncio
import httpx
import json

WEBHOOK_URL = "http://localhost:8000/api/v1/webhooks/github"
MCP_URL = "http://localhost:8000/mcp/tools/call"

async def run_simulation():
    print("==================================================")
    print(" METAPHOR E2E PROOF OF VALUE SIMULATION")
    print("==================================================")
    print("\n[1] Firing GitHub Webhook (Data Source -> Metaphor)...")
    
    # Simulate a GitHub push payload
    github_payload = {
        "repository": {"full_name": "MultiverseGlobal/Atlas"},
        "sender": {"login": "william"},
        "commits": [
            {
                "message": "feat: increase atlas token pricing to $500",
                "author": {"name": "William"}
            }
        ]
    }
    
    async with httpx.AsyncClient() as client:
        try:
            webhook_resp = await client.post(
                WEBHOOK_URL,
                json=github_payload,
                headers={"X-GitHub-Event": "push"}
            )
            print(f"    Webhook Status: {webhook_resp.status_code}")
            print(f"    Engine Report: {json.dumps(webhook_resp.json(), indent=2)}")
        except Exception as e:
            print(f"    [!] Failed to hit webhook. Is the backend running on port 8000? {e}")
            return
            
    print("\n[2] Waiting for Graph Synthesis...")
    await asyncio.sleep(2)
    
    print("\n[3] Firing MCP Request (AI Consumer -> Metaphor)...")
    # Simulate an AI model requesting context
    mcp_payload = {
        "name": "get_context",
        "arguments": {
            "query": "What is the latest on Atlas pricing?"
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            mcp_resp = await client.post(
                MCP_URL,
                json=mcp_payload
            )
            print(f"    MCP Status: {mcp_resp.status_code}")
            print("    MCP Context Package Retrieved:")
            print("--------------------------------------------------")
            print(json.dumps(mcp_resp.json(), indent=2))
            print("--------------------------------------------------")
        except Exception as e:
            print(f"    [!] Failed to hit MCP server. {e}")

if __name__ == "__main__":
    asyncio.run(run_simulation())
