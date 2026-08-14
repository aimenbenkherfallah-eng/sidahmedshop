import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';

export default function Footer() {
  const { t, lang } = useLanguage();
  const { settings, cartEnabled } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-3 text-lg font-extrabold text-white">
            {settings?.storeName?.[lang] || 'Sidahmed Shop'}
          </h3>
          <p className="text-sm leading-relaxed">{t.footer.about}</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-accent-400">{t.footer.links}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">{t.nav.home}</Link></li>
            <li><Link to="/shop" className="hover:text-white">{t.nav.shop}</Link></li>
            {cartEnabled && <li><Link to="/cart" className="hover:text-white">{t.nav.cart}</Link></li>}
            <li><Link to="/admin/login" className="hover:text-white">{t.nav.admin}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-accent-400">{t.footer.payment}</h3>
          <div className="flex items-center gap-2 rounded-xl bg-slate-800 p-3">
            <svg className="h-6 w-6 shrink-0 text-accent-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.2 0-4 1.3-4 3.5S9.8 15 12 15s4-1.3 4-3.5S14.2 8 12 8zm0 0V3M8.5 21h7" />
            </svg>
            <p className="text-sm font-bold text-white">{t.footer.codText}</p>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-accent-400">{t.footer.contact}</h3>
          <p className="text-sm">{t.footer.contactNote}</p>
          <p className="mt-2 text-sm text-slate-400">{lang === 'ar' ? '📞 متوفرون 7/7' : '📞 7j/7'}</p>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {year} {settings?.storeName?.[lang] || 'Sidahmed Shop'} — {t.footer.rights}
      </div>
    </footer>
  );
}
