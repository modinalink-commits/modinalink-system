'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Page, ErrorText } from '@/components/ui';

const FIELDS: Record<string, string[]> = {
  sslcommerz: ['store_id', 'store_password'], bank: ['bank_name', 'account_name', 'account_number', 'branch'],
  bkash: ['app_key', 'app_secret', 'username', 'password'], nagad: ['merchant_id', 'public_key', 'private_key'], rocket: ['merchant_id', 'secret'], aamarpay: ['store_id', 'signature_key'],
};
const LIVE = ['sslcommerz', 'bank'];

function Gateway({ g, reload }: { g: any; reload: () => void }) {
  const [cred, setCred] = useState<Record<string, string>>({}); const [err, setErr] = useState<any>(null); const [saved, setSaved] = useState(false);
  const save = async (extra: object = {}) => { setErr(null); setSaved(false); try { await api(`/admin/gateways/${g.gateway}`, { method: 'PUT', body: { credentials: cred, ...extra } }); setCred({}); setSaved(true); reload(); } catch (x) { setErr(x); } };
  return (<div className="card"><h3>{g.gateway} <small className="muted">{g.mode}{g.enabled ? ' · enabled' : ''}</small></h3>
    {!LIVE.includes(g.gateway) && <p className="note">Driver not built yet. Needs merchant approval and the provider API documentation.</p>}
    {(FIELDS[g.gateway] || []).map((k) => <label key={k}>{k} {g.configured_keys.includes(k) && <small className="ok">✓ saved</small>}<input type="password" autoComplete="off" placeholder={g.configured_keys.includes(k) ? 'leave blank to keep' : ''} value={cred[k] || ''} onChange={(e) => setCred({ ...cred, [k]: e.target.value })} /></label>)}
    <div className="row" style={{ marginTop: 10 }}><button className="btn sm" onClick={() => save()}>Save</button>
      <button className="btn sm ghost" disabled={!LIVE.includes(g.gateway)} onClick={() => save({ enabled: !g.enabled })}>{g.enabled ? 'Disable' : 'Enable'}</button>
      <select value={g.mode} onChange={(e) => save({ mode: e.target.value })} style={{ width: 'auto' }}><option>sandbox</option><option>live</option></select></div>
    <ErrorText e={err} />{saved && <p className="ok">Saved</p>}</div>);
}

export default function Integrations() {
  const { me } = useAuth(); const [gws, setGws] = useState<any[]>([]); const [sms, setSms] = useState<any>({ url: '', method: 'POST', param_key: 'api_key', param_to: 'to', param_message: 'message', param_sender: 'sender_id', sender_id: '', success_contains: '' });
  const [apiKey, setApiKey] = useState(''); const [hasKey, setHasKey] = useState(false); const [to, setTo] = useState(''); const [err, setErr] = useState<any>(null); const [info, setInfo] = useState('');
  const load = useCallback(() => { api('/admin/gateways').then(setGws).catch(() => {}); api('/admin/sms/provider').then((r) => { setHasKey(!!r.has_api_key); if (r.url) setSms((s: any) => ({ ...s, ...r })); }).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);
  if (me?.user.role !== 'admin') return <Page><p>Admin only.</p></Page>;
  const saveSms = async () => { setErr(null); setInfo(''); try { const { has_api_key, ...b } = sms; await api('/admin/sms/provider', { method: 'PUT', body: { ...b, api_key: apiKey || undefined } }); setApiKey(''); setInfo('SMS provider saved'); load(); } catch (x) { setErr(x); } };
  const test = async () => { setErr(null); setInfo(''); try { await api('/admin/sms/test', { body: { to } }); setInfo('Test SMS queued. Check the SMS log.'); } catch (x) { setErr(x); } };
  const f = (k: string, label: string) => <label>{label}<input value={sms[k] || ''} onChange={(e) => setSms({ ...sms, [k]: e.target.value })} /></label>;
  return (<Page title="SMS & Payment"><p className="note">Secrets are write-only: they are never shown again after saving.</p>
    <h2>SMS provider</h2><div className="card">{f('url', 'API URL')}
      <label>Method<select value={sms.method} onChange={(e) => setSms({ ...sms, method: e.target.value })}><option>POST</option><option>GET</option></select></label>
      <label>API key {hasKey && <small className="ok">✓ saved</small>}<input type="password" autoComplete="off" placeholder={hasKey ? 'leave blank to keep' : ''} value={apiKey} onChange={(e) => setApiKey(e.target.value)} /></label>
      {f('sender_id', 'Sender ID')}{f('param_key', 'Param name: key')}{f('param_to', 'Param name: number')}{f('param_message', 'Param name: message')}{f('param_sender', 'Param name: sender')}{f('success_contains', 'Success text in response (optional)')}
      <p className="row"><button className="btn sm" onClick={saveSms}>Save</button></p>
      <label>Test number (01XXXXXXXXX)<input value={to} onChange={(e) => setTo(e.target.value)} /></label><p><button className="btn sm ghost" onClick={test}>Send test SMS</button></p></div>
    <ErrorText e={err} />{info && <p className="ok">{info}</p>}
    <h2>Payment gateways</h2><div className="grid">{gws.map((g) => <Gateway key={g.gateway} g={g} reload={load} />)}</div></Page>);
}
