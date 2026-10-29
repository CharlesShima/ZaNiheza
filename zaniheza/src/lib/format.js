export function formatPrice(amount, currency = 'USD') {
  if (amount === null || amount === undefined || amount === '') return null;
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatDate(d) {
  if (!d) return '';
  return new Date(`${String(d).slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function whatsappLink(number, text = '') {
  const digits = String(number || '').replace(/\D/g, '');
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const days = (n) => `${n} ${Number(n) === 1 ? 'day' : 'days'}`;
