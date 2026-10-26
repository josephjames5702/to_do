import { useEffect, useState } from 'react';
import './App.css';

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      'Cannot reach the Node API. In the my_app folder, stop the old server with Ctrl+C and run "npm run dev".'
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (response.status !== 204 && !contentType.includes('application/json')) {
    throw new Error(
      'The Node API did not return JSON. Stop the old server with Ctrl+C, then run "npm run dev" from the my_app folder.'
    );
  }

  const result = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(result?.error || 'Something went wrong. Please try again.');
  }

  return result;
}

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const weekday = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
  }).format(new Date());

  useEffect(() => {
    let cancelled = false;

    apiRequest('/api/auth/me')
      .then(({ user: currentUser }) => {
        if (!cancelled) {
          setUser(currentUser);
        }
      })
      .catch((requestError) => {
        if (!cancelled && requestError.message !== 'Not signed in.') {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAuthLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return undefined;
    }

    let cancelled = false;
    setError('');

    apiRequest('/api/tasks')
      .then(({ tasks: savedTasks }) => {
        if (!cancelled) {
          setTasks(savedTasks);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function submitAuth(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await apiRequest(`/api/auth/${authMode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(result.user);
      setPassword('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    setError('');

    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setTasks([]);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function addTask(event) {
    event.preventDefault();
    const text = newTask.trim();

    if (!text) {
      return;
    }

    setError('');

    try {
      const { task } = await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setTasks((currentTasks) => [...currentTasks, task]);
      setNewTask('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function toggleTask(task) {
    setError('');

    try {
      const { task: updatedTask } = await apiRequest(
        `/api/tasks/${task._id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ completed: !task.completed }),
        }
      );
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask._id === updatedTask._id ? updatedTask : currentTask
        )
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeTask(taskId) {
    setError('');

    try {
      await apiRequest(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== taskId)
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (authLoading) {
    return (
      <main className="app">
        <p className="status-message">Loading your account...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="app auth-app">
        <header className="heading">
          <h1>ToDo List</h1>
          <h2>{authMode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
        </header>
        <form className="auth-form" onSubmit={submitAuth}>
          <label htmlFor="email">Email</label>
          <input
            autoComplete="email"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <label htmlFor="password">Password</label>
          <input
            autoComplete={
              authMode === 'login' ? 'current-password' : 'new-password'
            }
            id="password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting
              ? 'Please wait...'
              : authMode === 'login'
                ? 'Log in'
                : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          {authMode === 'login' ? "Don't have an account?" : 'Already a user?'}{' '}
          <button
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
              setError('');
            }}
            type="button"
          >
            {authMode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
        <p className="auth-help">
          In demo mode, log in with <code>todo.demo@example.com</code> /{' '}
          <code>TodoDemo123!</code>. With MongoDB, choose <strong>Sign up</strong>{' '}
          to create an account.
        </p>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="heading">
        <div className="account-bar">
          <span>{user.email}</span>
          <button className="logout-button" onClick={logout} type="button">
            Log out
          </button>
        </div>
        <h1>ToDo List</h1>
        <h2>Whoop, it's {weekday} 🌝 ☕</h2>
      </header>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <form className="task-input" onSubmit={addTask}>
        <input
          aria-label="Add a task"
          maxLength={500}
          onChange={(event) => setNewTask(event.target.value)}
          placeholder="Add item..."
          required
          value={newTask}
        />
        <button aria-label="Add task" className="add-task" type="submit">
          +
        </button>
      </form>

      <ul className="todos">
        {tasks.map((task) => (
          <li className="todo" key={task._id}>
            <label className="task-label">
              <input
                checked={task.completed}
                onChange={() => toggleTask(task)}
                type="checkbox"
              />
              <span className={task.completed ? 'completed' : ''}>
                {task.text}
              </span>
            </label>
            <button
              aria-label={`Remove ${task.text}`}
              className="remove-task"
              onClick={() => removeTask(task._id)}
              type="button"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="task-display">
        {tasks.map((task) => (
          <p className={task.completed ? 'completed' : ''} key={task._id}>
            {task.text}
          </p>
        ))}
      </div>
    </main>
  );
}

export default App;
