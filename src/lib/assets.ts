/**
 * Single source of truth for every asset path on the site.
 *
 * The real filenames in /public/assets do NOT match the names sketched in
 * CLAUDE.md, so everything routes through this module — renaming or re-exporting
 * assets is a one-file change and never a hunt through components.
 */

/**
 * Canonical origin for the site.
 *
 * Every absolute URL the site emits — canonical, og:url, og:image, twitter:image,
 * the JSON-LD `url` and `@id`, robots.txt and sitemap.xml — derives from this one
 * constant, so the production host is stated in exactly one place.
 *
 * It must be the host visitors actually reach, NOT a Vercel preview URL: a preview
 * hostname changes whenever the project is renamed, and every citation, Business
 * Profile link and share card pointing at the old one 404s silently.
 */
export const SITE_URL = "https://www.zoiworld.com";

/**
 * The 8 hero stills, cycled with hard cuts during the intro.
 *
 * All eight are unique (MD5-verified), 2400x1600, ~700 KB-1 MB each. They are
 * rendered through next/image, so what actually ships is an AVIF/WebP derivative
 * a fraction of that size.
 *
 * `alt` describes what is actually in each frame — these are the only photographs
 * of the room on the site, so an empty alt forfeits image search entirely for the
 * one thing a visitor to a restaurant like this searches for.
 *
 * Written from the frames themselves, not from the filenames. All eight are
 * INTERIOR shots: there is no food, no chef and no diner in any of them, so none
 * of them says otherwise. Location words appear where they are true; cuisine words
 * do not, because a photograph of an empty room is not evidence of a menu — that
 * claim belongs in the title, the description and `servesCuisine`, where it is
 * being made already.
 */
export const HERO_STILLS = [
  {
    src: "/assets/hero/hero-01.jpg",
    width: 2400,
    height: 1600,
    alt: "The main dining room at Zoi, Ranchi — cane-back chairs and fringed rattan pendant lights beneath an arched opening",
  },
  {
    src: "/assets/hero/hero-02.jpg",
    width: 2400,
    height: 1599,
    alt: "The long communal table at Zoi, laid for dinner with a runner of greenery down its centre",
  },
  {
    src: "/assets/hero/hero-03.jpg",
    width: 2400,
    height: 1600,
    alt: "Marble-top tables and cane chairs in the dining room at Zoi, Hindpiri, seen through the room's foliage",
  },
  {
    src: "/assets/hero/hero-04.jpg",
    width: 2400,
    height: 1600,
    alt: "Sculptural pendant lights above laid tables in the upper dining room at Zoi, Ranchi",
  },
  {
    src: "/assets/hero/hero-05.jpg",
    width: 2400,
    height: 1600,
    alt: "The bar at Zoi, Ranchi — glassware hung above a curved counter with a row of cane stools",
  },
  {
    src: "/assets/hero/hero-06.jpg",
    width: 2400,
    height: 1599,
    alt: "Curved banquette booths at Zoi, lit by table lamps beneath tall windows",
  },
  {
    src: "/assets/hero/hero-07.jpg",
    width: 2400,
    height: 1599,
    alt: "The illuminated Zoi wordmark at reception, between the arched doorways at JD Hi Street Mall, Hindpiri",
  },
  {
    src: "/assets/hero/hero-08.jpg",
    width: 2400,
    height: 1600,
    alt: "Arched doorways and potted palms along the entrance walkway into Zoi, Ranchi",
  },
] as const;

/**
 * The share card used by Open Graph and Twitter.
 *
 * Points at a real file that exists in the repo. The reception frame is the one
 * brand-forward still — the wordmark sits dead centre, so it survives the centre
 * crop every platform applies to reach its own aspect ratio.
 *
 * A purpose-built 1200x630 export would be better still; this is the honest
 * stopgap, and it is emphatically better than the 404 it replaces.
 */
export const OG_IMAGE = {
  src: "/assets/hero/hero-07.jpg",
  width: 2400,
  height: 1599,
  alt: "The illuminated Zoi wordmark at the entrance to the restaurant in Ranchi",
} as const;

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
 * The still that opens the Ambience section — the reception, the lit mark
 * between the two arches. Delivered as a 2.7 MB PNG; re-encoded once to
 * mozjpeg at q78 (234 KB, 1536x1024) and served through next/image like every
 * other photograph, so a phone gets a 640px WebP of it, not the master.
 */
export const AMBIENCE_BANNER = {
  src: "/assets/ambience/ambience-banner.jpg",
  width: 1536,
  height: 1024,
  alt: "The reception at Zoi — the lit Zoi mark on a plaster wall between two carved wooden arches",
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
  hours: "Daily 12:00 PM – 12:00 AM",
  instagram: "@lifeatzoi",
  instagramUrl: "https://instagram.com/lifeatzoi",
} as const;
