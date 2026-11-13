'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Page, Status } from '@/components/ui';

export default function AdminTickets() {
  const [rows, setRows] = useState<any[]>([]); const [status, setStatus] = useState('');
  useEffect(() => { api('/admin/tickets' + (status ? `?status=${status}` : '')).then((r) => setRows(r.data)).catch(() => {}); }, [status]);
  return (<Page title="Tickets">
    <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 240 }}><option value="">All</option>{['submitted', 'scope_review', 'needs_info', 'drafting', 'staging_ready', 'approved', 'deployed', 'closed', 'rejected'].map((s) => <option key={s}>{s}</option>)}</select>
    <div className="tbl" style={{ marginTop: 12 }}><table><tbody>{rows.map((k) => <tr key={k.id}><td><Link href={`/admin/tickets/${k.id}`}>{k.number}</Link></td><td>{k.title}</td><td>{k.user?.name}</td><td><Status s={k.status} /></td></tr>)}</tbody></table></div></Page>);
}
