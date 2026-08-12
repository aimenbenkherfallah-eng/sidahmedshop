import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';

const EMPTY = {
  title: '',
  titleAr: '',
  category: '',
  price: '',
  discountedPrice: '',
  stock: '',
  active: true,
  description: '',
  descriptionAr: '',
  imageUrls: '',
  landingEnabled: false,
  landingImageUrl: '',
  landingHtml: '',
};

export default function ProductFormPage() {
  const { t } = useLanguage();
  const { showToast } = useStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [landingFile, setLandingFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;
    api
      .get(`/api/admin/products/${id}`)
      .then((res) => {
        const p = res.data.product;
        setForm({
          title: p.title,
          titleAr: p.titleAr || '',
          category: p.category,
          price: String(p.price),
          discountedPrice: p.discountedPrice != null ? String(p.discountedPrice) : '',
          stock: String(p.stock),
          active: p.active,
          description: p.description || '',
          descriptionAr: p.descriptionAr || '',
          imageUrls: (p.images || []).join('\n'),
          landingEnabled: p.landingPage?.enabled ?? false,
          landingImageUrl: p.landingPage?.image || '',
          landingHtml: p.landingPage?.html || '',
        });
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [editing, id, showToast]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value === '' && key === 'discountedPrice' ? '' : String(value));
      });
      files.forEach((f) => fd.append('images', f));
      if (landingFile) fd.append('landingImage', landingFile);

      if (editing) await api.put(`/api/admin/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/api/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      showToast(t.admin.saved);
      navigate('/admin/products');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400">{t.common.loading}</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-800">
        {editing ? `${t.admin.edit} — ${form.title}` : `+ ${t.admin.newProduct}`}
      </h1>
      <form onSubmit={save} className="card space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Titre (FR/EN) *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} className="input" required maxLength={200} />
          </div>
          <div>
            <label className="label">العنوان بالعربية</label>
            <input value={form.titleAr} onChange={(e) => set('titleAr', e.target.value)} className="input" maxLength={200} />
          </div>
          <div>
            <label className="label">{t.admin.productCols.category} *</label>
            <input value={form.category} onChange={(e) => set('category', e.target.value)} className="input" required maxLength={80} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prix (DA) *</label>
              <input type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">Prix promo (DA)</label>
              <input type="number" min="0" value={form.discountedPrice} onChange={(e) => set('discountedPrice', e.target.value)} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t.admin.productCols.stock} *</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} className="input" required />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="h-5 w-5 accent-primary-600" />
                {t.admin.active}
              </label>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Description (FR/EN)</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className="input resize-none" />
          </div>
          <div>
            <label className="label">الوصف بالعربية</label>
            <textarea value={form.descriptionAr} onChange={(e) => set('descriptionAr', e.target.value)} rows={4} className="input resize-none" />
          </div>
        </div>

        <div>
          <label className="label">{t.admin.uploadImages} ({t.admin.active})</label>
          <div className="flex flex-wrap items-center gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative">
                <img src={URL.createObjectURL(f)} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -end-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-2xl text-slate-400 hover:border-primary-400">
              +
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            </label>
          </div>
        </div>

        <div>
          <label className="label">{t.admin.imageUrls}</label>
          <textarea value={form.imageUrls} onChange={(e) => set('imageUrls', e.target.value)} rows={3} className="input resize-none" dir="ltr" />
          <p className="mt-1 text-xs text-slate-400">
            {form.active ? 'Les images uploadées remplacent les URLs.' : ''}
          </p>
        </div>

        <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-5">
          <h3 className="mb-3 font-extrabold text-slate-800">🚀 {t.admin.landingSection}</h3>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              checked={form.landingEnabled}
              onChange={(e) => set('landingEnabled', e.target.checked)}
              className="h-5 w-5 accent-primary-600"
            />
            {t.admin.landingEnabled}
          </label>
          {form.landingEnabled && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{t.admin.landingImage}</label>
                  <div className="flex items-center gap-3">
                    {(landingFile || form.landingImageUrl) && (
                      <img
                        src={landingFile ? URL.createObjectURL(landingFile) : form.landingImageUrl}
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-2xl text-slate-400 hover:border-primary-400">
                      +
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setLandingFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {landingFile && (
                      <button type="button" onClick={() => setLandingFile(null)} className="text-xs font-bold text-red-500 hover:underline">
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="label">{t.admin.landingImageUrl}</label>
                  <input
                    value={form.landingImageUrl}
                    onChange={(e) => set('landingImageUrl', e.target.value)}
                    className="input"
                    dir="ltr"
                    placeholder="https://..."
                  />
                  {landingFile && (
                    <p className="mt-1 text-xs text-slate-500">L’image uploadée remplacera l’URL.</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500">🖼️ {t.admin.landingImageHint}</p>

              <div>
                <label className="label">{t.admin.landingHtml}</label>
                <textarea
                  value={form.landingHtml}
                  onChange={(e) => set('landingHtml', e.target.value)}
                  rows={8}
                  className="input resize-y font-mono text-xs"
                  dir="ltr"
                  placeholder="<div>...</div>"
                />
                <p className="mt-1 text-xs text-slate-500">{t.admin.landingHint}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline">
            {t.admin.cancel}
          </button>
          <button type="submit" disabled={saving || !form.title || !form.category || form.price === '' || form.stock === ''} className="btn-primary">
            {saving ? '...' : t.admin.save}
          </button>
        </div>
      </form>
    </div>
  );
}
