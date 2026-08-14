import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice } from '../utils/format.js';
import OrderForm from '../components/order/OrderForm.jsx';
import { PROVINCES } from '../utils/provinces.js';

export default function CheckoutPage() {
  const { t, lang } = useLanguage();
  const { cart, shippingFeeFor, cartEnabled, settingsLoading } = useStore();
  const [wilayaPreview, setWilayaPreview] = useState('');

  const products = useMemo(
    () =>
      cart.map((item) => ({
        _id: item.productId,
        title: item.title,
        titleAr: item.titleAr,
        price: item.originalPrice,
        discountedPrice: item.price,
        images: [item.image],
      })),
    [cart]
  );

  const items = useMemo(() => cart.map((item) => ({ productId: item.productId, quantity: item.quantity })), [cart]);

  if (settingsLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-slate-400">{t.common.loading}</div>;
  }

  if (!cartEnabled) return <Navigate to="/shop" replace />;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-800">{t.cart.empty}</h1>
        <Link to="/shop" className="btn-primary mt-6">{t.cart.emptyCta}</Link>
      </div>
    );
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const previewFee = wilayaPreview ? shippingFeeFor(wilayaPreview) : null;
  const wilayaName = (code) => {
    const p = PROVINCES.find((x) => x.code === Number(code));
    return p ? (lang === 'ar' ? p.ar : p.fr) : '';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-extrabold text-slate-800">{t.checkout.title}</h1>
      <p className="mb-6 text-sm text-slate-500">🚚 {t.checkout.deliveryNote}</p>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="card p-6">
          <h2 className="mb-5 text-lg font-extrabold text-slate-800">{t.checkout.infoTitle}</h2>
          <OrderForm
            items={items}
            products={products}
            source="checkout"
            showOrderSummary={false}
            onWilayaChange={setWilayaPreview}
          />
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-extrabold text-slate-800">{t.checkout.deliveryTitle}</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <img src={item.image} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-bold text-slate-800">
                    {lang === 'ar' ? item.titleAr : item.title}
                    <span className="text-slate-400"> × {item.quantity}</span>
                  </p>
                  <p className="text-xs font-bold text-primary-600">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{t.cart.subtotal}</span>
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t.checkout.shippingFee}</span>
              <span className="font-bold">
                {previewFee == null ? (
                  <span className="text-xs text-slate-400">{t.checkout.selectWilaya}</span>
                ) : (
                  <>
                    {wilayaName(wilayaPreview)} · {formatPrice(previewFee)}
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-slate-900">
              <span>{t.cod.total}</span>
              <span className="text-primary-700">{formatPrice(subtotal + (previewFee ?? 0))}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">{t.cart.shippingNote}</p>
          <div className="mt-4 rounded-xl bg-accent-50 p-3 text-center text-xs font-bold text-accent-700">
            💵 {t.cod.codNote}
          </div>
        </aside>
      </div>
    </div>
  );
}
