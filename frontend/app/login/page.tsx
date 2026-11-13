'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/i18n';
import { Page, ErrorText } from '@/components/ui';

export default function Login() {
  const { t } = useLang(); const { login } = useAuth(); const r = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState<any>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    try { const res = await api('/auth/login', { body: { email, password } }); await login(res.token); r.push(res.user.role === 'customer' ? '/portal' : '/admin'); } catch (x) { setErr(x); }
  };
  return (<Page title={t('auth.login')} narrow><form onSubmit={submit}>
    <label>{t('f.email')}<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
    <label>{t('f.password')}<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
    <ErrorText e={err} /><p><button className="btn">{t('nav.login')}</button> <Link href="/register">{t('nav.register')}</Link></p></form></Page>);
}
