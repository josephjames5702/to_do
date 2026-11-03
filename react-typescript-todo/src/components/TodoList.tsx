import type { Task } from '../types/todo';
import TodoItem from './TodoItem';

interface TodoListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onRemove: (id: string) => void;
}

export default function TodoList({ tasks, ...handlers }: TodoListProps) {
  if (tasks.length === 0) {
    return <p className="py-6 text-center text-slate-300">No tasks here.</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TodoItem key={task._id} task={task} {...handlers} />
      ))}
    </ul>
  );
}
