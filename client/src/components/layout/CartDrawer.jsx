import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { formatPrice } from '../../utils/format.js';
import QuantitySelector from '../product/QuantitySelector.jsx';

export default function CartDrawer() {
  const { t } = useLanguage();
  const { cart, cartOpen, setCartOpen, cartSubtotal, updateQuantity, removeFromCart } = useStore();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => setCartOpen(false)} />
      <aside className="absolute inset-y-0 end-0 flex w-full max-w-md animate-slideIn flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-extrabold text-slate-800">{t.cart.title}</h2>
          <button onClick={() => setCartOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="close">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="text-5xl">🛒</span>
            <p className="font-bold text-slate-600">{t.cart.empty}</p>
            <Link to="/shop" onClick={() => setCartOpen(false)} className="btn-primary">
              {t.cart.emptyCta}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                  <Link to={`/product/${item.slug}`} onClick={() => setCartOpen(false)} className="shrink-0">
                    <img src={item.image} alt={item.title} className="h-20 w-20 rounded-lg object-cover" loading="lazy" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link to={`/product/${item.slug}`} onClick={() => setCartOpen(false)} className="line-clamp-2 text-sm font-bold text-slate-800 hover:text-primary-700">
                      {item.title}
                    </Link>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <QuantitySelector
                        value={item.quantity}
                        max={item.stock}
                        onChange={(q) => updateQuantity(item.productId, q)}
                        small
                      />
                      <div className="text-end">
                        <p className="text-sm font-extrabold text-primary-700">{formatPrice(item.price * item.quantity)}</p>
                        <button onClick={() => removeFromCart(item.productId)} className="text-xs font-bold text-red-500 hover:underline">
                          {t.cart.remove}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-bold text-slate-600">{t.cart.subtotal}</span>
                <span className="text-lg font-extrabold text-slate-900">{formatPrice(cartSubtotal)}</span>
              </div>
              <p className="mb-3 text-xs text-slate-400">{t.cart.shippingNote}</p>
              <Link to="/checkout" onClick={() => setCartOpen(false)} className="btn-accent w-full">
                {t.cart.checkout}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
