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
    oidc_client_id: str = Field(default="todo-frontend", alias="OIDC_CLIENT_ID")
    oidc_issuer_url: str = Field(
        default="https://auth.todo.local/application/o/todo-app/", alias="OIDC_ISSUER_URL"
    )
    oidc_jwks_url: str = Field(
        default="https://auth.todo.local/application/o/todo-app/jwks/",
        alias="OIDC_JWKS_URL",
    )

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
