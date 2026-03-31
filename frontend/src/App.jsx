import { useEffect, useState } from "react";

import TodoList from "./components/TodoList";
import keycloak from "./keycloak";

const runtimeConfig = window.__APP_CONFIG__ || {};
const apiUrl = runtimeConfig.VITE_API_URL || import.meta.env.VITE_API_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${keycloak.token}`,
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

  useEffect(() => {
    keycloak
      .init({
        onLoad: "login-required",
        pkceMethod: "S256",
        checkLoginIframe: false,
      })
      .then(async (authenticated) => {
        if (!authenticated) {
          setError("Autentificarea a esuat.");
          return;
        }

        const refreshInterval = window.setInterval(() => {
          keycloak.updateToken(30).catch(() => keycloak.login());
        }, 20000);

        window.addEventListener("beforeunload", () => window.clearInterval(refreshInterval), {
          once: true,
        });

        try {
          await loadProfile();
          await loadTodos();
          setReady(true);
        } catch {
          setError("Nu am putut initializa sesiunea aplicatiei.");
        }
      })
      .catch(() => setError("Keycloak nu a putut fi initializat."));
  }, []);

  async function loadProfile() {
    const response = await fetch(`${apiUrl}/me`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error("Nu am putut incarca profilul.");
    }

    const data = await response.json();
    setProfile(data);
  }

  async function loadTodos() {
    const response = await fetch(`${apiUrl}/todos`, {
      headers: authHeaders(),
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
      headers: authHeaders(),
      body: JSON.stringify({ title, description: description || null }),
    });

    if (!response.ok) {
      setError("Crearea task-ului a esuat.");
      return;
    }

    setTitle("");
    setDescription("");
    await loadTodos();
  }

  async function toggleTodo(todo) {
    const response = await fetch(`${apiUrl}/todos/${todo.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ completed: !todo.completed }),
    });

    if (!response.ok) {
      setError("Actualizarea task-ului a esuat.");
      return;
    }

    await loadTodos();
  }

  async function deleteTodo(todoId) {
    const response = await fetch(`${apiUrl}/todos/${todoId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!response.ok) {
      setError("Stergerea task-ului a esuat.");
      return;
    }

    await loadTodos();
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
          <h1>Task-uri simple, login prin Keycloak</h1>
          <p className="hero-copy">
            Utilizator autentificat: <strong>{profile?.preferred_username}</strong>
          </p>
        </div>
        <button className="secondary-button" onClick={() => keycloak.logout()} type="button">
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
