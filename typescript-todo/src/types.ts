export interface User {
  id: string;
  email: string;
}

export interface Task {
  _id: string;
  text: string;
  completed: boolean;
}

export interface Credentials {
  email: string;
  password: string;
}

export type AuthMode = 'login' | 'register';

export interface UserResponse {
  user: User;
}
export interface TaskResponse {
  task: Task;
}
export interface TasksResponse {
  tasks: Task[];
}
export interface ErrorResponse {
  error: string;
}

export type Listener<T> = (value: T) => void;
