import type { Task } from './types';

// ---------- call ----------
// `call` runs a function with a chosen `this` and arguments listed one by one.
export function describeTask(this: Task, prefix: string): string {
  return `${prefix} ${this.completed ? '[x]' : '[ ]'} ${this.text}`;
}

export function describeWithCall(task: Task, prefix: string): string {
  return describeTask.call(task, prefix);
}

/** Borrow Array.prototype.map for an array-like object using call. */
export function mapArrayLike<T, R>(
  arrayLike: ArrayLike<T>,
  fn: (item: T) => R
): R[] {
  return Array.prototype.map.call(arrayLike, fn) as R[];
}

// ---------- apply ----------
// `apply` runs a function with a chosen `this` and arguments as an array.
export function longestTaskLength(tasks: Task[]): number {
  const lengths = tasks.map((task) => task.text.length);
  return Math.max.apply(null, lengths.length ? lengths : [0]);
}

export function mergeTaskLists(first: Task[], ...rest: Task[][]): Task[] {
  const merged = first.slice();
  rest.forEach((list) => {
    Array.prototype.push.apply(merged, list);
  });
  return merged;
}

// ---------- bind ----------
// `bind` returns a new function with `this` (and optionally arguments) fixed.
export function makeLogger(label: string): (message: string) => void {
  function log(this: { label: string }, message: string): void {
    console.log(`[${this.label}] ${message}`);
  }
  return log.bind({ label });
}

/** Partial application: pre-fill the first argument (e.g. an HTTP method). */
export function bindMethod<A extends unknown[], R>(
  fn: (method: string, ...rest: A) => R,
  method: string
): (...rest: A) => R {
  return fn.bind(null, method) as (...rest: A) => R;
}
