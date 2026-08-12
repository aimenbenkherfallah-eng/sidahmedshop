import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { PROVINCES } from '../../utils/provinces.js';

export default function SettingsPage() {
  const { t } = useLanguage();
  const { showToast } = useStore();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/api/admin/settings')
      .then((res) => setSettings(res.data.settings))
      .catch((err) => showToast(err.message, 'error'));
  }, [showToast]);

  if (!settings) return <div className="text-slate-400">{t.common.loading}</div>;

  const set = (path, value) => {
    setSettings((s) => {
      const next = structuredClone(s);
      const keys = path.split('.');
      let node = next;
      keys.slice(0, -1).forEach((k) => (node = node[k]));
      node[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const setFee = (code, value) => {
    setSettings((s) => {
      const next = structuredClone(s);
      const fees = { ...(next.shippingFees || {}) };
      const num = Number(value);
      if (value === '' || Number.isNaN(num)) delete fees[String(code)];
      else fees[String(code)] = num;
      next.shippingFees = fees;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/admin/settings', settings);
      setSettings(res.data.settings);
      showToast(t.admin.saved);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-800">⚙️ {t.admin.settings}</h1>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? '...' : t.admin.save}
        </button>
      </div>

      <div className="space-y-6">
        <section className="card space-y-4 p-6">
          <h2 className="font-extrabold text-slate-800">🎯 {t.admin.settingsSections.pixels}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t.admin.settingsSections.meta}</label>
              <input value={settings.metaPixelId} onChange={(e) => set('metaPixelId', e.target.value)} className="input" dir="ltr" placeholder="123456789012345" />
            </div>
            <div>
              <label className="label">{t.admin.settingsSections.tiktok}</label>
              <input value={settings.tiktokPixelId} onChange={(e) => set('tiktokPixelId', e.target.value)} className="input" dir="ltr" placeholder="ABC123DEF..." />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Meta Conversions API / TikTok Events API: configurez META_ACCESS_TOKEN, META_PIXEL_ID, TIKTOK_ACCESS_TOKEN, TIKTOK_PIXEL_ID dans server/.env pour les événements serveur.
          </p>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-extrabold text-slate-800">🚀 {t.admin.landingFeature}</h2>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              checked={settings.landingPage?.enabled !== false}
              onChange={(e) => set('landingPage.enabled', e.target.checked)}
              className="h-5 w-5 accent-primary-600"
            />
            {t.admin.landingFeatureEnabled}
          </label>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-extrabold text-slate-800">🏷️ {t.admin.settingsSections.announcement}</h2>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={settings.announcement.enabled} onChange={(e) => set('announcement.enabled', e.target.checked)} className="h-5 w-5 accent-primary-600" />
            {t.admin.settingsSections.announcementEnabled}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">عربي</label>
              <input value={settings.announcement.ar} onChange={(e) => set('announcement.ar', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Français</label>
              <input value={settings.announcement.fr} onChange={(e) => set('announcement.fr', e.target.value)} className="input" />
            </div>
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-extrabold text-slate-800">🏪 {t.admin.settingsSections.storeName} / {t.admin.settingsSections.hero}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nom (عربي)</label>
              <input value={settings.storeName.ar} onChange={(e) => set('storeName.ar', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Nom (Français)</label>
              <input value={settings.storeName.fr} onChange={(e) => set('storeName.fr', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Hero titre (عربي)</label>
              <input value={settings.hero.titleAr} onChange={(e) => set('hero.titleAr', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Hero titre (Français)</label>
              <input value={settings.hero.titleFr} onChange={(e) => set('hero.titleFr', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Hero sous-titre (عربي)</label>
              <input value={settings.hero.subtitleAr} onChange={(e) => set('hero.subtitleAr', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Hero sous-titre (Français)</label>
              <input value={settings.hero.subtitleFr} onChange={(e) => set('hero.subtitleFr', e.target.value)} className="input" />
            </div>
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-extrabold text-slate-800">🚚 {t.admin.settingsSections.shipping}</h2>
          <div className="max-w-xs">
            <label className="label">{t.admin.settingsSections.defaultFee} (DA)</label>
            <input type="number" min="0" value={settings.defaultShippingFee} onChange={(e) => set('defaultShippingFee', e.target.value)} className="input" />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-600">{t.admin.settingsSections.perWilaya} (DA)</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6" dir="ltr">
              {PROVINCES.map((p) => (
                <div key={p.code} className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="—"
                    value={settings.shippingFees?.[String(p.code)] ?? ''}
                    onChange={(e) => setFee(p.code, e.target.value)}
                    className="input !py-1.5 !px-2 text-center text-sm"
                    title={`${p.code} - ${p.fr}`}
                  />
                  <span className="text-xs font-bold text-slate-500" title={`${p.code} - ${p.fr}`}>
                    {p.code}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Vide = frais par défaut ({settings.defaultShippingFee} DA). Saisissez un montant pour une wilaya spécifique.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
