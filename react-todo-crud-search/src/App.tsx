import { useMemo, useState } from 'react';
import SearchBar from './components/SearchBar';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import { useTodos } from './useTodos';

export default function App() {
  const { todos, addTodo, updateTodo, deleteTodo } = useTodos();
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? todos.filter((t) => t.title.toLowerCase().includes(q)) : todos;
  }, [todos, query]);

  return (
    <main className="app">
      <h1>Todo List</h1>
      <TodoForm onAdd={addTodo} />
      <SearchBar value={query} onChange={setQuery} />
      <ul>
        {visible.map((t) => (
          <TodoItem key={t.id} todo={t} onUpdate={updateTodo} onDelete={deleteTodo} />
        ))}
      </ul>
      {visible.length === 0 && <p className="empty">{query ? 'No matches.' : 'No todos yet.'}</p>}
    </main>
  );
}
