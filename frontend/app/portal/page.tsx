'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/i18n';
import { Guard, Page, Status } from '@/components/ui';

export default function Portal() {
  const { t, lang } = useLang(); const { me } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => { api('/tickets').then((r) => setTickets(r.data)).catch(() => {}); }, []);
  return (<Guard><Page title={t('portal.title')}>
    <div className="row"><Link className="btn" href="/portal/tickets/new">{t('portal.new')}</Link>
      <Link className="btn ghost" href="/portal/invoices">{t('portal.invoices')}</Link><Link className="btn ghost" href="/portal/subscriptions">{t('portal.subs')}</Link></div>
    <h2>{t('portal.tickets')}</h2>
    {tickets.length === 0 ? <p className="muted">{t('portal.none')}</p> : <div className="tbl"><table><tbody>{tickets.map((k) => (
      <tr key={k.id}><td><Link href={`/portal/tickets/${k.id}`}>{k.number}</Link></td><td>{k.title}</td><td><Status s={k.status} /></td></tr>))}</tbody></table></div>}
    <h2>{t('portal.selfservice')}</h2><p className="note">{t('portal.selfservice.note')}</p>
    <p>{me?.grants.length ? me.grants.join(', ') : '—'}</p>
    <p className="muted">{me?.disclosure[lang]}</p>
  </Page></Guard>);
}
