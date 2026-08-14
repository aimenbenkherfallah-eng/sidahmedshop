import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/product/ProductCard.jsx';

const TRUST_ITEMS = [
  { icon: '🚚', key: 'trust1' },
  { icon: '💵', key: 'trust2' },
  { icon: '🔍', key: 'trust3' },
  { icon: '🛡️', key: 'trust4' },
];

export default function HomePage() {
  const { t, lang } = useLanguage();
  const { settings } = useStore();
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .get('/api/products/trending')
      .then((res) => setTrending(res.data.products))
      .catch(() => {});
    api
      .get('/api/products/categories')
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
  }, []);

  const hero = settings?.hero || {};
  const heroProduct = trending[0];
  const heroImage = heroProduct?.images?.[0];

  return (
    <div>
      <section className="relative min-h-[480px] overflow-hidden bg-slate-900 text-white sm:min-h-[540px]">
        {heroImage && (
          <img
            src={heroImage}
            alt={heroProduct.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="relative mx-auto flex min-h-[480px] max-w-7xl items-center px-4 py-14 sm:min-h-[540px]">
          <div className="max-w-2xl animate-fadeIn">
            <span className="badge mb-4 bg-accent-500 text-white">{t.home.heroBadge} 💵</span>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              {lang === 'ar' ? hero.titleAr : hero.titleFr}
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-200 sm:text-lg">
              {lang === 'ar' ? hero.subtitleAr : hero.subtitleFr}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-accent !px-8 !py-3.5 !text-base">
                {t.home.heroCta}
              </Link>
              <Link to="/shop" className="rounded-lg border border-white/60 bg-white/10 px-8 py-3.5 text-base font-bold text-white transition hover:bg-white/20">
                {t.home.heroCta2}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-3 -mt-8 sm:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.key} className="card flex flex-col items-center gap-2 border border-slate-100 p-4 text-center">
              <span className="text-3xl">{item.icon}</span>
              <p className="text-sm font-extrabold text-slate-800">{t.home[`${item.key}Title`]}</p>
              <p className="text-xs text-slate-500">{t.home[`${item.key}Desc`]}</p>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto mt-14 max-w-7xl px-4">
          <h2 className="mb-4 text-2xl font-extrabold text-slate-800">{t.home.categories}</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c}
                to={`/shop?category=${encodeURIComponent(c)}`}
                className="rounded-full border-2 border-primary-200 bg-primary-50 px-5 py-2 text-sm font-bold text-primary-700 transition hover:border-primary-500 hover:bg-primary-500 hover:text-white"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">{t.home.trending}</h2>
            <p className="text-sm text-slate-500">{t.home.trendingSub}</p>
          </div>
          <Link to="/shop" className="text-sm font-bold text-primary-600 hover:underline">
            {t.home.viewAll} ←
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {trending.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
