const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  status: number; errors?: Record<string, string[]>;
  constructor(m: string, status: number, errors?: Record<string, string[]>) { super(m); this.status = status; this.errors = errors; }
}

export const tokenStore = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem('ml_token')),
  set: (t: string) => localStorage.setItem('ml_token', t),
  clear: () => localStorage.removeItem('ml_token'),
};

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const t = tokenStore.get();
  const res = await fetch(BASE + path, {
    method: opts.method || (opts.body ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || 'Request failed', res.status, data.errors);
  return data as T;
}

export const bdt = (n: number | null | undefined) => (n == null ? '—' : '৳' + Number(n).toLocaleString('en-BD'));
