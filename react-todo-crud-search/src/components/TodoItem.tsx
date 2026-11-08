import { useState } from 'react';
import type { Todo } from '../types';

interface Props {
  todo: Todo;
  onUpdate: (id: string, changes: Partial<Omit<Todo, 'id'>>) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed) onUpdate(todo.id, { title: trimmed });
    else setDraft(todo.title);
    setEditing(false);
  };

  return (
    <li className="row item">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onUpdate(todo.id, { completed: !todo.completed })}
      />
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
      ) : (
        <span className={todo.completed ? 'done' : ''}>{todo.title}</span>
      )}
      <button onClick={() => (editing ? save() : setEditing(true))}>{editing ? 'Save' : 'Edit'}</button>
      <button className="danger" onClick={() => onDelete(todo.id)}>
        Delete
      </button>
    </li>
  );
}
