from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoRead, TodoUpdate

router = APIRouter(prefix="/api/v1")


@router.get("/health")
def healthcheck():
    return {"status": "ok"}


@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {
        "sub": current_user["sub"],
        "preferred_username": current_user.get("preferred_username"),
        "email": current_user.get("email"),
    }


@router.get("/todos", response_model=list[TodoRead])
def list_todos(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    stmt = (
        select(Todo)
        .where(Todo.owner_sub == current_user["sub"])
        .order_by(Todo.created_at.desc(), Todo.id.desc())
    )
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
    if not todo or todo.owner_sub != current_user["sub"]:
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
    if not todo or todo.owner_sub != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found.")

    db.delete(todo)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

