import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from './api';
import type { User } from './types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    apiRequest<{ user: User }>('/api/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const authenticate = useCallback(async (mode: 'login' | 'register', email: string, password: string) => {
    const r = await apiRequest<{ user: User }>(`/api/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(r.user);
  }, []);

  const logout = useCallback(async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return { user, checking, authenticate, logout };
}
