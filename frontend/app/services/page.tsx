'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { Page } from '@/components/ui';

export default function Services() {
  const { t, lang } = useLang();
  const [list, setList] = useState<any[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { api('/services').then(setList).catch(() => setErr(true)); }, []);
  return (<Page title={t('services.title')}>
    {err && <p className="error">{t('services.empty')}</p>}
    {!list && !err && <p>{t('loading')}</p>}
    <div className="grid">{list?.map((s) => <div className="card" key={s.id}><h3>{lang === 'bn' ? s.title_bn : s.title_en}</h3><p>{lang === 'bn' ? s.summary_bn : s.summary_en}</p></div>)}</div>
  </Page>);
}
