from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoRead, TodoUpdate

router = APIRouter(prefix="/api/v1")


@router.get("/health")
def healthcheck():
    return {"status": "ok"}


@router.post("/login")
def login(payload: dict, settings: Settings = Depends(get_settings)):
    username = payload.get("username", "")
    password = payload.get("password", "")

    if username != settings.app_login_username or password != settings.app_login_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    return {
        "access_token": settings.app_session_token,
        "token_type": "bearer",
        "user": {
            "sub": "local-user",
            "preferred_username": settings.app_login_username,
            "email": None,
        },
    }


@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {
        "sub": current_user["sub"],
        "preferred_username": current_user["preferred_username"],
        "email": current_user["email"],
    }


@router.get("/todos", response_model=list[TodoRead])
def list_todos(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    stmt = select(Todo).order_by(Todo.created_at.desc(), Todo.id.desc())
    return db.scalars(stmt).all()


@router.post("/todos", response_model=TodoRead, status_code=status.HTTP_201_CREATED)
def create_todo(
    payload: TodoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    todo = Todo(
        title=payload.title,
        description=payload.description,
        owner_sub=current_user["sub"],
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@router.put("/todos/{todo_id}", response_model=TodoRead)
def update_todo(
    todo_id: int,
    payload: TodoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    todo = db.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found.")

    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(todo, key, value)

    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@router.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    todo = db.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found.")

    db.delete(todo)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
