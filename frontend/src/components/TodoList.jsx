export default function TodoList({ todos, onToggle, onDelete }) {
  if (!todos.length) {
    return (
      <div className="empty-state">
        <p>Nu ai task-uri inca.</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <article className="todo-card" key={todo.id}>
          <div className="todo-main">
            <label className="checkbox-row">
              <input
                checked={todo.completed}
                onChange={() => onToggle(todo)}
                type="checkbox"
              />
              <span className={todo.completed ? "todo-title done" : "todo-title"}>
                {todo.title}
              </span>
            </label>
            {todo.description ? <p className="todo-description">{todo.description}</p> : null}
          </div>
          <button className="danger-button" onClick={() => onDelete(todo.id)} type="button">
            Sterge
          </button>
        </article>
      ))}
    </div>
  );
}

