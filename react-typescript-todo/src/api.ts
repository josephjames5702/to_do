/** Typed fetch wrapper for the Express API (same behaviour as the original app). */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error(
      'Cannot reach the Node API. Make sure the server is running on port 5000.'
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (response.status !== 204 && !contentType.includes('application/json')) {
    throw new Error('The Node API did not return JSON.');
  }

  const result = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(result?.error || 'Something went wrong. Please try again.');
  }

  return result as T;
}
