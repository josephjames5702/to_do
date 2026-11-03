import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import type { Task, User } from '../types/todo';

/** Task functionality (load, add, toggle, remove) backed by the Express API. */
export function useTodos(user: User | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }
    let cancelled = false;
    setError('');
    apiRequest<{ tasks: Task[] }>('/api/tasks')
      .then(({ tasks: saved }) => !cancelled && setTasks(saved))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function run(action: () => Promise<void>) {
    setError('');
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const addTask = (text: string) =>
    run(async () => {
      const { task } = await apiRequest<{ task: Task }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setTasks((current) => [...current, task]);
    });

  const toggleTask = (task: Task) =>
    run(async () => {
      const { task: updated } = await apiRequest<{ task: Task }>(
        `/api/tasks/${task._id}`,
        { method: 'PATCH', body: JSON.stringify({ completed: !task.completed }) }
      );
      setTasks((current) =>
        current.map((t) => (t._id === updated._id ? updated : t))
      );
    });

  const removeTask = (id: string) =>
    run(async () => {
      await apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks((current) => current.filter((t) => t._id !== id));
    });

  return { tasks, error, addTask, toggleTask, removeTask };
}
