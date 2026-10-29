import { useId } from 'react';

// Zig-zag band inspired by Imigongo art. Used as the site's signature divider.
export default function Imigongo({ className = '', tone = 'navy' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`imigongo imigongo--${tone} ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width="48" height="24" patternUnits="userSpaceOnUse">
          <rect className="ig-bg" width="48" height="24" />
          <path className="ig-fg" d="M0 24 12 0l12 24z M24 0l12 24L48 0z" />
          <path className="ig-bg" d="M7 24l5-10 5 10z M31 0l5 10 5-10z" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
