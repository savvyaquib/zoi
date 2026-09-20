import type { Metadata } from "next";
import { FOOD_MENU } from "@/data/menu-food";
import { MenuPage } from "@/components/menu/MenuPage";
import { menuSchema } from "@/lib/menu-schema";
import { pageOpenGraph } from "@/lib/og";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Menu — Zoi, Hindpiri, Ranchi | Food, Small Plates, Mains & Desserts",
  description:
    "Zoi's food menu with prices: soups, small plates, dim sum, pizza, hand-made pasta, Thai, grills, Indian mains, biryani and desserts. Hindpiri, Ranchi.",
  alternates: { canonical: "/menu" },
  openGraph: pageOpenGraph({
    title: "Zoi Menu — Food",
    description: "Small plates to biryani, with prices. Modern dining at JD Hi Street Mall, Hindpiri, Ranchi.",
    url: "/menu",
    // The one landscape food photograph. Share cards are landscape everywhere;
    // the portrait shared-table shot came through cropped to a strip of tabletop.
    images: [{ url: "/assets/menu/photo-dim-sum.jpg", width: 1173, height: 830, alt: "Bao and dumplings in a bamboo steamer at Zoi, Ranchi" }],
  }),
};

/**
 * /menu — the food card.
 *
 * Its own URL, its own title, its own structured data. "Zoi menu", "small plates
 * Ranchi", "biryani JD Hi Street" are menu-intent searches, and they need a
 * page whose whole subject is the menu rather than a fragment of the home page.
 */
export default function FoodMenuPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema(FOOD_MENU, "/menu")) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Menu", path: "/menu" }])) }}
      />
      <MenuPage menu={FOOD_MENU} />
    </>
  );
}
