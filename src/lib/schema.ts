import { SITE_URL } from "@/lib/assets";

/**
 * A BreadcrumbList for one of the inner pages.
 *
 * Google reads this for the breadcrumb line under a result ("zoiworld.com ›
 * Menu › Bar") and, more usefully here, as the statement of how the pages
 * relate — that /menu/bar is a page OF the menu, which is a page OF Zoi. The
 * first crumb is always the home page; the last is the page itself.
 */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Zoi", path: "/" }, ...trail].map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path === "/" ? "" : crumb.path}`,
    })),
  };
}
