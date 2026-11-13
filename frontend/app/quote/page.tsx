'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { Page, ErrorText } from '@/components/ui';

export default function Quote() {
  const { t, lang } = useLang();
  const [f, setF] = useState({ name: '', email: '', phone: '', company: '', interest: '', message: '' });
  const [done, setDone] = useState(false); const [err, setErr] = useState<any>(null); const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await api('/leads', { body: { ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)), locale: lang } }); setDone(true); } catch (x) { setErr(x); }
    setBusy(false);
  };
  if (done) return <Page title={t('quote.title')} narrow><p className="ok">{t('quote.done')}</p></Page>;
  return (<Page title={t('quote.title')} narrow><p className="note">{t('quote.note')}</p>
    <form onSubmit={submit}>
      <label>{t('f.name')}<input required value={f.name} onChange={set('name')} /></label>
      <label>{t('f.email')}<input type="email" value={f.email} onChange={set('email')} /></label>
      <label>{t('f.phone')}<input inputMode="tel" value={f.phone} onChange={set('phone')} /></label>
      <label>{t('f.company')}<input value={f.company} onChange={set('company')} /></label>
      <label>{t('f.interest')}<input value={f.interest} onChange={set('interest')} /></label>
      <label>{t('f.message')}<textarea value={f.message} onChange={set('message')} /></label>
      <ErrorText e={err} /><p><button className="btn" disabled={busy}>{t('f.send')}</button></p>
    </form></Page>);
}
