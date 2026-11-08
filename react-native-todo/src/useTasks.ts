import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from './api';
import type { Task } from './types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const r = await apiRequest<{ tasks: Task[] }>('/api/tasks');
    setTasks(r.tasks);
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refresh]);

  const addTask = async (text: string) => {
    const r = await apiRequest<{ task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    setTasks((t) => [...t, r.task]);
  };

  const toggleTask = async (task: Task) => {
    const r = await apiRequest<{ task: Task }>(`/api/tasks/${task._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: !task.completed }),
    });
    setTasks((t) => t.map((x) => (x._id === task._id ? r.task : x)));
  };

  const deleteTask = async (id: string) => {
    await apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks((t) => t.filter((x) => x._id !== id));
  };

  return { tasks, loading, addTask, toggleTask, deleteTask };
}
