/**
 * The Instagram glyph, drawn as strokes rather than one long filled path.
 *
 * It is the real mark — rounded square, concentric lens, offset dot — at the
 * proportions Instagram actually uses, so it reads correctly at 20px instead of
 * approximating the shape. Stroked also means it inherits weight sensibly and
 * stays crisp at any size. Shared by the nav pill and the footer, so the two
 * are the same drawing.
 */
export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.4" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}
