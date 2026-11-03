import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AuthMode } from '../types/todo';
import Button from './Button';

interface AuthFormProps {
  submitting: boolean;
  error: string;
  onSubmit: (mode: AuthMode, email: string, password: string) => Promise<void>;
  onModeChange: () => void;
}

/** The login / sign-up page from the original app. */
export default function AuthForm({
  submitting,
  error,
  onSubmit,
  onModeChange,
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(mode, email, password);
    setPassword('');
  }

  return (
    <main className="app auth-app">
      <header className="heading">
        <h1>ToDo List</h1>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
      </header>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          autoComplete="email"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
        <label htmlFor="password">Password</label>
        <input
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          id="password"
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <Button variant="auth" disabled={submitting} type="submit">
          {submitting
            ? 'Please wait...'
            : mode === 'login'
              ? 'Log in'
              : 'Create account'}
        </Button>
      </form>
      <p className="auth-switch">
        {mode === 'login' ? "Don't have an account?" : 'Already a user?'}{' '}
        <Button
          variant="link"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            onModeChange();
          }}
        >
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </Button>
      </p>
      <p className="auth-help">
        In demo mode, log in with <code>todo.demo@example.com</code> /{' '}
        <code>TodoDemo123!</code>. With MongoDB, choose <strong>Sign up</strong>{' '}
        to create an account.
      </p>
    </main>
  );
}
