import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import ProductCard from '../components/product/ProductCard.jsx';

const PAGE_SIZE = 12;

export default function ShopPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: searchParams.get('sort') || 'newest',
  });

  useEffect(() => {
    api
      .get('/api/products/categories')
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(
    async (pageNum, activeFilters) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('page', String(pageNum));
        params.set('limit', String(PAGE_SIZE));
        if (activeFilters.search) params.set('search', activeFilters.search);
        if (activeFilters.category) params.set('category', activeFilters.category);
        if (activeFilters.minPrice) params.set('minPrice', activeFilters.minPrice);
        if (activeFilters.maxPrice) params.set('maxPrice', activeFilters.maxPrice);
        if (activeFilters.minRating) params.set('minRating', activeFilters.minRating);
        params.set('sort', activeFilters.sort);

        const res = await api.get(`/api/products?${params.toString()}`);
        setProducts((prev) => (pageNum === 1 ? res.data.products : [...prev, ...res.data.products]));
        setTotal(res.data.total);
        setPage(pageNum);
      } catch {
        setError(t.common.error);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    fetchProducts(1, filters);
  }, [filters, fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', minRating: '', sort: 'newest' });
    setSearchParams({});
  };

  const showFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (filters.search) next.set('search', filters.search);
      else next.delete('search');
      if (filters.category) next.set('category', filters.category);
      else next.delete('category');
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-slate-800">{t.shop.title}</h1>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800">{t.shop.filters}</h2>
            <button onClick={resetFilters} className="text-xs font-bold text-primary-600 hover:underline">
              {t.shop.reset}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">{t.shop.category}</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="input"
              >
                <option value="">{t.shop.allCategories}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">{t.shop.priceRange} (DA)</label>
              <div className="flex items-center gap-2" dir="ltr">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  placeholder={t.shop.minPrice}
                  className="input"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  placeholder={t.shop.maxPrice}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">{t.shop.rating}</label>
              <select
                value={filters.minRating}
                onChange={(e) => updateFilter('minRating', e.target.value)}
                className="input"
              >
                <option value="">{t.shop.allRatings}</option>
                {[4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r}{t.shop.ratingPlus}</option>
                ))}
              </select>
            </div>

            <button onClick={showFilters} className="btn-primary w-full">
              {t.shop.apply}
            </button>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder={t.shop.searchPlaceholder}
              className="input max-w-xs flex-1"
            />
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="input w-auto"
            >
              <option value="newest">{t.shop.sortNewest}</option>
              <option value="price-asc">{t.shop.sortPriceAsc}</option>
              <option value="price-desc">{t.shop.sortPriceDesc}</option>
              <option value="rating">{t.shop.sortRating}</option>
            </select>
            <span className="text-sm font-bold text-slate-500">
              {total} {t.shop.results}
            </span>
          </div>

          {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}

          {loading && products.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card h-80 animate-pulse bg-slate-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-16 text-center">
              <span className="text-5xl">🔍</span>
              <p className="font-bold text-slate-600">{t.shop.noResults}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {products.length < total && (
                <div className="mt-8 text-center">
                  <button onClick={() => fetchProducts(page + 1, filters)} disabled={loading} className="btn-outline">
                    {loading ? '...' : t.shop.loadMore}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
