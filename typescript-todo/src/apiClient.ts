import type {
  AuthMode,
  Credentials,
  ErrorResponse,
  Task,
  TaskResponse,
  TasksResponse,
  User,
  UserResponse,
} from './types';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/** Typed client for the existing Node/Express to-do API (session cookie auth). */
export class TodoApiClient {
  private cookie = '';

  constructor(private readonly baseUrl = 'http://localhost:5000') {}

  private async request<T>(
    method: Method,
    path: string,
    body?: unknown
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(this.baseUrl + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.cookie ? { Cookie: this.cookie } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new Error('Cannot reach the Node API. Is "npm run dev" running?');
    }

    const setCookie = response.headers.getSetCookie();
    if (setCookie.length) {
      this.cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
    }

    if (response.status === 204) return undefined as T;
    const data = (await response.json()) as T | ErrorResponse;
    if (!response.ok) {
      throw new Error(
        (data as ErrorResponse).error || 'Something went wrong. Please try again.'
      );
    }
    return data as T;
  }

  // bind pre-fills `this` and the HTTP method, giving one helper per verb.
  // (bind erases generics, so the response type is restored with a cast.)
  private get = <T>(path: string) =>
    this.request.bind(this, 'GET')(path) as Promise<T>;
  private post = <T>(path: string, body?: unknown) =>
    this.request.bind(this, 'POST')(path, body) as Promise<T>;
  private patch = <T>(path: string, body?: unknown) =>
    this.request.bind(this, 'PATCH')(path, body) as Promise<T>;
  private del = <T>(path: string) =>
    this.request.bind(this, 'DELETE')(path) as Promise<T>;

  async authenticate(mode: AuthMode, credentials: Credentials): Promise<User> {
    const result = await this.post<UserResponse>(`/api/auth/${mode}`, credentials);
    return result.user;
  }

  async currentUser(): Promise<User | null> {
    try {
      return (await this.get<UserResponse>('/api/auth/me')).user;
    } catch (error) {
      if (error instanceof Error && error.message === 'Not signed in.') return null;
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.post<void>('/api/auth/logout');
    this.cookie = '';
  }

  async listTasks(): Promise<Task[]> {
    return (await this.get<TasksResponse>('/api/tasks')).tasks;
  }

  async addTask(text: string): Promise<Task> {
    return (await this.post<TaskResponse>('/api/tasks', { text })).task;
  }

  async setCompleted(id: string, completed: boolean): Promise<Task> {
    return (await this.patch<TaskResponse>(`/api/tasks/${id}`, { completed }))
      .task;
  }

  async removeTask(id: string): Promise<void> {
    await this.del<void>(`/api/tasks/${id}`);
  }
}
