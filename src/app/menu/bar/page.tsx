import type { Metadata } from "next";
import { BAR_MENU } from "@/data/menu-bar";
import { OG_IMAGE } from "@/lib/assets";
import { MenuPage } from "@/components/menu/MenuPage";
import { menuSchema } from "@/lib/menu-schema";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Bar Menu — Zoi, Ranchi | Cocktails, Spirits, Wine, Mocktails & Coffee",
  description:
    "Zoi's bar menu with prices: signature and classic cocktails, spirits, wines, beers, mocktails, milkshakes, coffee and tea. JD Hi Street Mall, Ranchi.",
  alternates: { canonical: "/menu/bar" },
  openGraph: {
    title: "Zoi Menu — Bar",
    description: "Signature cocktails to cold brew, with prices. Modern dining at JD Hi Street Mall, Hindpiri, Ranchi.",
    url: "/menu/bar",
    images: [{ url: OG_IMAGE.src, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: OG_IMAGE.alt }],
  },
};

/** /menu/bar — the drinks card. See /menu for why each card is its own page. */
export default function BarMenuPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema(BAR_MENU, "/menu/bar")) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Menu", path: "/menu" }, { name: "Bar", path: "/menu/bar" }])) }}
      />
      <MenuPage menu={BAR_MENU} />
    </>
  );
}
