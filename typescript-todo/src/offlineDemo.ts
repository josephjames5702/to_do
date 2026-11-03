import { TodoStore, weekdayHeading } from './todoStore';
import { makeLogger } from './functionUtils';
import type { Task } from './types';

const store = new TodoStore();
const log = makeLogger('offline');

// bind: the listener keeps its own `this` even though the store `call`s it.
function render(this: { name: string }, tasks: readonly Task[]): void {
  const line =
    tasks.map((t) => `${t.completed ? '[x]' : '[ ]'} ${t.text}`).join(' | ') ||
    'no tasks';
  console.log(`(${this.name}) ${line}`);
}
store.subscribe(render.bind({ name: 'view' }));

log(weekdayHeading());
const first = store.add('Learn call');
store.add('Learn apply');
store.add('Learn bind');
if (first) store.toggle(first._id);
store.remove('2');
