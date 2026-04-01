from fastapi import Depends, Header, HTTPException, status

from app.core.config import Settings, get_settings

LOCAL_USER = {
    "sub": "local-user",
    "preferred_username": "devops",
    "email": None,
}


def get_current_user(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
):
    expected_header = f"Bearer {settings.app_session_token}"
    if authorization != expected_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    return LOCAL_USER
