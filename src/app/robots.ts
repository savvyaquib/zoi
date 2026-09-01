import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/assets";

/**
 * Served at /robots.txt, generated at build time.
 *
 * Everything is crawlable — there is one page and nothing private on it. The file
 * exists mainly to advertise the sitemap: robots.txt is the one location every
 * crawler checks without being told, so it is how anything other than Google finds
 * the sitemap at all.
 *
 * No AI-crawler blocks. The site wants to be cited by assistants answering "where
 * should I eat in Ranchi" — that is a discovery channel for a restaurant, not a
 * threat. Add disallows here only if the client asks for them.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
