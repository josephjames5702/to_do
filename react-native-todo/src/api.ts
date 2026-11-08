import { API_URL } from './config';

/** Same contract as the web app's apiRequest; the session cookie is kept by the native network stack. */
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error(`Cannot reach the API at ${API_URL}. Is the server running?`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (response.status !== 204 && !contentType.includes('application/json')) {
    throw new Error('The API did not return JSON.');
  }

  const result = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    throw new Error(result?.error || 'Something went wrong. Please try again.');
  }
  return result as T;
}
