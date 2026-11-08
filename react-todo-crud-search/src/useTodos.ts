import { useEffect, useState } from 'react';
import type { Todo } from './types';

const KEY = 'todo-crud-search';

function load(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Todo[];
  } catch {
    return [];
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(todos));
  }, [todos]);

  // Create
  const addTodo = (title: string) =>
    setTodos((t) => [{ id: crypto.randomUUID(), title, completed: false }, ...t]);

  // Update
  const updateTodo = (id: string, changes: Partial<Omit<Todo, 'id'>>) =>
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, ...changes } : x)));

  // Delete
  const deleteTodo = (id: string) => setTodos((t) => t.filter((x) => x.id !== id));

  return { todos, addTodo, updateTodo, deleteTodo };
}
