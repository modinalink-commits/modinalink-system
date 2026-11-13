'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Page, Status, ErrorText } from '@/components/ui';

export default function AdminTicket() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<any>(null); const [err, setErr] = useState<any>(null);
  const [staging, setStaging] = useState(''); const [rollback, setRollback] = useState(''); const [note, setNote] = useState('');
  const [msg, setMsg] = useState(''); const [internal, setInternal] = useState(false); const [ai, setAi] = useState(false);
  const load = useCallback(() => api(`/admin/tickets/${id}`).then(setD).catch(setErr), [id]);
  useEffect(() => { load(); }, [load]);
  const go = async (to: string) => { setErr(null); try { await api(`/admin/tickets/${id}/transition`, { body: { to, note: note || undefined, staging_url: staging || undefined, rollback_point: rollback || undefined } }); setNote(''); load(); } catch (x) { setErr(x); } };
  const send = async (e: React.FormEvent) => { e.preventDefault(); setErr(null); try { await api(`/admin/tickets/${id}/messages`, { body: { body: msg, is_internal: internal, ai_assisted: ai } }); setMsg(''); load(); } catch (x) { setErr(x); } };
  if (!d) return <Page><p>…</p></Page>;
  const t = d.ticket;
  return (<Page><h1>{t.number} · {t.title}</h1><p><Status s={t.status} /> {t.user?.name} {t.user?.phone}</p><p>{t.description}</p>
    <h2>Next step</h2>
    <label>Staging URL<input value={staging} placeholder={t.staging_url || 'https://staging…'} onChange={(e) => setStaging(e.target.value)} /></label>
    <label>Rollback point (required to approve)<input value={rollback} placeholder={t.rollback_point || 'backup id / commit'} onChange={(e) => setRollback(e.target.value)} /></label>
    <label>Note<input value={note} onChange={(e) => setNote(e.target.value)} /></label>
    <p className="row">{d.allowed_next.map((s: string) => <button key={s} className="btn sm" onClick={() => go(s)}>{s.replace('_', ' ')}</button>)}</p>
    <ErrorText e={err} />
    <h2>Messages</h2>{t.messages.map((m: any) => <div key={m.id} className={'msg' + (m.is_internal ? ' team' : '')}><strong>{m.user?.name}</strong> {m.is_internal && <small>(internal)</small>}{m.ai_assisted && <small> (AI-assisted)</small>}<div>{m.body}</div></div>)}
    <form onSubmit={send}><textarea required value={msg} onChange={(e) => setMsg(e.target.value)} />
      <p className="row"><label><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} style={{ width: 'auto' }} /> Internal note</label>
        <label><input type="checkbox" checked={ai} onChange={(e) => setAi(e.target.checked)} style={{ width: 'auto' }} /> AI-assisted draft</label><button className="btn sm">Send</button></p></form>
  </Page>);
}
