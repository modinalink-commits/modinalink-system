import './globals.css';
import type { Metadata, Viewport } from 'next';
import { LangProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';
import { Header, Footer } from '@/components/ui';

export const metadata: Metadata = { title: { default: 'ModinaLink IT Solution', template: '%s | ModinaLink' }, description: 'IT solutions for Bangladesh and international customers.', icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="bn"><body><LangProvider><AuthProvider><Header />{children}<Footer /></AuthProvider></LangProvider></body></html>);
}
