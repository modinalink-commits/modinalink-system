'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, bdt } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { Page } from '@/components/ui';

const BILL: Record<string, { bn: string; en: string }> = {
  yearly: { bn: 'বছরে', en: 'per year' }, monthly: { bn: 'মাসে', en: 'per month' }, one_time: { bn: 'এককালীন', en: 'one-time' },
  project: { bn: 'প্রজেক্ট', en: 'per project' }, hourly: { bn: 'ঘণ্টায়', en: 'per hour' }, per_unit: { bn: 'প্রতি ইউনিট', en: 'per unit' },
};

export default function Prices() {
  const { t, lang } = useLang();
  const [items, setItems] = useState<any[] | null>(null);
  useEffect(() => { api('/prices').then((r) => setItems(r.items)).catch(() => setItems([])); }, []);
  const groups: Record<string, any[]> = {};
  items?.forEach((i) => { (groups[lang === 'bn' ? i.group_bn : i.group_en] ||= []).push(i); });
  return (<Page title={t('prices.title')}>
    <p className="note">{t('prices.note')}</p>
    {!items && <p>{t('loading')}</p>}
    {items && items.length === 0 && <p>{t('prices.empty')} <Link href="/quote" className="btn sm">{t('nav.quote')}</Link></p>}
    {Object.entries(groups).map(([g, rows]) => (<section key={g}><h2>{g}</h2><div className="tbl"><table><tbody>
      {rows.map((i) => (<tr key={i.id}><td>{lang === 'bn' ? i.name_bn : i.name_en}<br /><small className="muted">{t(i.basis === 'market' ? 'prices.market' : 'prices.estimate')}</small></td>
        <td>{i.min_bdt != null && i.max_bdt != null && i.min_bdt !== i.max_bdt ? `${bdt(i.min_bdt)} – ${bdt(i.max_bdt)}` : bdt(i.min_bdt ?? i.max_bdt)}</td>
        <td className="muted">{BILL[i.billing]?.[lang]}</td></tr>))}
    </tbody></table></div></section>))}
  </Page>);
}
