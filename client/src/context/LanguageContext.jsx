import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n';

const LanguageContext = createContext(null);

const getInitialLang = () => {
  try {
    const stored = localStorage.getItem('sas_lang');
    if (stored === 'ar' || stored === 'fr') return stored;
  } catch {
    /* ignore */
  }
  return 'ar';
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem('sas_lang', lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      t: translations[lang],
      toggleLang: () => setLang((l) => (l === 'ar' ? 'fr' : 'ar')),
      setLang,
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
