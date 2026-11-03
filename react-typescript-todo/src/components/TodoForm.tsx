import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from './Button';

interface TodoFormProps {
  onAdd: (text: string) => void;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        aria-label="Add a task"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Add item..."
        maxLength={500}
        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[#020631] outline-none focus:border-white"
      />
      <Button type="submit">Add</Button>
    </form>
  );
}
