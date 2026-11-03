import { useState } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import Button from './components/Button';
import FilterBar from './components/FilterBar';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { useAuth } from './hooks/useAuth';
import { useTodos } from './hooks/useTodos';
import type { Filter } from './types/todo';

export default function App() {
  const auth = useAuth();
  const { tasks, error: taskError, addTask, toggleTask, removeTask } = useTodos(
    auth.user
  );
  const [filter, setFilter] = useState<Filter>('all');

  const weekday = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
  }).format(new Date());

  if (auth.loading) {
    return (
      <main className="app">
        <p className="status-message">Loading your account...</p>
      </main>
    );
  }

  // Login / sign-up page keeps the original dark UI (styles in App.css).
  if (!auth.user) {
    return (
      <AuthForm
        submitting={auth.submitting}
        error={auth.error}
        onSubmit={auth.authenticate}
        onModeChange={() => auth.setError('')}
      />
    );
  }

  const visible = tasks.filter((task) =>
    filter === 'all' ? true : filter === 'active' ? !task.completed : task.completed
  );
  const error = auth.error || taskError;

  return (
    <main className="min-h-screen bg-[#020631] px-4 py-10">
      <div className="mx-auto max-w-xl space-y-5 rounded-2xl bg-[#0b1257] p-6 text-white shadow">
        <div className="flex items-center justify-end gap-3 text-sm text-slate-200">
          <span>{auth.user.email}</span>
          <Button variant="ghost" onClick={auth.logout}>
            Log out
          </Button>
        </div>

        <header className="text-center">
          <h1 className="text-3xl font-bold text-white">ToDo List</h1>
          <h2 className="text-slate-200">Whoop, it's {weekday} 🌝 ☕</h2>
        </header>

        {error && (
          <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-red-700">
            {error}
          </p>
        )}

        <TodoForm onAdd={addTask} />
        <TodoList tasks={visible} onToggle={toggleTask} onRemove={removeTask} />
        <FilterBar
          filter={filter}
          onChange={setFilter}
          remaining={tasks.filter((task) => !task.completed).length}
        />
      </div>
    </main>
  );
}
