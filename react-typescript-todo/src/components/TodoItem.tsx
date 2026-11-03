import type { Task } from '../types/todo';
import Button from './Button';

interface TodoItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onRemove: (id: string) => void;
}

export default function TodoItem({ task, onToggle, onRemove }: TodoItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-[#020631] shadow-sm">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        className="h-4 w-4 accent-[#020631]"
      />
      <span
        className={`flex-1 ${task.completed ? 'text-slate-400 line-through' : ''}`}
      >
        {task.text}
      </span>
      <Button
        variant="danger"
        aria-label={`Remove ${task.text}`}
        onClick={() => onRemove(task._id)}
      >
        Delete
      </Button>
    </li>
  );
}
