'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, bdt } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { Guard, Page, Status } from '@/components/ui';

export default function Invoices() {
  const { t } = useLang(); const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => { api('/invoices').then((r) => setRows(r.data)).catch(() => setRows([])); }, []);
  return (<Guard><Page title={t('portal.invoices')}>{!rows ? <p>{t('loading')}</p> : rows.length === 0 ? <p className="muted">{t('portal.none')}</p> :
    <div className="tbl"><table><tbody>{rows.map((i) => <tr key={i.id}><td><Link href={`/portal/invoices/${i.id}`}>{i.number}</Link></td><td>{bdt(i.total_bdt)}</td><td><Status s={i.status} /></td></tr>)}</tbody></table></div>}</Page></Guard>);
}
