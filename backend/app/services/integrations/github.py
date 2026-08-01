import base64
import logging
from github import Github
from github.GithubException import GithubException

logger = logging.getLogger(__name__)

async def fetch_public_repository(repo_name: str, github_token: str | None = None) -> str:
    """
    Fetches the README and a summary of a GitHub repository.
    If github_token is provided, it acts as the authenticated user and can fetch private repos.
    """
    try:
        if github_token:
            g = Github(github_token)
        else:
            g = Github() # Unauthenticated fallback
            
        repo = g.get_repo(repo_name)
        
        content_summary = f"GitHub Repository: {repo.full_name}\n"
        content_summary += f"Description: {repo.description or 'No description'}\n"
        content_summary += f"Stars: {repo.stargazers_count}, Forks: {repo.forks_count}\n\n"
        
        try:
            readme = repo.get_readme()
            readme_content = base64.b64decode(readme.content).decode("utf-8")
            content_summary += f"--- README.md ---\n{readme_content}\n"
        except GithubException:
            content_summary += "--- README.md ---\n(No README found)\n"
            
        return content_summary
    except Exception as e:
        logger.error(f"Error fetching github repo {repo_name}: {e}")
        return f"Failed to fetch GitHub repository {repo_name}: {str(e)}"
