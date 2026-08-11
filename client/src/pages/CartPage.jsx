import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice } from '../utils/format.js';
import QuantitySelector from '../components/product/QuantitySelector.jsx';

export default function CartPage() {
  const { t, lang } = useLanguage();
  const { cart, cartSubtotal, updateQuantity, removeFromCart } = useStore();

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-800">{t.cart.empty}</h1>
        <Link to="/shop" className="btn-primary mt-6">{t.cart.emptyCta}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-slate-800">{t.cart.title}</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.productId} className="card flex flex-wrap items-center gap-4 p-4">
              <Link to={`/product/${item.slug}`}>
                <img src={item.image} alt={item.title} className="h-24 w-24 rounded-xl object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/product/${item.slug}`} className="font-bold text-slate-800 hover:text-primary-700">
                  {lang === 'ar' ? item.titleAr : item.title}
                </Link>
                <p className="mt-1 text-sm font-extrabold text-primary-700">{formatPrice(item.price)}</p>
                {item.originalPrice > item.price && (
                  <p className="text-xs font-bold text-slate-400 line-through">{formatPrice(item.originalPrice)}</p>
                )}
              </div>
              <QuantitySelector value={item.quantity} max={item.stock} onChange={(q) => updateQuantity(item.productId, q)} />
              <div className="w-24 text-end">
                <p className="font-extrabold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                <button onClick={() => removeFromCart(item.productId)} className="text-xs font-bold text-red-500 hover:underline">
                  {t.cart.remove}
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-extrabold text-slate-800">{t.cart.subtotal}</h2>
          <p className="mb-2 text-3xl font-black text-primary-700">{formatPrice(cartSubtotal)}</p>
          <p className="mb-4 text-xs text-slate-400">{t.cart.shippingNote}</p>
          <Link to="/checkout" className="btn-accent w-full">{t.cart.checkout}</Link>
          <Link to="/shop" className="btn-outline mt-3 w-full">{t.cart.continue}</Link>
        </aside>
      </div>
    </div>
  );
}
