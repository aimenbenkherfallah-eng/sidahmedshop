import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatPrice } from '../utils/format.js';
import { provinceName } from '../utils/provinces.js';

export default function ThankYouPage() {
  const { t, lang } = useLanguage();

  const order = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('sas_last_order')) || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.removeItem('sas_last_order');
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent-100">
        <svg className="h-14 w-14 text-accent-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-black text-slate-900">{t.thankYou.title}</h1>
      <p className="mt-2 font-bold text-accent-600">{t.thankYou.subtitle}</p>

      <div className="card mt-8 p-6 text-start">
        <p className="rounded-xl bg-primary-50 p-4 text-sm font-bold leading-relaxed text-primary-800">
          📞 {t.thankYou.message}
        </p>

        {order && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-400">{t.thankYou.orderNumber}</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900" dir="ltr">{order.orderNumber}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-400">{t.thankYou.total}</p>
              <p className="mt-1 text-lg font-extrabold text-primary-700">{formatPrice(order.total)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-400">{t.thankYou.phone}</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900" dir="ltr">{order.phone}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-400">{t.thankYou.sentBy}</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">{provinceName(order.wilaya, lang)}</p>
            </div>
          </div>
        )}

        <p className="mt-5 rounded-xl bg-accent-50 p-4 text-center text-sm font-bold text-accent-700">
          💵 {t.thankYou.codNote}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">{t.thankYou.backHome}</Link>
        <Link to="/shop" className="btn-outline">{t.thankYou.continueShopping}</Link>
      </div>
    </div>
  );
}
