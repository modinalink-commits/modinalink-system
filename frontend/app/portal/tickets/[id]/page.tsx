'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { Guard, Page, Status, ErrorText } from '@/components/ui';

export default function TicketView() {
  const { id } = useParams<{ id: string }>(); const { t, lang } = useLang();
  const [d, setD] = useState<any>(null); const [body, setBody] = useState(''); const [err, setErr] = useState<any>(null);
  const load = useCallback(() => api(`/tickets/${id}`).then(setD).catch(setErr), [id]);
  useEffect(() => { load(); }, [load]);
  const send = async (e: React.FormEvent) => { e.preventDefault(); setErr(null); try { await api(`/tickets/${id}/messages`, { body: { body } }); setBody(''); load(); } catch (x) { setErr(x); } };
  return (<Guard><Page>{!d ? <p>{t('loading')}</p> : (<>
    <h1>{d.ticket.number} · {d.ticket.title}</h1><p><Status s={d.ticket.status} /></p>
    {d.ticket.staging_url && <p><a className="btn sm" href={d.ticket.staging_url} target="_blank" rel="noreferrer">{t('ticket.preview')}</a></p>}
    <p>{d.ticket.description}</p>
    <h2>{t('ticket.timeline')}</h2><ul>{d.events.map((e: any, i: number) => <li key={i}><Status s={e.to_status} /> <small className="muted">{new Date(e.created_at).toLocaleString()}</small></li>)}</ul>
    <div>{d.messages.map((m: any) => (<div key={m.id} className={'msg' + (m.from_team ? ' team' : '')}><strong>{m.author}</strong> <small>{new Date(m.created_at).toLocaleString()}</small><div>{m.body}</div>
      {m.from_team && m.ai_assisted && <small className="muted">{d.disclosure[lang]}</small>}</div>))}</div>
    <form onSubmit={send}><label>{t('ticket.reply')}<textarea required value={body} onChange={(e) => setBody(e.target.value)} /></label><ErrorText e={err} /><p><button className="btn">{t('f.send')}</button></p></form>
  </>)}</Page></Guard>);
}
