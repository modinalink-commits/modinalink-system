'use client';
import Link from 'next/link';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { t, lang, setLang } = useLang();
  const { me, logout } = useAuth();
  return (
    <header className="hdr"><div className="wrap hdr-in">
      <Link href="/" aria-label="ModinaLink"><img src="/brand/modinalink-horizontal-color.svg" alt="ModinaLink" height={36} /></Link>
      <nav>
        <Link href="/services">{t('nav.services')}</Link>
        <Link href="/prices">{t('nav.prices')}</Link>
        <Link href="/quote">{t('nav.quote')}</Link>
        {me ? (<>
          <Link href={me.user.role === 'customer' ? '/portal' : '/admin'}>{me.user.role === 'customer' ? t('nav.portal') : t('nav.admin')}</Link>
          <button className="lnk" onClick={logout}>{t('nav.logout')}</button>
        </>) : (<><Link href="/login">{t('nav.login')}</Link><Link href="/register" className="btn sm">{t('nav.register')}</Link></>)}
        <button className="lang" onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} aria-label="Language">{lang === 'bn' ? 'EN' : 'বাং'}</button>
      </nav>
    </div></header>
  );
}

export function Footer() {
  const { t } = useLang();
  return <footer className="ftr"><div className="wrap"><img src="/brand/modinalink-horizontal-white.svg" alt="ModinaLink" height={28} /><p>{t('footer.note')}</p></div></footer>;
}

export function Page({ title, children, narrow }: { title?: string; children: ReactNode; narrow?: boolean }) {
  return <main className={'wrap page' + (narrow ? ' narrow' : '')}>{title && <h1>{title}</h1>}{children}</main>;
}

/** Redirects to /login unless signed in (and, optionally, staff). */
export function Guard({ staff, children }: { staff?: boolean; children: ReactNode }) {
  const { me, ready } = useAuth();
  const { t } = useLang();
  const r = useRouter();
  useEffect(() => { if (ready && !me) r.replace('/login'); else if (ready && me && staff && me.user.role === 'customer') r.replace('/portal'); }, [ready, me, staff, r]);
  if (!ready || !me || (staff && me.user.role === 'customer')) return <Page><p>{t('loading')}</p></Page>;
  return <>{children}</>;
}

export function Status({ s }: { s: string }) { return <span className={'pill st-' + s}>{s.replace('_', ' ')}</span>; }
export function ErrorText({ e }: { e: any }) {
  if (!e) return null;
  const first = e.errors ? Object.values(e.errors as Record<string, string[]>)[0]?.[0] : null;
  return <p className="error" role="alert">{first || e.message}</p>;
}
