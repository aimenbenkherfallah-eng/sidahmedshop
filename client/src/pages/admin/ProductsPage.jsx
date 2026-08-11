import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { formatPrice } from '../../utils/format.js';

export default function ProductsPage() {
  const { t } = useLanguage();
  const { showToast } = useStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('includeInactive', 'true');
      if (search) params.set('search', search);
      const res = await api.get(`/api/admin/products?${params.toString()}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const remove = async (id, title) => {
    if (!window.confirm(`${t.admin.confirmDelete}\n"${title}"`)) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      showToast(t.admin.saved);
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-slate-800">🛍️ {t.admin.products} ({total})</h1>
        <button onClick={() => navigate('/admin/products/new')} className="btn-primary">
          + {t.admin.newProduct}
        </button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setPage(1); fetchProducts(); }}
        className="card mb-6 flex gap-2 p-4"
      >
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="input" />
        <button className="btn-primary !px-4 !py-2">{t.search.button}</button>
      </form>

      {loading ? (
        <div className="card animate-pulse p-16 text-center text-slate-400">{t.common.loading}</div>
      ) : products.length === 0 ? (
        <div className="card p-16 text-center text-slate-500">—</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-start text-xs uppercase text-slate-400">
                <th className="p-3 text-start">{t.admin.productCols.product}</th>
                <th className="p-3 text-start">{t.admin.productCols.category}</th>
                <th className="p-3 text-start">{t.admin.productCols.price}</th>
                <th className="p-3 text-start">{t.admin.productCols.stock}</th>
                <th className="p-3 text-start">{t.admin.productCols.status}</th>
                <th className="p-3 text-end">{t.admin.productCols.actions}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <span className="max-w-56 line-clamp-2 font-bold text-slate-800">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">{p.category}</td>
                  <td className="p-3">
                    <span className="font-extrabold text-primary-700">{formatPrice(p.discountedPrice ?? p.price)}</span>
                    {p.discountedPrice != null && p.discountedPrice < p.price && (
                      <span className="ms-1 text-xs text-slate-400 line-through">{formatPrice(p.price)}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`badge ${p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-accent-100 text-accent-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`badge ${p.active ? 'bg-accent-100 text-accent-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.active ? t.admin.active : t.admin.inactive}
                    </span>
                  </td>
                  <td className="p-3 text-end">
                    <Link to={`/admin/products/${p._id}`} className="me-2 text-sm font-bold text-primary-600 hover:underline">
                      {t.admin.edit}
                    </Link>
                    <button onClick={() => remove(p._id, p.title)} className="text-sm font-bold text-red-500 hover:underline">
                      {t.admin.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline !py-2">←</button>
          <span className="font-bold text-slate-600">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-outline !py-2">→</button>
        </div>
      )}
    </div>
  );
}
