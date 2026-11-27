// Talking to this app's own server. The server holds the passcodes and the MasterAPI key.
const TOKEN_KEY = 'uj_token';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
};
export const setToken = (t: string) => {
  try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
};

/** fetch() that adds the sign-in token, and signs the person out if the server says it has expired. */
export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) window.dispatchEvent(new Event('uj_unauthorized'));
  return res;
}

export type LoginUser = { id: string; name: string; email: string; role: 'Admin' | 'Staff'; joinedDate: string };

/** Signs in with the server. Throws a message a person can read. */
export async function login(role: 'Admin' | 'Staff', passcode: string): Promise<LoginUser> {
  let res: Response;
  try {
    res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, passcode }) });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token) throw new Error(data.error || 'Sign-in failed.');
  setToken(data.token);
  return data.user as LoginUser;
}

export function logout() {
  setToken('');
  try { localStorage.removeItem('uj_user'); } catch { /* storage unavailable */ }
}
