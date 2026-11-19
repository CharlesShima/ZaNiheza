export function formatPrice(amount, currency = 'USD') {
  if (amount === null || amount === undefined || amount === '') return null;
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

const TZ = 'Africa/Kigali';
export function formatDate(d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!d) return '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(d)) ? new Date(`${d}T12:00:00`) : new Date(d);
  return date.toLocaleDateString('en-GB', { ...opts, timeZone: TZ });
}
export const formatTime = (d) => (d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TZ }) : '');
export const dayNum = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', timeZone: TZ }) : '');
export const monthShort = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: TZ }) : '');

export function tripDateRange(t) {
  if (!t?.starts_at) return 'Date to be confirmed';
  const a = formatDate(t.starts_at, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  if (!t.ends_at) return a;
  const sameDay = formatDate(t.starts_at) === formatDate(t.ends_at);
  return sameDay
    ? `${a}, ${formatTime(t.starts_at)}–${formatTime(t.ends_at)}`
    : `${a} – ${formatDate(t.ends_at, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`;
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

export const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || 'Z';
export const seatsLeft = (t) => Math.max(0, (t?.capacity || 0) - (t?.seats_booked || 0));
export const priceText = (t) => formatPrice(t?.price, t?.currency) || 'Price confirmed in the community';
export const hostName = (t) => t?.host?.name || t?.host_label || 'Host to be confirmed';
