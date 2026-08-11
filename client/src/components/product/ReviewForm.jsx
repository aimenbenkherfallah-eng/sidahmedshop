import { useState } from 'react';
import api from '../../api/client.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import StarRating from './StarRating.jsx';

const MAX_PHOTOS = 4;

export default function ReviewForm({ productId, onReviewAdded }) {
  const { t } = useLanguage();
  const { showToast } = useStore();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS);
    if (!files.length) return;
    const valid = files.filter((f) => f.type.startsWith('image/'));
    if (valid.length < files.length) showToast('Images uniquement', 'error');
    setPhotos((prev) => [...prev, ...valid].slice(0, MAX_PHOTOS));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || rating === 0 || comment.trim().length < 5) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('rating', String(rating));
      fd.append('comment', comment.trim());
      photos.forEach((p) => fd.append('photos', p));

      const res = await api.post(`/api/products/${productId}/reviews`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onReviewAdded?.(res.data.product);
      setName('');
      setRating(0);
      setComment('');
      setPhotos([]);
      showToast(t.product.reviewForm.success);
    } catch (err) {
      showToast(err.message || t.common.error, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <h3 className="font-extrabold text-slate-800">{t.product.reviewForm.title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{t.product.reviewForm.name} *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" maxLength={80} />
        </div>
        <div>
          <label className="label">{t.product.reviewForm.rating} *</label>
          <StarRating value={rating} onChange={setRating} size={28} />
        </div>
      </div>
      <div>
        <label className="label">{t.product.reviewForm.comment} *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="input resize-none"
          maxLength={1000}
        />
      </div>
      <div>
        <label className="label">{t.product.reviewForm.photos}</label>
        <div className="flex flex-wrap items-center gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              <img src={URL.createObjectURL(p)} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -end-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-2xl text-slate-400 hover:border-primary-400">
              +
              <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
            </label>
          )}
        </div>
      </div>
      <button type="submit" disabled={submitting || !name.trim() || rating === 0 || comment.trim().length < 5} className="btn-primary">
        {submitting ? '...' : t.product.reviewForm.submit}
      </button>
    </form>
  );
}
