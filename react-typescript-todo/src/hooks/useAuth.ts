import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import type { AuthMode, User } from '../types/todo';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiRequest<{ user: User }>('/api/auth/me')
      .then(({ user: current }) => !cancelled && setUser(current))
      .catch((e: Error) => {
        if (!cancelled && e.message !== 'Not signed in.') setError(e.message);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function authenticate(mode: AuthMode, email: string, password: string) {
    setError('');
    setSubmitting(true);
    try {
      const result = await apiRequest<{ user: User }>(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(result.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    setError('');
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return { user, loading, submitting, error, setError, authenticate, logout };
}
