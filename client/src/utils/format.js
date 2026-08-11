export const formatPrice = (value) =>
  `${new Intl.NumberFormat('fr-DZ').format(Number(value) || 0)} DA`;

export const formatDate = (value, lang) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
};

export const discountPercent = (price, discountedPrice) => {
  if (!price || discountedPrice == null || discountedPrice >= price) return 0;
  return Math.round(((price - discountedPrice) / price) * 100);
};

export const normalizePhone = (phone) => String(phone || '').replace(/[^\d+]/g, '');
