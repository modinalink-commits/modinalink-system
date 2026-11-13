'use client';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function Home() {
  const { t } = useLang();
  return (<>
    <section className="hero"><div className="wrap"><h1>{t('home.title')}</h1><p>{t('home.sub')}</p>
      <p><Link className="btn" href="/quote">{t('home.cta')}</Link></p></div></section>
    <main className="wrap page"><h2>{t('home.how')}</h2>
      <ol className="steps">{['home.s1', 'home.s2', 'home.s3', 'home.s4', 'home.s5'].map((k) => <li key={k}>{t(k)}</li>)}</ol></main>
  </>);
}
