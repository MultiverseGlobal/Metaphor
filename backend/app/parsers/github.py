import logging
from typing import List, Dict, Any
import httpx
from app.config import settings

logger = logging.getLogger("metaphor.parsers.github")

class GitHubParser:
    def __init__(self):
        self.headers = {
            "Accept": "application/vnd.github.v3+json"
        }
        if settings.GITHUB_PERSONAL_ACCESS_TOKEN:
            self.headers["Authorization"] = f"token {settings.GITHUB_PERSONAL_ACCESS_TOKEN}"

    async def fetch_documents(self) -> List[Dict[str, Any]]:
        """
        Fetch commits, issues, and README files. If token is not configured,
        returns mock commits and issues that tie into the Atlas/William temporal system.
        """
        if not settings.GITHUB_PERSONAL_ACCESS_TOKEN:
            logger.info("Using mock GitHub data (token not configured).")
            return self._get_mock_documents()

        try:
            # We will search/fetch repository issues and commits
            # In a real environment, you might query specific repos owned by the user.
            # Here we provide a general structure.
            documents = []
            async with httpx.AsyncClient() as client:
                # Mock-fetch repo structure or fetch a few public commits/issues from the user's repos
                # As a fallback, we fetch standard user repositories
                response = await client.get("https://api.github.com/user/repos", headers=self.headers)
                if response.status_code == 200:
                    repos = response.json()[:3]  # process first 3 repos
                    for repo in repos:
                        repo_name = repo.get("full_name")
                        
                        # Get Readme
                        readme_resp = await client.get(f"https://api.github.com/repos/{repo_name}/readme", headers=self.headers)
                        if readme_resp.status_code == 200:
                            import base64
                            content_b64 = readme_resp.json().get("content", "")
                            readme_text = base64.b64decode(content_b64).decode("utf-8", errors="ignore")
                            documents.append({
                                "id": f"github_readme_{repo_name}",
                                "title": f"GitHub Readme: {repo_name}",
                                "content": readme_text,
                                "source": "github",
                                "metadata": {
                                    "repo": repo_name,
                                    "url": repo.get("html_url"),
                                    "type": "readme"
                                }
                            })
                            
                        # Get Commits
                        commits_resp = await client.get(f"https://api.github.com/repos/{repo_name}/commits?per_page=5", headers=self.headers)
                        if commits_resp.status_code == 200:
                            commits = commits_resp.json()
                            for commit in commits:
                                sha = commit.get("sha")
                                commit_msg = commit.get("commit", {}).get("message", "")
                                author = commit.get("commit", {}).get("author", {}).get("name", "Unknown")
                                date = commit.get("commit", {}).get("author", {}).get("date", "")
                                documents.append({
                                    "id": f"github_commit_{sha}",
                                    "title": f"GitHub Commit: {commit_msg.splitlines()[0]}",
                                    "content": f"Commit by {author} on {date}\n\nSHA: {sha}\n\nMessage:\n{commit_msg}",
                                    "source": "github",
                                    "metadata": {
                                        "repo": repo_name,
                                        "sha": sha,
                                        "author": author,
                                        "date": date,
                                        "type": "commit"
                                    }
                                })
                return documents
        except Exception as e:
            logger.error(f"Error fetching GitHub documents: {e}")
            return self._get_mock_documents()

    def _get_mock_documents(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "github_commit_mock_1",
                "title": "GitHub Commit: feat: integrate docker db and run vector test scripts",
                "content": """Commit by Benjamin on 2026-07-15T18:00:00Z
                
SHA: a1b2c3d4e5f6
Repo: pseudonyms/atlas-io

Message:
feat: integrate docker db and run vector test scripts
- Adds docker-compose.yml configuration with postgres + pgvector.
- Implements test scripts to ensure cosine similarity retrieves correct context.
- Configures schema for local environment variables.""",
                "source": "github",
                "metadata": {
                    "repo": "pseudonyms/atlas-io",
                    "sha": "a1b2c3d4e5f6",
                    "author": "Benjamin",
                    "date": "2026-07-15T18:00:00Z",
                    "type": "commit"
                }
            },
            {
                "id": "github_commit_mock_2",
                "title": "GitHub Commit: fix: update pricing limit thresholds in William core rules",
                "content": """Commit by Benjamin on 2026-07-16T01:30:00Z
                
SHA: f6e5d4c3b2a1
Repo: pseudonyms/william

Message:
fix: update pricing limit thresholds in William core rules
- Modifies execution constraints configuration.
- Adjusts rate limiting settings to prevent API over-usage.
- Sets core target deployment to reflect the $500 monthly founder operating sprint pricing tier.""",
                "source": "github",
                "metadata": {
                    "repo": "pseudonyms/william",
                    "sha": "f6e5d4c3b2a1",
                    "author": "Benjamin",
                    "date": "2026-07-16T01:30:00Z",
                    "type": "commit"
                }
            },
            {
                "id": "github_issue_mock_1",
                "title": "GitHub Issue #12: William agent lacks pricing context from Atlas",
                "content": """Issue #12: William agent lacks pricing context from Atlas
Opened by: Benjamin on 2026-07-15T20:00:00Z
Status: Open

Description:
Currently, when William executes dev tasks (like launching test environments or deploying scripts), it has no awareness of the overall business constraint established in Atlas (namely, keeping costs under $100 for testing, or billing thresholds).

We need a centralized memory/context engine (Metaphor) that William and Atlas can both call to share pricing states, customer feedback, and roadmaps.

Proposed solution:
Build Metaphor context engine to manage all relational and temporal states.""",
                "source": "github",
                "metadata": {
                    "repo": "pseudonyms/william",
                    "issue_number": 12,
                    "author": "Benjamin",
                    "created_at": "2026-07-15T20:00:00Z",
                    "type": "issue"
                }
            }
        ]
