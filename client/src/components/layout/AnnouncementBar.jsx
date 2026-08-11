import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';

export default function AnnouncementBar() {
  const { lang } = useLanguage();
  const { settings } = useStore();

  if (!settings?.announcement?.enabled) return null;
  const text = settings.announcement[lang];

  return (
    <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-accent-600 text-white">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-sm font-bold sm:text-base">
        {text || 'الدفع عند الاستلام والتوصيل إلى جميع الولايات'}
      </p>
    </div>
  );
}
