import { useEffect, useState } from "react";

import TodoList from "./components/TodoList";
import { authManager, completeSigninIfNeeded } from "./auth";

const runtimeConfig = window.__APP_CONFIG__ || {};
const apiUrl = runtimeConfig.VITE_API_URL || import.meta.env.VITE_API_URL;

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await completeSigninIfNeeded();
        const user = await authManager.getUser();
        if (!user || user.expired) {
          await authManager.signinRedirect();
          return;
        }
        setAccessToken(user.access_token);
        try {
          await loadProfile(user.access_token);
          await loadTodos(user.access_token);
          setReady(true);
        } catch {
          setError("Nu am putut initializa sesiunea aplicatiei.");
        }
      } catch {
        setError("OIDC authentication could not be initialized.");
      }
    })();
  }, []);

  async function loadProfile(token) {
    const response = await fetch(`${apiUrl}/me`, {
      headers: authHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Nu am putut incarca profilul.");
    }

    const data = await response.json();
    setProfile(data);
  }

  async function loadTodos(token) {
    const response = await fetch(`${apiUrl}/todos`, {
      headers: authHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Nu am putut incarca task-urile.");
    }

    const data = await response.json();
    setTodos(data);
  }

  async function createTodo(event) {
    event.preventDefault();
    setError("");

    const response = await fetch(`${apiUrl}/todos`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ title, description: description || null }),
    });

    if (!response.ok) {
      setError("Crearea task-ului a esuat.");
      return;
    }

    setTitle("");
    setDescription("");
    await loadTodos(accessToken);
  }

  async function toggleTodo(todo) {
    const response = await fetch(`${apiUrl}/todos/${todo.id}`, {
      method: "PUT",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ completed: !todo.completed }),
    });

    if (!response.ok) {
      setError("Actualizarea task-ului a esuat.");
      return;
    }

    await loadTodos(accessToken);
  }

  async function deleteTodo(todoId) {
    const response = await fetch(`${apiUrl}/todos/${todoId}`, {
      method: "DELETE",
      headers: authHeaders(accessToken),
    });

    if (!response.ok) {
      setError("Stergerea task-ului a esuat.");
      return;
    }

    await loadTodos(accessToken);
  }

  if (error) {
    return <main className="page-shell error-shell">{error}</main>;
  }

  if (!ready) {
    return <main className="page-shell">Se incarca aplicatia...</main>;
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Todo Platform</p>
          <h1>Task-uri simple, login securizat</h1>
          <p className="hero-copy">
            Utilizator autentificat: <strong>{profile?.preferred_username}</strong>
          </p>
        </div>
        <button
          className="secondary-button"
          onClick={() => authManager.signoutRedirect()}
          type="button"
        >
          Logout
        </button>
      </section>

      <section className="content-grid">
        <form className="form-card" onSubmit={createTodo}>
          <h2>Adauga task</h2>
          <label>
            Titlu
            <input
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Scrie task-ul"
              required
              type="text"
              value={title}
            />
          </label>
          <label>
            Descriere
            <textarea
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Detalii optionale"
              rows="4"
              value={description}
            />
          </label>
          <button className="primary-button" type="submit">
            Salveaza
          </button>
        </form>

        <section className="list-card">
          <h2>Lista ta</h2>
          <TodoList todos={todos} onDelete={deleteTodo} onToggle={toggleTodo} />
        </section>
      </section>
    </main>
  );
}
