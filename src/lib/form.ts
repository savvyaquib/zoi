/**
 * Field chrome shared by every form on the site — reservations and careers
 * render from these so they read as one system, not two.
 *
 * `rounded-xl` rather than square, a slightly lifted surface so the input reads
 * as a distinct affordance against the navy, and a border that warms to orange
 * on focus. The focus ring stays — removing it is the single most common a11y
 * regression in a "premium" restyle.
 *
 * `[color-scheme:dark]` is what makes native pickers (date, file) render dark
 * instead of a white panel dropped onto a navy form.
 */
export const FIELD =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 font-sans " +
  "text-base text-white transition-colors duration-150 ease-out " +
  "placeholder:text-white/55 hover:border-white/25 focus:border-orange " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-navy [color-scheme:dark]";

export const LABEL =
  "mb-2 block font-sans text-[11px] tracking-[0.22em] text-white/55 uppercase";

/** Inline error under a field. Orange is the only warning colour the palette has. */
export const FIELD_ERROR = "mt-2 font-sans text-xs text-orange";
