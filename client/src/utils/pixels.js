let pixelState = { metaId: null, tiktokId: null };

function injectScript(src, id, onLoad) {
  if (document.getElementById(id)) {
    onLoad?.();
    return;
  }
  const s = document.createElement('script');
  s.id = id;
  s.src = src;
  s.async = true;
  s.onload = () => onLoad?.();
  document.head.appendChild(s);
}

export function initPixels({ metaPixelId, tiktokPixelId }) {
  if (!metaPixelId && !tiktokPixelId) return;

  if (metaPixelId && metaPixelId !== pixelState.metaId) {
    pixelState.metaId = metaPixelId;
    injectScript('https://connect.facebook.net/en_US/fbevents.js', 'meta-pixel-js', () => {
      if (window.fbq) {
        window.fbq('init', metaPixelId);
        window.fbq('track', 'PageView');
      }
    });
  }

  if (tiktokPixelId && tiktokPixelId !== pixelState.tiktokId) {
    pixelState.tiktokId = tiktokPixelId;
    injectScript('https://analytics.tiktok.com/i18n/pixel/events.js', 'tt-pixel-js', () => {
      if (window.ttq) {
        window.ttq.load(tiktokPixelId);
        window.ttq.page();
      }
    });
  }
}

export function trackMeta(event, data) {
  if (!pixelState.metaId || !window.fbq) return;
  try {
    window.fbq('track', event, data);
  } catch {
    /* ignore pixel errors */
  }
}

export function trackTikTok(event, data) {
  if (!pixelState.tiktokId || !window.ttq) return;
  try {
    window.ttq.track(event, data);
  } catch {
    /* ignore pixel errors */
  }
}

export function trackPageView() {
  if (pixelState.metaId && window.fbq) window.fbq('track', 'PageView');
  if (pixelState.tiktokId && window.ttq) window.ttq.page();
}

export function trackViewContent({ product, currency = 'DZD' }) {
  const value = product.discountedPrice ?? product.price;
  trackMeta('ViewContent', {
    content_ids: [String(product._id)],
    content_name: product.title,
    content_category: product.category,
    value,
    currency,
  });
  trackTikTok('ViewContent', {
    content_id: String(product._id),
    content_type: 'product',
    content_name: product.title,
    value,
    currency,
  });
}

export function trackAddToCart({ product, quantity = 1, currency = 'DZD' }) {
  const value = (product.discountedPrice ?? product.price) * quantity;
  trackMeta('AddToCart', {
    content_ids: [String(product._id)],
    content_name: product.title,
    content_category: product.category,
    value,
    quantity,
    currency,
  });
  trackTikTok('AddToCart', {
    content_id: String(product._id),
    content_type: 'product',
    content_name: product.title,
    value,
    quantity,
    currency,
  });
}

export function trackPurchase({ eventId, value, currency = 'DZD', contentIds = [] }) {
  trackMeta('Purchase', {
    value,
    currency,
    content_ids: contentIds,
    eventID: eventId,
  });
  trackTikTok('CompletePayment', { value, currency }, eventId ? { event_id: eventId } : undefined);
}
