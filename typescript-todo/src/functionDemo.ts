import {
  bindMethod,
  describeTask,
  describeWithCall,
  longestTaskLength,
  makeLogger,
  mapArrayLike,
  mergeTaskLists,
} from './functionUtils';
import type { Task } from './types';

const a: Task = { _id: '1', text: 'Buy milk', completed: false };
const b: Task = { _id: '2', text: 'Write TypeScript todo app', completed: true };

console.log('--- call ---');
console.log(describeWithCall(a, '>'));
console.log(describeTask.call(b, '>>'));
const arrayLike: ArrayLike<string> = { 0: 'x', 1: 'y', length: 2 };
console.log(mapArrayLike(arrayLike, (s) => s.toUpperCase()));

console.log('--- apply ---');
console.log('longest text length:', longestTaskLength([a, b]));
console.log('merged:', mergeTaskLists([a], [b]).map((t) => t.text));

console.log('--- bind ---');
const log = makeLogger('todo');
log('hello from a bound logger');
const send = (method: string, path: string) => `${method} ${path}`;
const postTo = bindMethod(send, 'POST');
console.log(postTo('/api/tasks'));
