'use client';
import Link from 'next/link';
import { Guard } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { me } = useAuth();
  return (<Guard staff><div className="wrap" style={{ paddingTop: 16 }}><div className="row">
    <Link className="btn ghost sm" href="/admin">Tickets</Link><Link className="btn ghost sm" href="/admin/invoices">Invoices</Link>
    <Link className="btn ghost sm" href="/admin/payments">Payments</Link>
    {me?.user.role === 'admin' && <Link className="btn ghost sm" href="/admin/integrations">SMS &amp; Payment</Link>}</div></div>{children}</Guard>);
}
