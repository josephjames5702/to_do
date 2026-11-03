import type { Listener, Task } from './types';

let nextId = 1;

/** In-memory to-do list: add, toggle, remove, plus subscribe/notify. */
export class TodoStore {
  private tasks: Task[] = [];
  private listeners: Listener<readonly Task[]>[] = [];

  getTasks(): readonly Task[] {
    return this.tasks;
  }

  add(text: string): Task | null {
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (trimmed.length > 500) {
      throw new Error('Task text must be 500 characters or fewer.');
    }
    const task: Task = { _id: String(nextId++), text: trimmed, completed: false };
    this.tasks = [...this.tasks, task];
    this.emit();
    return task;
  }

  toggle(id: string): Task | undefined {
    let updated: Task | undefined;
    this.tasks = this.tasks.map((task) => {
      if (task._id !== id) return task;
      updated = { ...task, completed: !task.completed };
      return updated;
    });
    if (updated) this.emit();
    return updated;
  }

  remove(id: string): boolean {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((task) => task._id !== id);
    const removed = this.tasks.length !== before;
    if (removed) this.emit();
    return removed;
  }

  replaceAll(tasks: Task[]): void {
    this.tasks = tasks;
    this.emit();
  }

  subscribe(listener: Listener<readonly Task[]>): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(): void {
    // `call` sets `this` of each listener to the store.
    this.listeners.forEach((listener) => listener.call(this, this.tasks));
  }
}

/** Greeting heading from the original app, e.g. "Whoop, it's Monday". */
export function weekdayHeading(date: Date = new Date()): string {
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(
    date
  );
  return `Whoop, it's ${weekday}`;
}
