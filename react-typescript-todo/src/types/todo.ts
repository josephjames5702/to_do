export interface User {
  id: string;
  email: string;
}

export interface Task {
  _id: string;
  text: string;
  completed: boolean;
}

export type AuthMode = 'login' | 'register';

export type Filter = 'all' | 'active' | 'completed';
