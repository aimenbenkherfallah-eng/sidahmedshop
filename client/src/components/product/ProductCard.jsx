import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { formatPrice, discountPercent } from '../../utils/format.js';
import StarRating from './StarRating.jsx';

export default function ProductCard({ product }) {
  const { t, lang } = useLanguage();
  const { addToCart, cartEnabled } = useStore();
  const price = product.discountedPrice ?? product.price;
  const discount = discountPercent(product.price, product.discountedPrice);

  return (
    <article className="group card flex flex-col overflow-hidden border border-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.images?.[0]}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute start-2 top-2 badge bg-accent-500 text-white">-{discount}%</span>
        )}
        {product.stock === 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-sm font-black text-white">
            {t.product.outOfStock}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <span className="mb-1 text-xs font-bold text-primary-500">{product.category}</span>
        <Link to={`/product/${product.slug}`} className="line-clamp-2 min-h-10 text-sm font-bold text-slate-800 hover:text-primary-700">
          {lang === 'ar' && product.titleAr ? product.titleAr : product.title}
        </Link>
        <div className="mt-1">
          <StarRating value={product.rating} size={14} />
          <span className="ms-1 text-xs text-slate-400">({product.numReviews})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-primary-700">{formatPrice(price)}</span>
          {discount > 0 && (
            <span className="text-xs font-bold text-slate-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        {cartEnabled ? (
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="btn-primary mt-3 w-full !py-2 text-sm"
          >
            {t.product.addToCart}
          </button>
        ) : (
          <Link to={`/product/${product.slug}`} className="btn-outline mt-3 w-full !py-2 text-sm">
            {t.product.viewProduct}
          </Link>
        )}
      </div>
    </article>
  );
}
