import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Metaphor Context Engine"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"
    
    # Security
    METAPHOR_API_KEY: str = "metaphor_dev_secret_key_123"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgrespassword@localhost:5432/metaphor"
    
    # LLM Providers
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    
    # Integration Developer Tokens
    NOTION_INTEGRATION_TOKEN: str = ""
    GITHUB_PERSONAL_ACCESS_TOKEN: str = ""
    
    # Google Service Account JSON path
    GOOGLE_SERVICE_ACCOUNT_JSON_PATH: str = ""

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
