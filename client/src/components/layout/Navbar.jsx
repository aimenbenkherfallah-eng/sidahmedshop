import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';

export default function Navbar() {
  const { t, lang, toggleLang } = useLanguage();
  const { cartCount, setCartOpen, settings, cartEnabled } = useStore();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-lg font-black text-white">
            S
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-base font-extrabold text-primary-800">
              {settings?.storeName?.[lang] || 'Sidahmed Shop'}
            </span>
            <span className="text-xs font-bold text-accent-600">{t.storeTagline}</span>
          </span>
        </Link>

        <form onSubmit={submitSearch} className="mx-auto hidden w-full max-w-md md:block">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search.placeholder}
              className="input pe-10"
            />
            <button
              type="submit"
              aria-label="search"
              className="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 hover:text-primary-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
            </button>
          </div>
        </form>

        <nav className="ms-auto flex items-center gap-1 sm:gap-2">
          <Link to="/" className="hidden rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-primary-50 hover:text-primary-700 md:block">
            {t.nav.home}
          </Link>
          <Link to="/shop" className="hidden rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-primary-50 hover:text-primary-700 md:block">
            {t.nav.shop}
          </Link>
          <button
            onClick={toggleLang}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-primary-700 hover:border-primary-300 hover:bg-primary-50"
          >
            {lang === 'ar' ? 'FR' : 'ع'}
          </button>
          {cartEnabled && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-lg bg-primary-600 p-2.5 text-white shadow-sm transition hover:bg-primary-700"
              aria-label={t.nav.cart}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h14M9 21h.01M19 21h.01" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-xs font-black text-white">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </nav>
      </div>

      <form onSubmit={submitSearch} className="border-t border-slate-100 px-4 py-2 md:hidden">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search.placeholder}
          className="input"
        />
      </form>
    </header>
  );
}
