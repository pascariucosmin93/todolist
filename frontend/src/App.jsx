import { useEffect, useState } from "react";

import TodoList from "./components/TodoList";

const runtimeConfig = window.__APP_CONFIG__ || {};
const apiUrl = runtimeConfig.VITE_API_URL || import.meta.env.VITE_API_URL;
const jsonHeaders = { "Content-Type": "application/json" };
const tokenStorageKey = "todo-app-token";

function authHeaders(token) {
  return {
    ...jsonHeaders,
    Authorization: `Bearer ${token}`,
  };
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      const storedToken = window.localStorage.getItem(tokenStorageKey);
      if (!storedToken) {
        setReady(true);
        return;
      }

      try {
        setToken(storedToken);
        await loadProfile(storedToken);
        await loadTodos(storedToken);
        setReady(true);
      } catch {
        window.localStorage.removeItem(tokenStorageKey);
        setToken("");
        setReady(true);
      }
    })();
  }, []);

  async function loadProfile(accessToken) {
    const response = await fetch(`${apiUrl}/me`, {
      headers: authHeaders(accessToken),
    });

    if (!response.ok) {
      throw new Error("Nu am putut incarca profilul.");
    }

    const data = await response.json();
    setProfile(data);
  }

  async function loadTodos(accessToken) {
    const response = await fetch(`${apiUrl}/todos`, {
      headers: authHeaders(accessToken),
    });

    if (!response.ok) {
      throw new Error("Nu am putut incarca task-urile.");
    }

    const data = await response.json();
    setTodos(data);
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setError("Credentiale invalide.");
      return;
    }

    const data = await response.json();
    window.localStorage.setItem(tokenStorageKey, data.access_token);
    setToken(data.access_token);
    setProfile(data.user);
    await loadTodos(data.access_token);
  }

  function handleLogout() {
    window.localStorage.removeItem(tokenStorageKey);
    setToken("");
    setProfile(null);
    setTodos([]);
    setTitle("");
    setDescription("");
    setUsername("");
    setPassword("");
    setError("");
  }

  async function createTodo(event) {
    event.preventDefault();
    setError("");

    const response = await fetch(`${apiUrl}/todos`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ title, description: description || null }),
    });

    if (!response.ok) {
      setError("Crearea task-ului a esuat.");
      return;
    }

    setTitle("");
    setDescription("");
    await loadTodos(token);
  }

  async function toggleTodo(todo) {
    const response = await fetch(`${apiUrl}/todos/${todo.id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ completed: !todo.completed }),
    });

    if (!response.ok) {
      setError("Actualizarea task-ului a esuat.");
      return;
    }

    await loadTodos(token);
  }

  async function deleteTodo(todoId) {
    const response = await fetch(`${apiUrl}/todos/${todoId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });

    if (!response.ok) {
      setError("Stergerea task-ului a esuat.");
      return;
    }

    await loadTodos(token);
  }

  if (error) {
    return <main className="page-shell error-shell">{error}</main>;
  }

  if (!ready) {
    return <main className="page-shell">Se incarca aplicatia...</main>;
  }

  if (!token) {
    return (
      <main className="page-shell">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Todo Platform</p>
            <h1>Autentificare locala</h1>
            <p className="hero-copy">Intra cu userul si parola pentru a accesa lista de task-uri.</p>
          </div>
        </section>

        <section className="content-grid">
          <form className="form-card" onSubmit={handleLogin}>
            <h2>Login</h2>
            <label>
              User
              <input
                onChange={(event) => setUsername(event.target.value)}
                required
                type="text"
                value={username}
              />
            </label>
            <label>
              Parola
              <input
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
            <button className="primary-button" type="submit">
              Intra
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Todo Platform</p>
          <h1>Task-uri simple, autentificare locala</h1>
          <p className="hero-copy">
            Utilizator activ: <strong>{profile?.preferred_username}</strong>
          </p>
        </div>
        <button className="secondary-button" onClick={handleLogout} type="button">
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
