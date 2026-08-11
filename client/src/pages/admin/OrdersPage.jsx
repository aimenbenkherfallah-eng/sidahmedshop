import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { PROVINCES } from '../../utils/provinces.js';
import { formatPrice, formatDate } from '../../utils/format.js';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-violet-100 text-violet-700',
  delivered: 'bg-accent-100 text-accent-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function OrdersPage() {
  const { t, lang } = useLanguage();
  const { showToast } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [wilaya, setWilaya] = useState(searchParams.get('wilaya') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (status) params.set('status', status);
      if (wilaya) params.set('wilaya', wilaya);
      if (search) params.set('search', search);
      const res = await api.get(`/api/admin/orders?${params.toString()}`);
      setOrders(res.data.orders);
      setPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, status, wilaya, search, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (status) next.set('status', status);
        else next.delete('status');
        if (wilaya) next.set('wilaya', wilaya);
        else next.delete('wilaya');
        return next;
      },
      { replace: true }
    );
  }, [status, wilaya, setSearchParams]);

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const changeStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/admin/orders/${id}/status`, { status: newStatus });
      fetchOrders();
      showToast(t.admin.saved);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const totalItems = (o) => o.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-800">📦 {t.admin.orders} ({total})</h1>

      <div className="card mb-6 flex flex-wrap gap-3 p-4">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">{t.admin.filterStatus}: {t.admin.all}</option>
          {Object.entries(t.admin.statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select value={wilaya} onChange={(e) => { setWilaya(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">{t.admin.filterWilaya}: {t.admin.all}</option>
          {PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.code} - {lang === 'ar' ? p.ar : p.fr}
            </option>
          ))}
        </select>
        <form onSubmit={applySearch} className="flex flex-1 gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.admin.searchOrders} className="input" />
          <button className="btn-primary !px-4 !py-2">{t.search.button}</button>
        </form>
      </div>

      {loading ? (
        <div className="card animate-pulse p-16 text-center text-slate-400">{t.common.loading}</div>
      ) : orders.length === 0 ? (
        <div className="card p-16 text-center text-slate-500">—</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-slate-800" dir="ltr">{o.orderNumber}</p>
                  <p className="text-sm font-bold text-slate-600">{o.customerName}</p>
                  <p className="text-sm text-slate-500" dir="ltr">{o.phone}</p>
                  <p className="text-sm text-slate-500">📍 {o.wilayaName}</p>
                </div>
                <div className="text-end">
                  <p className="text-lg font-black text-primary-700">{formatPrice(o.total)}</p>
                  <p className="text-xs text-slate-400">{formatDate(o.createdAt, lang)}</p>
                  <span className={`badge mt-1 ${STATUS_STYLES[o.status]}`}>{t.admin.statusLabels[o.status]}</span>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-slate-50 p-3">
                {o.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1 text-sm">
                    <span className="font-bold text-slate-700">
                      {lang === 'ar' && item.nameAr ? item.nameAr : item.name}
                      <span className="text-slate-400"> × {item.quantity}</span>
                    </span>
                    <span className="font-bold text-slate-600">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="mt-1 flex justify-between border-t border-slate-200 pt-2 text-xs text-slate-500">
                  <span>{t.cod.shippingFee}: {formatPrice(o.shippingFee)}</span>
                  <span>{totalItems(o)} {t.shop.results}</span>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <select
                  value={o.status}
                  onChange={(e) => changeStatus(o._id, e.target.value)}
                  className={`input w-auto !py-1.5 text-sm font-bold ${STATUS_STYLES[o.status]}`}
                >
                  {Object.entries(t.admin.statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
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
