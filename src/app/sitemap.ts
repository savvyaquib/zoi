import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/assets";

/**
 * Last date the page's CONTENT meaningfully changed — not the build date.
 *
 * `new Date()` here would stamp a fresh lastmod on every deploy, including deploys
 * that only touched an animation curve. Crawlers learn to distrust a lastmod that
 * always says "just now", and the signal stops being worth anything. Bump this by
 * hand when the copy, the menu or the venue details actually change.
 */
const LAST_CONTENT_CHANGE = new Date("2026-09-01");

/**
 * Served at /sitemap.xml, generated at build time.
 *
 * The home page and /careers. The #about / #ambience / #reserve targets are
 * fragments of the home page, not separate documents — listing them would claim
 * pages that do not exist and invite index-bloat warnings in Search Console.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_CONTENT_CHANGE,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/careers`,
      lastModified: LAST_CONTENT_CHANGE,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
