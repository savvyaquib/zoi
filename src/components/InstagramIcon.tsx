/**
 * The Instagram mark, in two weights.
 *
 * `outline` — the camera as strokes, painted in Instagram's gradient. For the
 * nav pill: recognisable by colour alone, but with the visual weight of the
 * orange "Menu" beside it rather than a solid block that would out-shout the
 * one link that matters.
 *
 * `tile` — the app tile, the gradient rounded square with the white camera,
 * the mark people know at a glance. For the footer, where it sits in a
 * bordered pill beside the handle and reads as a button.
 *
 * Both are drawn inline at the proportions the official mark uses, so they
 * read correctly at 20px. The gradient is Instagram's, not ours — a third-
 * party brand mark keeps its own colours, the one place the site's
 * three-colour palette does not reach.
 */
export function InstagramIcon({
  variant = "outline",
  className = "h-5 w-5",
}: {
  variant?: "outline" | "tile";
  className?: string;
}) {
  const id = `ig-${variant}`;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        {/* Instagram's radial: yellow at the lower left rising through red and magenta to blue-violet. */}
        <radialGradient id={id} cx="30%" cy="107%" r="150%" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#fdf497" />
          <stop offset="0.05" stopColor="#fdf497" />
          <stop offset="0.45" stopColor="#fd5949" />
          <stop offset="0.6" stopColor="#d6249f" />
          <stop offset="0.9" stopColor="#285aeb" />
        </radialGradient>
      </defs>
      {variant === "tile" ? (
        <>
          <rect x="0" y="0" width="24" height="24" rx="6" fill={`url(#${id})`} />
          <g fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5.1" y="5.1" width="13.8" height="13.8" rx="4" />
            <circle cx="12" cy="12" r="3.15" />
          </g>
          <circle cx="16.15" cy="7.85" r="0.95" fill="#fff" />
        </>
      ) : (
        <>
          <g fill="none" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.4" />
            <circle cx="12" cy="12" r="4.1" />
          </g>
          <circle cx="17.4" cy="6.6" r="1.2" fill={`url(#${id})`} />
        </>
      )}
    </svg>
  );
}
