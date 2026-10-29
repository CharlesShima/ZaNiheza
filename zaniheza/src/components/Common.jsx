import { Link } from 'react-router-dom';
import { formatPrice, days } from '../lib/format';
import { isConfigured } from '../lib/supabase';

export function Loading({ label = 'Loading' }) {
  return <div className="loading" role="status"><span className="spinner" aria-hidden="true" />{label}…</div>;
}

export function ErrorNote({ error }) {
  if (!isConfigured) {
    return <p className="note">Connect Supabase (see README, step 2) to load live content.</p>;
  }
  return <p className="note" role="alert">This content couldn't load: {error?.message}. Refresh the page to try again.</p>;
}

export function Photo({ src, alt, className = '', label }) {
  if (src) return <img className={className} src={src} alt={alt} loading="lazy" />;
  return (
    <div className={`photo-fallback ${className}`} role="img" aria-label={alt}>
      <span>{label || alt}</span>
    </div>
  );
}

export function PackageCard({ pkg }) {
  const price = formatPrice(pkg.price_from, pkg.currency);
  return (
    <Link to={`/packages/${pkg.slug}`} className="pkg-card">
      <Photo src={pkg.cover_image} alt={pkg.title} className="pkg-card__img" label={pkg.experience?.name} />
      <div className="pkg-card__body">
        {pkg.experience && <span className="pkg-card__exp">{pkg.experience.name}</span>}
        <h3>{pkg.title}</h3>
        <p>{pkg.summary}</p>
        <div className="pkg-card__meta">
          <span>{days(pkg.duration_days)}</span>
          <span>{price ? `From ${price}` : 'Price on request'}</span>
        </div>
      </div>
    </Link>
  );
}
