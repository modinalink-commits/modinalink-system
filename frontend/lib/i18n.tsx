'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Lang = 'bn' | 'en';
const D: Record<string, { bn: string; en: string }> = {
  'nav.services': { bn: 'সেবা', en: 'Services' },
  'nav.prices': { bn: 'মূল্য', en: 'Pricing' },
  'nav.quote': { bn: 'কোটেশন', en: 'Get a quote' },
  'nav.login': { bn: 'লগইন', en: 'Log in' },
  'nav.register': { bn: 'নিবন্ধন', en: 'Sign up' },
  'nav.portal': { bn: 'আমার পোর্টাল', en: 'My portal' },
  'nav.admin': { bn: 'অ্যাডমিন', en: 'Admin' },
  'nav.logout': { bn: 'লগআউট', en: 'Log out' },
  'home.title': { bn: 'আপনার ব্যবসার আইটি, এক জায়গায়', en: 'Your business IT, in one place' },
  'home.sub': { bn: 'ওয়েবসাইট, সফটওয়্যার, হোস্টিং ও সাপোর্ট। বাংলাদেশ ও আন্তর্জাতিক গ্রাহকদের জন্য।', en: 'Websites, software, hosting and support for customers in Bangladesh and abroad.' },
  'home.cta': { bn: 'কোটেশন চান', en: 'Request a quote' },
  'home.how': { bn: 'কাজ কীভাবে হয়', en: 'How a change request works' },
  'home.s1': { bn: 'আপনি টিকিট খোলেন', en: 'You open a ticket' },
  'home.s2': { bn: 'আমাদের স্টাফ স্কোপ যাচাই করেন', en: 'Our staff checks the scope' },
  'home.s3': { bn: 'আলাদা স্টেজিংয়ে খসড়া তৈরি হয় (এআই সহায়তা নিতে পারে)', en: 'A draft is prepared on staging (AI may assist)' },
  'home.s4': { bn: 'স্টাফ অনুমোদন দেন, রোলব্যাক পয়েন্টসহ', en: 'Staff approve it, with a rollback point' },
  'home.s5': { bn: 'ডিপ্লয় হয় এবং আপনার পোর্টাল আপডেট হয়', en: 'It goes live and your portal updates' },
  'prices.title': { bn: 'মূল্য তালিকা', en: 'Price list' },
  'prices.note': { bn: 'সব দাম বাংলাদেশি টাকায় (BDT)। অন্য মুদ্রা পরে যোগ হবে।', en: 'All prices are in Bangladeshi taka (BDT). More currencies will be added later.' },
  'prices.empty': { bn: 'মূল্য তালিকা শীঘ্রই প্রকাশ হবে। এখন কোটেশন চাইতে পারেন।', en: 'The price list will be published soon. You can request a quote now.' },
  'prices.market': { bn: 'বাজার-ভিত্তিক', en: 'Market-based' },
  'prices.estimate': { bn: 'আনুমানিক', en: 'Estimate' },
  'services.title': { bn: 'আমাদের সেবা', en: 'Our services' },
  'services.empty': { bn: 'সেবার তালিকা লোড হচ্ছে না। পরে আবার চেষ্টা করুন।', en: 'Could not load services. Please try again later.' },
  'quote.title': { bn: 'কোটেশন বা যোগাযোগ', en: 'Quote or contact' },
  'quote.note': { bn: 'এই ফর্মে কোনো পেমেন্ট নেওয়া হয় না।', en: 'This form takes no payment.' },
  'quote.done': { bn: 'ধন্যবাদ। আমরা শীঘ্রই যোগাযোগ করব।', en: 'Thank you. We will get in touch soon.' },
  'f.name': { bn: 'নাম', en: 'Name' }, 'f.email': { bn: 'ইমেইল', en: 'Email' }, 'f.phone': { bn: 'ফোন (01XXXXXXXXX)', en: 'Phone (01XXXXXXXXX)' },
  'f.company': { bn: 'প্রতিষ্ঠান', en: 'Company' }, 'f.interest': { bn: 'কী দরকার', en: 'What do you need' }, 'f.message': { bn: 'বিস্তারিত', en: 'Details' },
  'f.password': { bn: 'পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)', en: 'Password (min 8 characters)' }, 'f.send': { bn: 'পাঠান', en: 'Send' },
  'f.title': { bn: 'শিরোনাম', en: 'Title' }, 'f.type': { bn: 'ধরন', en: 'Type' },
  'auth.login': { bn: 'লগইন করুন', en: 'Log in' }, 'auth.register': { bn: 'নিবন্ধন করুন', en: 'Create account' },
  'portal.title': { bn: 'আমার পোর্টাল', en: 'My portal' },
  'portal.tickets': { bn: 'আমার টিকিট', en: 'My tickets' }, 'portal.invoices': { bn: 'ইনভয়েস', en: 'Invoices' }, 'portal.subs': { bn: 'সাবস্ক্রিপশন', en: 'Subscriptions' },
  'portal.new': { bn: 'নতুন টিকিট', en: 'New ticket' }, 'portal.none': { bn: 'কিছু নেই', en: 'Nothing here yet' },
  'portal.selfservice': { bn: 'নিজে পরিবর্তনের অনুমতি', en: 'Self-service access' },
  'portal.selfservice.note': { bn: 'শুধু কনটেন্ট ও সেটিংস। অনুমতি দেয় আমাদের স্টাফ।', en: 'Content and settings only. Granted by our staff.' },
  'ticket.reply': { bn: 'মন্তব্য লিখুন', en: 'Write a comment' }, 'ticket.timeline': { bn: 'অগ্রগতি', en: 'Progress' },
  'ticket.preview': { bn: 'প্রিভিউ', en: 'Preview' },
  'inv.pay': { bn: 'পরিশোধ', en: 'Pay' }, 'inv.methods': { bn: 'পেমেন্ট পদ্ধতি', en: 'Payment method' }, 'inv.total': { bn: 'মোট', en: 'Total' },
  'inv.bank.ref': { bn: 'ব্যাংক ট্রান্সফারের রেফারেন্স', en: 'Bank transfer reference' }, 'inv.bank.sent': { bn: 'রেফারেন্স জমা হয়েছে, স্টাফ যাচাই করবেন।', en: 'Reference submitted. Staff will verify it.' },
  'inv.pay.review': { bn: 'পেমেন্ট যাচাইয়ে আছে।', en: 'Your payment is under review.' }, 'inv.pay.success': { bn: 'পেমেন্ট সম্পন্ন।', en: 'Payment complete.' }, 'inv.pay.failed': { bn: 'পেমেন্ট সম্পন্ন হয়নি।', en: 'Payment did not complete.' },
  'demo': { bn: 'সফটওয়্যারটি এখনো চালুর আগের ধাপে', en: 'Software is in pre-launch stage' },
  'loading': { bn: 'লোড হচ্ছে…', en: 'Loading…' }, 'err': { bn: 'কিছু ভুল হয়েছে', en: 'Something went wrong' },
  'footer.note': { bn: 'ModinaLink IT Solution। মূল্য BDT-তে।', en: 'ModinaLink IT Solution. Prices in BDT.' },
};

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({ lang: 'bn', setLang: () => {}, t: (k) => k });
export const useLang = () => useContext(Ctx);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setL] = useState<Lang>('bn');
  useEffect(() => { try { const s = localStorage.getItem('ml_lang'); if (s === 'en' || s === 'bn') setL(s); } catch {} }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => { setL(l); try { localStorage.setItem('ml_lang', l); } catch {} };
  const t = (k: string) => D[k]?.[lang] ?? k;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}
