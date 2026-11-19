import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SEO } from '../lib/content';

const SITE = (import.meta.env.VITE_SITE_URL || 'https://zaniheza.com').replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE}/zaniheza-share-2026.jpg`;

export default function Seo({ title, description, image, noindex = false, jsonLd }) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | ZaNiheza` : SEO.title;
  const desc = description || SEO.description;
  const img = image || DEFAULT_IMAGE;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={`${SITE}${pathname}`} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={`${SITE}${pathname}`} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      {noindex && <meta name="robots" content="noindex" />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
