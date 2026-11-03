import { TodoApiClient } from './apiClient';
import { TodoStore, weekdayHeading } from './todoStore';
import { makeLogger } from './functionUtils';

async function main(): Promise<void> {
  const log = makeLogger('api');
  const api = new TodoApiClient(process.env.API_URL);
  const store = new TodoStore();
  store.subscribe((tasks) => log(`${tasks.length} task(s)`));

  log(weekdayHeading());
  const user = await api.authenticate('login', {
    email: 'todo.demo@example.com',
    password: 'TodoDemo123!',
  });
  log(`logged in as ${user.email}`);

  store.replaceAll(await api.listTasks());
  const created = await api.addTask('Typed task from TypeScript');
  store.replaceAll(await api.listTasks());
  await api.setCompleted(created._id, true);
  log('toggled');
  await api.removeTask(created._id);
  store.replaceAll(await api.listTasks());
  await api.logout();
  log(`after logout user = ${await api.currentUser()}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
