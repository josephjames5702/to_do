import { useState, type FormEvent } from 'react';

export default function TodoForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle('');
  };

  return (
    <form className="row" onSubmit={submit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a todo…" />
      <button type="submit">Add</button>
    </form>
  );
}
