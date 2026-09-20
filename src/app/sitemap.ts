import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/assets";

/**
 * Last date each page's CONTENT meaningfully changed — not the build date.
 *
 * `new Date()` here would stamp a fresh lastmod on every deploy, including deploys
 * that only touched an animation curve. Crawlers learn to distrust a lastmod that
 * always says "just now", and the signal stops being worth anything. One date per
 * page, because the menu's prices change on a different day from the home copy;
 * bump the one that actually changed, by hand.
 */
const LAST_CONTENT_CHANGE = {
  home: new Date("2026-09-19"),
  menu: new Date("2026-09-18"),
  bar: new Date("2026-09-18"),
  careers: new Date("2026-09-17"),
};

/**
 * Served at /sitemap.xml, generated at build time.
 *
 * The home page, the two menu cards, and /careers. The #about / #ambience / #reserve targets are
 * fragments of the home page, not separate documents — listing them would claim
 * pages that do not exist and invite index-bloat warnings in Search Console.
 *
 * `priority` and `changeFrequency` are ignored by Google and read lightly by
 * Bing; they stay because they cost nothing and state the site's own ranking
 * of its pages for anyone who does read them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_CONTENT_CHANGE.home,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/menu`,
      lastModified: LAST_CONTENT_CHANGE.menu,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/menu/bar`,
      lastModified: LAST_CONTENT_CHANGE.bar,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/careers`,
      lastModified: LAST_CONTENT_CHANGE.careers,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
