'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/i18n';
import { Page, ErrorText } from '@/components/ui';

export default function Register() {
  const { t, lang } = useLang(); const { login } = useAuth(); const r = useRouter();
  const [f, setF] = useState({ name: '', email: '', phone: '', company: '', password: '' }); const [err, setErr] = useState<any>(null);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    try { const body = Object.fromEntries(Object.entries(f).filter(([, v]) => v)); const res = await api('/auth/register', { body: { ...body, locale: lang } }); await login(res.token); r.push('/portal'); } catch (x) { setErr(x); }
  };
  return (<Page title={t('auth.register')} narrow><form onSubmit={submit}>
    <label>{t('f.name')}<input required value={f.name} onChange={set('name')} /></label>
    <label>{t('f.email')}<input type="email" required autoComplete="email" value={f.email} onChange={set('email')} /></label>
    <label>{t('f.phone')}<input inputMode="tel" value={f.phone} onChange={set('phone')} /></label>
    <label>{t('f.company')}<input value={f.company} onChange={set('company')} /></label>
    <label>{t('f.password')}<input type="password" required minLength={8} autoComplete="new-password" value={f.password} onChange={set('password')} /></label>
    <ErrorText e={err} /><p><button className="btn">{t('nav.register')}</button></p></form></Page>);
}
