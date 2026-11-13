'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api, bdt } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { Guard, Page, Status, ErrorText } from '@/components/ui';

export default function InvoiceView() {
  const { id } = useParams<{ id: string }>(); const q = useSearchParams(); const { t } = useLang();
  const [inv, setInv] = useState<any>(null); const [methods, setMethods] = useState<any[]>([]); const [err, setErr] = useState<any>(null);
  const [bank, setBank] = useState<any>(null); const [ref, setRef] = useState(''); const [sent, setSent] = useState(false);
  useEffect(() => { api(`/invoices/${id}`).then(setInv).catch(setErr); api('/payment-methods').then(setMethods).catch(() => {}); }, [id]);
  const pay = async (gateway: string) => {
    setErr(null);
    try { const r = await api(`/invoices/${id}/pay`, { body: { gateway } }); if (r.redirect_url) window.location.href = r.redirect_url; else if (r.instructions) setBank(r); } catch (x) { setErr(x); }
  };
  const submitRef = async (e: React.FormEvent) => { e.preventDefault(); setErr(null); try { await api(`/payments/${bank.payment_id}/bank-proof`, { body: { reference: ref } }); setSent(true); } catch (x) { setErr(x); } };
  const result = q.get('payment');
  return (<Guard><Page>{!inv ? <p>{t('loading')}</p> : (<>
    <h1>{inv.number}</h1><p><Status s={inv.status} /></p>
    {result && <p className={result === 'success' ? 'ok' : 'note'}>{t('inv.pay.' + result)}</p>}
    <div className="tbl"><table><tbody>{inv.items.map((i: any) => <tr key={i.id}><td>{i.description}</td><td>{i.qty} × {bdt(i.unit_bdt)}</td></tr>)}
      <tr><th>{t('inv.total')}</th><th>{bdt(inv.total_bdt)}</th></tr></tbody></table></div>
    {inv.status === 'issued' && (<><h2>{t('inv.methods')}</h2>
      <div className="row">{methods.map((m) => <button key={m.gateway} className="btn ghost" onClick={() => pay(m.gateway)}>{m.gateway}</button>)}</div>
      {methods.length === 0 && <p className="muted">—</p>}</>)}
    {bank && !sent && (<form onSubmit={submitRef}><h2>Bank</h2><div className="card">{Object.entries(bank.instructions).map(([k, v]) => <div key={k}><strong>{k}:</strong> {String(v)}</div>)}</div>
      <label>{t('inv.bank.ref')}<input required value={ref} onChange={(e) => setRef(e.target.value)} /></label><p><button className="btn">{t('f.send')}</button></p></form>)}
    {sent && <p className="ok">{t('inv.bank.sent')}</p>}
    <ErrorText e={err} />
  </>)}</Page></Guard>);
}
