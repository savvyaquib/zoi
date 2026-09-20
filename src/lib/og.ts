import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/assets";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/**
 * The Open Graph card for one page.
 *
 * Next.js merges metadata field by field, not deeply: a page that sets
 * `openGraph` at all replaces the root layout's object outright, so /menu and
 * /careers were shipping cards with no `og:site_name`, `og:locale` or `og:type`
 * — a share of the menu came up with no site name under it. Every page builds
 * its card through this instead, so the three site-wide fields are stated
 * once and cannot be dropped again.
 *
 * `url` is relative; Next resolves it against `metadataBase`, which keeps a
 * preview deployment pointing at the production origin. `images` defaults to
 * the brand card and can be overridden with a page's own photograph.
 */
export function pageOpenGraph(page: {
  title: string;
  description: string;
  url: string;
  images?: OpenGraph["images"];
}): OpenGraph {
  return {
    siteName: "Zoi",
    locale: "en_IN",
    type: "website",
    images: [{ url: OG_IMAGE.src, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: OG_IMAGE.alt }],
    ...page,
  };
}
