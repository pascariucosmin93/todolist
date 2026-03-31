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
    keycloak_realm: str = Field(default="todo-app", alias="KEYCLOAK_REALM")
    keycloak_frontend_client_id: str = Field(
        default="todo-frontend", alias="KEYCLOAK_FRONTEND_CLIENT_ID"
    )
    keycloak_issuer_url: str = Field(
        default="http://localhost:3000/auth/realms/todo-app", alias="KEYCLOAK_ISSUER_URL"
    )
    keycloak_jwks_url: str = Field(
        default="http://keycloak:8080/auth/realms/todo-app/protocol/openid-connect/certs",
        alias="KEYCLOAK_JWKS_URL",
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
