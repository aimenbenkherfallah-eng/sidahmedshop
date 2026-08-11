import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { formatPrice, formatDate } from '../../utils/format.js';

export default function DashboardPage() {
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api
      .get('/api/admin/dashboard/stats')
      .then((res) => {
        setStats(res.data.stats);
        setRecent(res.data.recentOrders);
      })
      .catch(() => {});
  }, []);

  if (!stats) return <div className="text-slate-400">{t.common.loading}</div>;

  const cards = [
    { label: t.admin.stats.totalOrders, value: stats.totalOrders, color: 'bg-primary-600' },
    { label: t.admin.stats.pending, value: stats.pendingOrders, color: 'bg-amber-500' },
    { label: t.admin.stats.delivered, value: stats.deliveredOrders, color: 'bg-accent-500' },
    { label: t.admin.stats.revenue, value: formatPrice(stats.revenue), color: 'bg-slate-800' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-800">{t.admin.dashboard}</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`card p-5 text-white ${c.color}`}>
            <p className="text-sm font-bold opacity-90">{c.label}</p>
            <p className="mt-2 text-2xl font-black">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-4 font-extrabold text-slate-800">{t.admin.recentOrders}</h2>
          <div className="space-y-2">
            {recent.length === 0 && <p className="text-sm text-slate-400">—</p>}
            {recent.map((o) => (
              <Link
                key={o._id}
                to={`/admin/orders?search=${encodeURIComponent(o.orderNumber)}`}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm hover:bg-primary-50"
              >
                <div>
                  <p className="font-bold text-slate-800" dir="ltr">{o.orderNumber}</p>
                  <p className="text-xs text-slate-500">{o.customerName} · {o.wilayaName}</p>
                </div>
                <div className="text-end">
                  <p className="font-extrabold text-primary-700">{formatPrice(o.total)}</p>
                  <p className="text-xs text-slate-400">{formatDate(o.createdAt, lang)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-extrabold text-slate-800">⚠️ {t.admin.stats.lowStock}</h2>
          <div className="space-y-2">
            {stats.lowStock.length === 0 && <p className="text-sm text-slate-400">—</p>}
            {stats.lowStock.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <span className="font-bold text-slate-800">{p.title}</span>
                <span className={`badge ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                  {p.stock}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
