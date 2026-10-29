import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../lib/settings';

const SITE = (import.meta.env.VITE_SITE_URL || 'https://zaniheza.com').replace(/\/$/, '');

export default function Seo({ title, description, image, noindex = false }) {
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | ZaNiheza` : 'ZaNiheza Tour Operator | Cultural & experiential travel in Rwanda';
  const desc = description || settings.hero_subtitle;
  const img = image || settings.hero_image_url;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={`${SITE}${pathname}`} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={`${SITE}${pathname}`} />
      {img && <meta property="og:image" content={img} />}
      <meta name="twitter:card" content={img ? 'summary_large_image' : 'summary'} />
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
}
