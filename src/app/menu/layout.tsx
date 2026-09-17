import { Caveat, Fraunces, Montserrat } from "next/font/google";

/**
 * The menu's own type, loaded here so the home page never pays for it.
 *
 * ── Why these three ────────────────────────────────────────────────────────
 *
 * The printed menu is set in Astrid (food headings), SelfWritten (bar
 * headings) and Montserrat (everything else). The first two are commercial
 * faces with no web licence in hand, so the site uses the closest open faces
 * rather than embedding fonts it has no right to:
 *
 *   Astrid       → Fraunces, with its SOFT axis up. Astrid's whole character
 *                  is a rounded, slightly chunky display serif; Fraunces at
 *                  SOFT 100 is the nearest thing on Google Fonts, and it has
 *                  the italic and the weights the print menu leans on.
 *   SelfWritten  → Caveat. A marker-pen hand at 500–600 weight, upright and
 *                  bouncy in the same way, without tipping into "party
 *                  invitation" the way rounder scripts do.
 *   Montserrat   → Montserrat. The one that IS on Google Fonts.
 *
 * All self-hosted by next/font — no third-party request, no layout shift.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  axes: ["SOFT", "opsz"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

export default function MenuLayout({ children }: LayoutProps<"/menu">) {
  return (
    /*
      One wrapper carrying the font variables and the menu's own colour tokens.

      ── A deliberate, scoped exception to the four-colour palette ──────────
      CLAUDE.md fixes the site to orange / navy / white / blue. The client asked
      for the menu to look exactly like the printed one, which is cream paper
      with deep-red headings — so these two tokens exist, and they exist ONLY
      inside this wrapper. Nothing outside /menu can reach them, and nothing in
      here reaches for the site's orange or blue.
    */
    <div
      className={`${fraunces.variable} ${caveat.variable} ${montserrat.variable} menu-scope`}
      style={
        {
          "--menu-paper": "#f1ead8",
          "--menu-red": "#a11d26",
          "--menu-ink": "#0b0f1a",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
