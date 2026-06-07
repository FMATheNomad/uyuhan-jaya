import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    database_url: str = "sqlite+aiosqlite:///./uyuhan.db"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30

    deepseek_api_key: Optional[str] = None
    deepseek_model: str = "deepseek-chat"

    env: str = "development"
    cors_origins: str = ""
    frontend_url: str = "http://localhost:5173"
    backend_url: str = ""

    port: int = 8000
    railway_public_domain: Optional[str] = None

    def check_secret(self) -> None:
        if not self.secret_key or self.secret_key == "change-me-in-production":
            raise ValueError("SECRET_KEY must be set to a secure random value")

    @property
    def effective_port(self) -> int:
        return int(os.getenv("PORT", self.port))

    @property
    def effective_cors_origins(self) -> list[str]:
        origins = []
        if self.cors_origins:
            origins.extend(self.cors_origins.split(","))
        if self.railway_public_domain:
            origins.append(f"https://{self.railway_public_domain}")
        if self.env == "development":
            origins.extend(["http://localhost:5173", "http://localhost:8000"])
        return origins or ["*"]

    @property
    def async_database_url(self) -> str:
        return self.database_url

    @property
    def sync_database_url(self) -> str:
        return self.database_url.replace("+asyncpg", "").replace("+aiosqlite", "")


settings = Settings()
