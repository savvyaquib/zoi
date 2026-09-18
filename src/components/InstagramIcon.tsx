/**
 * The Instagram app tile — the gradient rounded square with the white camera —
 * which is the mark people actually recognise at a glance, more than the
 * outline glyph. Drawn inline: a rounded square filled with Instagram's own
 * radial gradient (yellow at the lower left rising through red and magenta to
 * blue-violet), and the camera as white strokes at the proportions the
 * official mark uses, so it reads correctly at 20px.
 *
 * The gradient is Instagram's, not ours — a third-party brand mark keeps its
 * own colours, the one place the site's three-colour palette does not reach.
 * Shared by the nav pill and the footer, so the two are the same drawing.
 */
export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="ig-tile" cx="30%" cy="107%" r="150%" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#fdf497" />
          <stop offset="0.05" stopColor="#fdf497" />
          <stop offset="0.45" stopColor="#fd5949" />
          <stop offset="0.6" stopColor="#d6249f" />
          <stop offset="0.9" stopColor="#285aeb" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="24" height="24" rx="6" fill="url(#ig-tile)" />
      <g fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5.1" y="5.1" width="13.8" height="13.8" rx="4" />
        <circle cx="12" cy="12" r="3.15" />
      </g>
      <circle cx="16.15" cy="7.85" r="0.95" fill="#fff" />
    </svg>
  );
}
