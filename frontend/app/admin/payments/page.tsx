'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, bdt } from '@/lib/api';
import { Page, Status, ErrorText } from '@/components/ui';

export default function AdminPayments() {
  const [rows, setRows] = useState<any[]>([]); const [err, setErr] = useState<any>(null);
  const load = useCallback(() => api('/admin/payments').then((r) => setRows(r.data)).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);
  const act = async (id: number, a: string) => { setErr(null); try { await api(`/admin/payments/${id}/${a}`, { method: 'POST', body: {} }); load(); } catch (x) { setErr(x); } };
  return (<Page title="Payments"><p className="note">Verify a bank transfer only after matching it on the bank statement. Payments in “review” may have an amount mismatch.</p><ErrorText e={err} />
    <div className="tbl"><table><tbody>{rows.map((p) => <tr key={p.id}><td>{p.invoice?.number}</td><td>{p.user?.name}</td><td>{p.gateway}</td><td>{bdt(p.amount_bdt)}</td><td>{p.proof_reference}</td><td><Status s={p.status} /></td>
      <td className="row">{['review', 'pending'].includes(p.status) && <><button className="btn sm" onClick={() => act(p.id, 'verify')}>Verify</button><button className="btn sm ghost" onClick={() => act(p.id, 'reject')}>Reject</button></>}</td></tr>)}</tbody></table></div></Page>);
}
