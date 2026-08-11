import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ApiError } from '../../api/client.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { PROVINCES } from '../../utils/provinces.js';
import { formatPrice, normalizePhone } from '../../utils/format.js';
import { trackPurchase } from '../../utils/pixels.js';
import TurnstileWidget from './TurnstileWidget.jsx';

const PHONE_REGEX = /^(\+?213|0)?[5-7]\d{8}$/;

export default function OrderForm({ items, source, products, showOrderSummary = true, onWilayaChange }) {
  const { t, lang } = useLanguage();
  const { settings, shippingFeeFor, clearCart, showToast } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({ customerName: '', phone: '', wilaya: '', address: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('sas_customer'));
      if (saved?.customerName) setForm((f) => ({ ...f, ...saved }));
    } catch {
      /* ignore */
    }
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const p = products.find((x) => x._id === item.productId);
        return sum + (p ? (p.discountedPrice ?? p.price) * item.quantity : 0);
      }, 0),
    [items, products]
  );

  const shippingFee = useMemo(() => {
    if (!form.wilaya) return null;
    return shippingFeeFor(form.wilaya);
  }, [form.wilaya, shippingFeeFor]);

  const total = subtotal + (shippingFee ?? 0);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    if (field === 'wilaya') onWilayaChange?.(value);
  };

  const validate = () => {
    const e = {};
    if (form.customerName.trim().length < 3) e.customerName = t.cod.nameInvalid;
    if (!PHONE_REGEX.test(normalizePhone(form.phone))) e.phone = t.cod.phoneInvalid;
    if (!form.wilaya) e.wilaya = t.cod.wilayaInvalid;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/api/orders', {
        customerName: form.customerName.trim(),
        phone: normalizePhone(form.phone),
        wilaya: Number(form.wilaya),
        address: form.address.trim(),
        notes: form.notes.trim(),
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        source,
        captchaToken: captchaToken || '',
      });

      const order = res.data.order;
      try {
        sessionStorage.setItem('sas_last_order', JSON.stringify(order));
        sessionStorage.setItem(
          'sas_customer',
          JSON.stringify({ customerName: form.customerName.trim(), phone: normalizePhone(form.phone), wilaya: Number(form.wilaya) })
        );
      } catch {
        /* ignore */
      }

      trackPurchase({
        eventId: order.eventId,
        value: order.total,
        contentIds: items.map((i) => i.productId),
      });

      if (source === 'checkout') clearCart();
      navigate('/thank-you', { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t.common.error;
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const wilayaLabel = (code) => {
    const p = PROVINCES.find((x) => x.code === Number(code));
    return p ? (lang === 'ar' ? `${p.ar} (${p.code})` : `${p.fr} (${p.code})`) : '';
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {showOrderSummary && (
        <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4">
          <div className="space-y-2">
            {items.map((item) => {
              const p = products.find((x) => x._id === item.productId);
              if (!p) return null;
              return (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={p.images?.[0]} alt={p.title} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-bold text-slate-800">
                      {lang === 'ar' && p.titleAr ? p.titleAr : p.title}
                      <span className="text-slate-400"> × {item.quantity}</span>
                    </p>
                    <p className="text-xs font-bold text-primary-600">
                      {formatPrice((p.discountedPrice ?? p.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="label">{t.cod.fullName} *</label>
        <input
          value={form.customerName}
          onChange={(e) => set('customerName', e.target.value)}
          placeholder={t.cod.fullNamePh}
          className={`input ${errors.customerName ? '!border-red-400' : ''}`}
          autoComplete="name"
        />
        {errors.customerName && <p className="mt-1 text-xs font-bold text-red-500">{errors.customerName}</p>}
      </div>

      <div>
        <label className="label">{t.cod.phone} *</label>
        <input
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder={t.cod.phonePh}
          inputMode="tel"
          dir="ltr"
          className={`input text-end ${errors.phone ? '!border-red-400' : ''}`}
          autoComplete="tel"
        />
        {errors.phone && <p className="mt-1 text-xs font-bold text-red-500">{errors.phone}</p>}
      </div>

      <div>
        <label className="label">{t.cod.wilaya} *</label>
        <select
          value={form.wilaya}
          onChange={(e) => set('wilaya', e.target.value)}
          className={`input ${errors.wilaya ? '!border-red-400' : ''}`}
        >
          <option value="">{t.cod.wilayaPh}</option>
          {PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {wilayaLabel(p.code)}
            </option>
          ))}
        </select>
        {errors.wilaya && <p className="mt-1 text-xs font-bold text-red-500">{errors.wilaya}</p>}
      </div>

      <div>
        <label className="label">{t.cod.address}</label>
        <input
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          placeholder={t.cod.addressPh}
          className="input"
          autoComplete="street-address"
        />
      </div>

      {source === 'checkout' && (
        <div>
          <label className="label">{t.checkout.notes}</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder={t.checkout.notesPh}
            rows={2}
            className="input resize-none"
          />
        </div>
      )}

      <TurnstileWidget onToken={setCaptchaToken} />

      <div className="rounded-xl bg-slate-50 p-4">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>{t.cart.subtotal}</span>
            <span className="font-bold">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>{t.cod.shippingFee}</span>
            <span className="font-bold">{shippingFee == null ? '—' : formatPrice(shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-slate-900">
            <span>{t.cod.total}</span>
            <span className="text-primary-700">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <button type="submit" disabled={submitting} className="btn-accent w-full !py-3.5 text-base">
        {submitting ? t.cod.submitting : t.cod.submit}
      </button>

      <div className="flex items-center justify-center gap-2 rounded-xl bg-accent-50 p-3 text-center text-xs font-bold text-accent-700">
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.2 0-4 1.3-4 3.5S9.8 15 12 15s4-1.3 4-3.5S14.2 8 12 8zm0 0V3M8.5 21h7" />
        </svg>
        {t.cod.codNote}
      </div>
    </form>
  );
}
