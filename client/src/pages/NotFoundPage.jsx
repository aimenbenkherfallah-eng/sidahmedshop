import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center">
      <p className="text-6xl font-black text-primary-200">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-slate-800">{t.notFound.title}</h1>
      <Link to="/" className="btn-primary mt-6">{t.notFound.back}</Link>
    </div>
  );
}
