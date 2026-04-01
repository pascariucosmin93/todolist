from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Todo API"
    database_url: str = Field(
        default="postgresql+psycopg://todos:todos@localhost:5432/todos",
        alias="DATABASE_URL",
    )
    cors_origins: list[str] = Field(default=["http://localhost:3000"], alias="CORS_ORIGINS")
    app_login_username: str = Field(default="", alias="APP_LOGIN_USERNAME")
    app_login_password: str = Field(default="", alias="APP_LOGIN_PASSWORD")
    app_session_token: str = Field(default="change-me-session-token", alias="APP_SESSION_TOKEN")

    model_config = SettingsConfigDict(case_sensitive=False, env_file=".env", extra="ignore")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
