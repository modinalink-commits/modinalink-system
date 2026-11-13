'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api, tokenStore } from './api';

export type User = { id: number; name: string; email: string; phone?: string; role: 'customer' | 'staff' | 'admin'; locale: string };
type Me = { user: User; grants: string[]; disclosure: { bn: string; en: string } };
const Ctx = createContext<{ me: Me | null; ready: boolean; login: (token: string) => Promise<void>; logout: () => Promise<void>; refresh: () => Promise<void> }>(
  { me: null, ready: false, login: async () => {}, logout: async () => {}, refresh: async () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(async () => {
    if (!tokenStore.get()) { setMe(null); setReady(true); return; }
    try { setMe(await api<Me>('/me')); } catch { tokenStore.clear(); setMe(null); }
    setReady(true);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const login = async (token: string) => { tokenStore.set(token); await refresh(); };
  const logout = async () => { try { await api('/auth/logout', { method: 'POST', body: {} }); } catch {} tokenStore.clear(); setMe(null); };
  return <Ctx.Provider value={{ me, ready, login, logout, refresh }}>{children}</Ctx.Provider>;
}
