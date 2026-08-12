import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice, discountPercent } from '../utils/format.js';
import { trackViewContent } from '../utils/pixels.js';
import StarRating from '../components/product/StarRating.jsx';
import QuantitySelector from '../components/product/QuantitySelector.jsx';
import ReviewForm from '../components/product/ReviewForm.jsx';
import OrderForm from '../components/order/OrderForm.jsx';

function MagnifierGallery({ images, title }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef(null);
  const list = images.length ? images : ['https://picsum.photos/seed/placeholder/900/900'];

  const onMove = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  return (
    <div>
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
      >
        <img
          ref={imgRef}
          src={list[active]}
          alt={title}
          className="h-full w-full object-cover"
          style={{
            transformOrigin: `${pos.x}% ${pos.y}%`,
            transform: zoom ? 'scale(2)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
        />
        {!zoom && (
          <span className="absolute bottom-3 end-3 rounded-full bg-slate-900/60 px-3 py-1 text-xs font-bold text-white">
            🔍
          </span>
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === active ? 'border-primary-600' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const { t, lang } = useLanguage();
  const { addToCart, showToast, settings } = useStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const orderRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setShowOrderForm(false);
    api
      .get(`/api/products/${slug}`)
      .then((res) => {
        setProduct(res.data.product);
        trackViewContent({ product: res.data.product });
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (showOrderForm) {
      setTimeout(() => orderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [showOrderForm]);

  if (loading) {
    return <div className="mx-auto max-w-7xl animate-pulse px-4 py-16 text-center text-slate-400">{t.common.loading}</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-2xl font-extrabold text-slate-600">404</p>
        <p className="mt-2 text-slate-500">{t.notFound.title}</p>
      </div>
    );
  }

  const price = product.discountedPrice ?? product.price;
  const discount = discountPercent(product.price, product.discountedPrice);
  const displayTitle = lang === 'ar' && product.titleAr ? product.titleAr : product.title;
  const displayDesc = lang === 'ar' && product.descriptionAr ? product.descriptionAr : product.description;

  const onReviewAdded = (updated) => {
    setProduct((p) => ({ ...p, ...updated }));
  };

  const orderItems = [{ productId: product._id, quantity }];

  const showLanding =
    product.landingPage?.enabled === true &&
    settings?.landingPage?.enabled !== false &&
    product.landingPage?.html?.trim().length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {showLanding && (
        <section className="mb-10">
          <iframe
            title="landing-page"
            sandbox="allow-scripts allow-forms allow-popups"
            srcDoc={product.landingPage.html}
            className="w-full rounded-2xl border border-slate-100 bg-white"
            style={{ height: 850, border: 'none' }}
          />
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <MagnifierGallery images={product.images} title={displayTitle} />

        <div className="flex flex-col">
          <span className="text-sm font-bold text-primary-500">{product.category}</span>
          <h1 className="mt-1 text-2xl font-extrabold leading-snug text-slate-900 sm:text-3xl">{displayTitle}</h1>

          <div className="mt-2 flex items-center gap-2">
            <StarRating value={product.rating} size={18} />
            <span className="text-sm font-bold text-slate-600">
              {product.numReviews} {t.product.reviews}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-black text-primary-700">{formatPrice(price)}</span>
            {discount > 0 && (
              <>
                <span className="text-lg font-bold text-slate-400 line-through">{formatPrice(product.price)}</span>
                <span className="badge bg-accent-500 text-white">-{discount}%</span>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`badge ${product.stock > 0 ? 'bg-accent-100 text-accent-700' : 'bg-red-100 text-red-600'}`}>
              {product.stock > 0 ? t.product.inStock : t.product.outOfStock}
            </span>
            <span className="badge bg-primary-100 text-primary-700">🚚 {t.product.freeDelivery}</span>
            <span className="badge bg-accent-100 text-accent-700">💵 {t.product.codBadge}</span>
          </div>

          {product.description && (
            <div className="mt-5">
              <h2 className="mb-2 text-lg font-extrabold text-slate-800">{t.product.description}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{displayDesc}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div>
              <label className="label">{t.product.quantity}</label>
              <QuantitySelector value={quantity} max={Math.max(1, product.stock)} onChange={setQuantity} />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock === 0}
                className="btn-primary"
              >
                🛒 {t.product.addToCart}
              </button>
              <button
                onClick={() => setShowOrderForm(true)}
                disabled={product.stock === 0}
                className="btn-accent"
              >
                ⚡ {t.product.orderNow}
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl bg-primary-50 p-3 text-sm font-bold text-primary-800">
            🛡️ {t.product.freeDelivery} · 💵 {t.cod.codNote}
          </div>
        </div>
      </div>

      <div ref={orderRef} className={`mt-10 ${showOrderForm ? '' : 'hidden'}`}>
        <div className="card mx-auto max-w-xl p-6">
          <h2 className="mb-1 text-xl font-extrabold text-slate-800">{t.cod.title}</h2>
          <p className="mb-5 text-sm text-slate-500">{t.cod.subtitle}</p>
          <OrderForm
            items={orderItems}
            products={[product]}
            source="express"
            showOrderSummary={false}
          />
        </div>
      </div>

      <section className="mt-14">
        <h2 className="mb-5 text-2xl font-extrabold text-slate-800">
          {t.product.reviews} ({product.numReviews})
        </h2>
        {product.reviews.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{t.product.noReviews}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {product.reviews.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 font-black text-primary-700">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{r.name}</p>
                      <StarRating value={r.rating} size={12} />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.comment}</p>
                {r.photos?.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {r.photos.map((p, i) => (
                      <a key={i} href={p} target="_blank" rel="noreferrer">
                        <img src={p} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 max-w-xl">
          <ReviewForm productId={product._id} onReviewAdded={onReviewAdded} />
        </div>
      </section>
    </div>
  );
}
