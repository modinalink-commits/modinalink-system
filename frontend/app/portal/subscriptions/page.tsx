'use client';
import { useEffect, useState } from 'react';
import { api, bdt } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { Guard, Page, Status } from '@/components/ui';

export default function Subs() {
  const { t } = useLang(); const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => { api('/subscriptions').then(setRows).catch(() => setRows([])); }, []);
  return (<Guard><Page title={t('portal.subs')}>{!rows ? <p>{t('loading')}</p> : rows.length === 0 ? <p className="muted">{t('portal.none')}</p> :
    <div className="tbl"><table><tbody>{rows.map((s) => <tr key={s.id}><td>{s.name}</td><td>{s.renews_on?.slice(0, 10)}</td><td>{bdt(s.amount_bdt)}</td><td><Status s={s.status} /></td></tr>)}</tbody></table></div>}</Page></Guard>);
}
