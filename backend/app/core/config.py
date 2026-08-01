import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Metaphor Context Engine"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"
    
    # Security
    METAPHOR_API_KEY: str = "metaphor_dev_secret_key_123"
    SECRET_KEY: str = "super_secret_key_change_me"
    ENCRYPTION_KEY: str = ""
    ALGORITHM: str = "HS256"
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgrespassword@localhost:5432/metaphor"
    
    # LLM Providers
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # Integration Developer Tokens
    NOTION_INTEGRATION_TOKEN: str = ""
    GITHUB_PERSONAL_ACCESS_TOKEN: str = ""
    
    # Supabase Settings
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""

    # OAuth Credentials
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    NOTION_CLIENT_ID: str = ""
    NOTION_CLIENT_SECRET: str = ""
    LINEAR_CLIENT_ID: str = ""
    LINEAR_CLIENT_SECRET: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # Google Service Account JSON path
    GOOGLE_SERVICE_ACCOUNT_JSON_PATH: str = ""

    # Redis and Security
    REDIS_URL: str = "redis://localhost:6379"
    ENCRYPTION_KEY: str = "" # Read from .env

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
