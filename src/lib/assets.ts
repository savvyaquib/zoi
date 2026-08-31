/**
 * Single source of truth for every asset path on the site.
 *
 * The real filenames in /public/assets do NOT match the names sketched in
 * CLAUDE.md, so everything routes through this module — renaming or re-exporting
 * assets is a one-file change and never a hunt through components.
 */

/**
 * The 8 hero stills, cycled with hard cuts during the intro.
 *
 * All eight are unique (MD5-verified), 2400x1600, ~700 KB-1 MB each. They are
 * rendered through next/image, so what actually ships is an AVIF/WebP derivative
 * a fraction of that size.
 */
export const HERO_STILLS = [
  { src: "/assets/hero/hero-01.jpg", width: 2400, height: 1600 },
  { src: "/assets/hero/hero-02.jpg", width: 2400, height: 1599 },
  { src: "/assets/hero/hero-03.jpg", width: 2400, height: 1600 },
  { src: "/assets/hero/hero-04.jpg", width: 2400, height: 1600 },
  { src: "/assets/hero/hero-05.jpg", width: 2400, height: 1600 },
  { src: "/assets/hero/hero-06.jpg", width: 2400, height: 1599 },
  { src: "/assets/hero/hero-07.jpg", width: 2400, height: 1599 },
  { src: "/assets/hero/hero-08.jpg", width: 2400, height: 1600 },
] as const;

/**
 * Hero loop video. Exactly ONE of these is ever fetched — the source is chosen in
 * JS from a matchMedia result before the element gets a src, never by shipping two
 * <source> tags (the browser would fetch on type, not on breakpoint).
 *
 * ── Why the `-cropped` encodes ──────────────────────────────────────────────
 *
 * The originals were letterboxed: a 2.22:1 picture padded into a 16:9 container
 * with hard black bars — 108px top and bottom on the desktop file, 72px on the
 * mobile one (confirmed with ffmpeg cropdetect). Those bars were baked into the
 * pixels, so `object-cover` rendered them as a black band across the top of the
 * hero. No CSS fixes that; the frame itself had to be cut.
 *
 * These crop to the real picture, so they are full-bleed AND smaller than the
 * files they replaced — 20% fewer pixels, and no bitrate spent on black:
 *   desktop 1920x864 / 6.97 MB (was 1920x1080 / 9.2 MB)
 *   mobile  1280x576 / 2.58 MB (was 1280x720 / 3.3 MB)
 *
 * Both are 11.60s. The uncropped originals have been deleted — re-cut from the
 * masters with `crop=1920:864:0:108` if you ever need to regenerate these.
 */
export const HERO_VIDEO = {
  desktop: "/assets/hero/hero-cropped.mp4",
  mobile: "/assets/hero/hero-mobile-cropped.mp4",
  poster: "/assets/hero/hero-poster-cropped.webp",
  /** Below this width the lighter encode is used. */
  breakpoint: 1024,
} as const;

/**
 * Ambience gallery panels, in the order they were delivered.
 *
 * All seven are 1600x2400 — a clean 2:3 portrait, which is why the cards are laid
 * out `aspect-[2/3]` and never letterboxed.
 *
 * The old `gallery/` subfolder these used to point at no longer exists; every path
 * in it was a 404 after the asset drop. `alt` is real description rather than a
 * caption because the reference shows no caption text under the cards — the words
 * exist for screen readers, not for layout.
 */
export const AMBIENCE_GALLERY = [
  { src: "/assets/ambience/ambience-01.jpg", alt: "The dining room under warm pendant light" },
  { src: "/assets/ambience/ambience-02.jpg", alt: "A table set before service" },
  { src: "/assets/ambience/ambience-03.jpg", alt: "The bar, mid-evening" },
  { src: "/assets/ambience/ambience-04.jpg", alt: "Arched seating along the far wall" },
  { src: "/assets/ambience/ambience-05.jpg", alt: "Plates arriving at the pass" },
  { src: "/assets/ambience/ambience-06.jpg", alt: "Low light across the banquettes" },
  { src: "/assets/ambience/ambience-07.jpg", alt: "The room filling up after dark" },
] as const;

export const BRAND = {
  /**
   * The only brand file on the site, used by the loader and the footer.
   *
   * It is genuinely transparent — 4-channel with alpha — which is why it is the
   * one that survived. The opaque `zoi.png` / `zoi-without-bg.png` variants were
   * deleted: nothing referenced them, and the latter was 3-channel despite its
   * name, so it painted its own background and showed as a black box on navy.
   *
   * No SVG exists; one would scale more cleanly and drop ~130 KB if you can export
   * it from the brand source.
   */
  logo: { src: "/assets/brand/zoi-logo.png", width: 3130, height: 2700 },
  /**
   * The bare Z, exactly #0b0f1a on transparent (4-channel RGBA, verified by
   * sampling: 949 of 1369 opaque pixels are that value on the nose).
   *
   * Used as a CSS MASK rather than an <Image>. Only the alpha channel matters —
   * the colour is painted from the `navy` palette token underneath it, because
   * next/image's lossy WebP re-encode measurably shifts a flat mark like this
   * (~#070d15 across 69 shades). See the note at its usage in Nav.tsx.
   *
   * Its swash tail sweeps to the RIGHT, so the nav flips it horizontally to sweep
   * left instead — the tail then leads the eye toward the links on the other
   * panel rather than off the edge of the screen.
   */
  z: { src: "/assets/brand/z.png", width: 1918, height: 1504 },
} as const;

/**
 * The reservation dining shot.
 *
 * 1600x2400 — the same clean 2:3 portrait as the ambience set, and 0.67 MB where
 * the file it replaced was 7.70 MB. The old `photo.jpg` is gone; the path changed
 * with it, so this is not just a dimension update.
 */
export const RESERVATION_IMAGE = {
  src: "/assets/reservation/reservation.jpg",
  width: 1600,
  height: 2400,
} as const;

/** Venue facts — exact values from CLAUDE.md. Do not invent variations. */
export const VENUE = {
  name: "Zoi",
  tagline: "Life at Zoi — where every night becomes a story.",
  address: {
    line: "4th Floor, JD Hi Street Mall, Mahatma Gandhi Main Road, Hindpiri, Ranchi",
    street: "4th Floor, JD Hi Street Mall, Mahatma Gandhi Main Road, Hindpiri",
    city: "Ranchi",
    region: "Jharkhand",
    country: "IN",
  },
  phone: "+91 77799 74888",
  /** E.164, for tel: and wa.me links. */
  phoneRaw: "+917779974888",
  hours: "Daily 12:00 PM – 11:00 PM",
  instagram: "@lifeatzoi",
  instagramUrl: "https://instagram.com/lifeatzoi",
} as const;
