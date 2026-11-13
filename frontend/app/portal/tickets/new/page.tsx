'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { Guard, Page, ErrorText } from '@/components/ui';

export default function NewTicket() {
  const { t } = useLang(); const r = useRouter();
  const [f, setF] = useState({ type: 'change', title: '', description: '' }); const [err, setErr] = useState<any>(null);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setErr(null); try { const k = await api('/tickets', { body: f }); r.push(`/portal/tickets/${k.id}`); } catch (x) { setErr(x); } };
  return (<Guard><Page title={t('portal.new')} narrow><form onSubmit={submit}>
    <label>{t('f.type')}<select value={f.type} onChange={set('type')}><option value="change">Change</option><option value="bug">Bug</option><option value="support">Support</option><option value="new_feature">New feature</option></select></label>
    <label>{t('f.title')}<input required maxLength={200} value={f.title} onChange={set('title')} /></label>
    <label>{t('f.message')}<textarea required value={f.description} onChange={set('description')} /></label>
    <ErrorText e={err} /><p><button className="btn">{t('f.send')}</button></p></form></Page></Guard>);
}
