import { useId } from "react";

/**
 * The Instagram mark — the camera as strokes, painted in Instagram's gradient.
 * Used in the nav pill and the footer: recognisable by colour alone, with the
 * visual weight of the text beside it rather than a solid block that would
 * out-shout the links that matter.
 *
 * Drawn inline at the proportions the official mark uses, so it reads
 * correctly at 20px. The gradient is defined in user space, not per shape:
 * the frame, the lens and the dot all sample ONE gradient laid across the
 * whole mark (yellow at the lower left rising through red and magenta to
 * blue-violet at the upper right), so the dot comes out violet as it should,
 * not a rainbow of its own. The gradient's id comes from useId, so two marks
 * on one page — there are always two, nav and footer — never share an id and
 * never resolve to each other's <defs>.
 *
 * The gradient is Instagram's, not ours. CLAUDE.md's palette section records
 * the third-party-mark exception this relies on.
 */
export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        {/* 30% / 107% / 150% of the 24-unit box, in user units. */}
        <radialGradient id={id} gradientUnits="userSpaceOnUse" cx="7.2" cy="25.7" r="36">
          <stop offset="0" stopColor="#fdf497" />
          <stop offset="0.05" stopColor="#fdf497" />
          <stop offset="0.45" stopColor="#fd5949" />
          <stop offset="0.6" stopColor="#d6249f" />
          <stop offset="0.9" stopColor="#285aeb" />
        </radialGradient>
      </defs>
      <g fill="none" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.4" />
        <circle cx="12" cy="12" r="4.1" />
      </g>
      <circle cx="17.4" cy="6.6" r="1.2" fill={`url(#${id})`} />
    </svg>
  );
}
