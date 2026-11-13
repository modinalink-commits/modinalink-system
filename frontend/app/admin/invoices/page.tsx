'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, bdt } from '@/lib/api';
import { Page, Status, ErrorText } from '@/components/ui';

export default function AdminInvoices() {
  const [rows, setRows] = useState<any[]>([]); const [err, setErr] = useState<any>(null);
  const [f, setF] = useState({ user_id: '', description: '', qty: '1', unit_bdt: '' });
  const load = useCallback(() => api('/admin/invoices').then((r) => setRows(r.data)).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);
  const create = async (e: React.FormEvent) => { e.preventDefault(); setErr(null); try {
    await api('/admin/invoices', { body: { user_id: Number(f.user_id), items: [{ description: f.description, qty: Number(f.qty), unit_bdt: Number(f.unit_bdt) }] } }); setF({ user_id: '', description: '', qty: '1', unit_bdt: '' }); load(); } catch (x) { setErr(x); } };
  const act = async (id: number, a: string) => { setErr(null); try { await api(`/admin/invoices/${id}/${a}`, { method: 'POST', body: {} }); load(); } catch (x) { setErr(x); } };
  return (<Page title="Invoices (BDT)">
    <form onSubmit={create} className="card"><div className="row">
      <input required placeholder="Customer user id" value={f.user_id} onChange={(e) => setF({ ...f, user_id: e.target.value })} style={{ width: 150 }} />
      <input required placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} style={{ flex: 1, minWidth: 180 }} />
      <input required type="number" min={1} value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} style={{ width: 80 }} />
      <input required type="number" min={0} placeholder="Unit ৳" value={f.unit_bdt} onChange={(e) => setF({ ...f, unit_bdt: e.target.value })} style={{ width: 130 }} />
      <button className="btn sm">Create draft</button></div></form><ErrorText e={err} />
    <div className="tbl" style={{ marginTop: 12 }}><table><tbody>{rows.map((i) => <tr key={i.id}><td>{i.number}</td><td>{i.user?.name}</td><td>{bdt(i.total_bdt)}</td><td><Status s={i.status} /></td>
      <td className="row">{i.status === 'draft' && <button className="btn sm" onClick={() => act(i.id, 'issue')}>Issue</button>}{['draft', 'issued'].includes(i.status) && <button className="btn sm ghost" onClick={() => act(i.id, 'void')}>Void</button>}</td></tr>)}</tbody></table></div></Page>);
}
