import type { Metadata } from "next";
import { BAR_MENU } from "@/data/menu-bar";
import { MenuPage } from "@/components/menu/MenuPage";
import { menuSchema } from "@/lib/menu-schema";

export const metadata: Metadata = {
  title: "Bar Menu — Zoi, Ranchi | Cocktails, Spirits, Wine, Mocktails & Coffee",
  description:
    "The bar at Zoi, Ranchi: signature and classic cocktails, shots and long drinks, single malts and spirits, wines, beers, mocktails, milkshakes, matcha, tea and coffee — with prices.",
  alternates: { canonical: "/menu/bar" },
  openGraph: {
    title: "Zoi Menu — Bar",
    description: "Signature cocktails to cold brew, with prices. Modern dining at JD Hi Street Mall, Hindpiri, Ranchi.",
    url: "/menu/bar",
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
      <MenuPage menu={BAR_MENU} />
    </>
  );
}
