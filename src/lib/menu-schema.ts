import type { Menu } from "@/data/menu-types";
import { SITE_URL } from "@/lib/assets";

/**
 * Schema.org `Menu` for a menu page — the structured-data shape Google reads
 * for restaurant rich results, built from the same data the page renders so
 * the two can never disagree.
 *
 *   Menu
 *   └─ hasMenuSection[]   one per section (Soups, Small Plates, …)
 *      └─ hasMenuItem[]   one per dish, with an Offer carrying price + INR
 *
 * Multi-price dishes (Rice & Noodles: Veg / Egg / Chicken) become one item
 * with several Offers, each named for its variant. Items with no price in the
 * PDF are omitted from the markup rather than given an empty Offer.
 */
export function menuSchema(menu: Menu, path: string) {
  const url = `${SITE_URL}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${url}#menu`,
    name: `Zoi ${menu.title} Menu`,
    url,
    inLanguage: "en-IN",
    hasMenuSection: menu.sections.map((section) => ({
      "@type": "MenuSection",
      name: section.title,
      url: `${url}#${section.id}`,
      ...(section.photo ? { image: `${SITE_URL}${section.photo.src}` } : {}),
      hasMenuItem: section.groups.flatMap((group) =>
        group.items.flatMap((item) => {
          const offers = item.prices
            ? item.prices.map((price, i) => ({
                "@type": "Offer",
                price,
                priceCurrency: "INR",
                ...(group.priceLabels?.[i] ? { name: group.priceLabels[i] } : {}),
              }))
            : item.price !== undefined
              ? [{ "@type": "Offer", price: item.price, priceCurrency: "INR" }]
              : [];
          if (offers.length === 0) return [];
          const diet = item.diet ?? group.diet;
          return [
            {
              "@type": "MenuItem",
              name: item.name,
              ...(item.description ? { description: item.description } : {}),
              ...(diet === "veg"
                ? { suitableForDiet: "https://schema.org/VegetarianDiet" }
                : {}),
              offers: offers.length === 1 ? offers[0] : offers,
            },
          ];
        })
      ),
    })),
  };
}
