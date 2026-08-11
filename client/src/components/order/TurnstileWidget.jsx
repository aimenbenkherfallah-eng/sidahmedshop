import { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptLoaded = false;

function loadScript() {
  if (scriptLoaded || document.getElementById('turnstile-script')) return;
  scriptLoaded = true;
  const s = document.createElement('script');
  s.id = 'turnstile-script';
  s.src = TURNSTILE_SRC;
  s.async = true;
  document.head.appendChild(s);
}

export default function TurnstileWidget({ onToken, siteKey }) {
  const { lang } = useLanguage();
  const { settings } = useStore();
  const key = siteKey || import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!key) return;
    loadScript();
    let widgetId = null;
    let timer = null;

    const render = () => {
      if (!window.turnstile || document.getElementById('turnstile-container')?.dataset.rendered) return;
      try {
        widgetId = window.turnstile.render('turnstile-container', {
          sitekey: key,
          language: lang,
          callback: (token) => onToken(token),
          'expired-callback': () => onToken(null),
          'error-callback': () => onToken(null),
        });
        const el = document.getElementById('turnstile-container');
        if (el) el.dataset.rendered = '1';
      } catch {
        /* retry */
      }
    };

    timer = setInterval(() => {
      if (window.turnstile) {
        clearInterval(timer);
        render();
      }
    }, 300);

    if (window.turnstile) {
      clearInterval(timer);
      render();
    }

    return () => {
      clearInterval(timer);
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          /* ignore */
        }
      }
    };
  }, [key, lang, onToken]);

  if (!key) return null;
  return (
    <div
      id="turnstile-container"
      className="flex justify-center py-2"
      dir="ltr"
    />
  );
}
