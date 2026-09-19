import { SurfaceFlag } from "@/components/SurfaceFlag";
import { MenuMasthead } from "@/components/menu/MenuMasthead";
import { MenuShell } from "@/components/menu/MenuShell";
import { MenuSwitch } from "@/components/menu/MenuSwitch";

/*
  No fonts of its own. The menu once carried three faces to match the printed
  cards; it now speaks in the site's two — Glorify for headings, Maven Pro for
  everything else — which the root layout already loads. Nothing to preload
  on this route that the rest of the site does not.
*/
export default function MenuLayout({ children }: LayoutProps<"/menu">) {
  return (
    /*
      One wrapper carrying the font variables and the menu's own colour tokens.

      ── A deliberate, scoped exception to the four-colour palette ──────────
      CLAUDE.md fixes the site to orange / navy / white. The client asked
      for the menu to look exactly like the printed one, which is cream paper
      with deep-red headings — so these two tokens exist, and they exist ONLY
      inside this wrapper. Nothing outside /menu can reach them, and nothing in
      here reaches for the site's orange.

      ── What the layout owns, and why ──────────────────────────────────────
      Everything the two cards share is rendered HERE, once: the paper, the
      band behind the nav, the masthead with the Food | Bar switch, the docked
      copy of that switch, and the once-per-session loader. A layout persists
      across the navigation between its children, so switching cards swaps only
      the rail and the sections underneath — the switch slides, nothing above it
      blinks. A page component could not do that; it is unmounted with its route.
    */
    <div
      className="menu-scope"
      style={
        {
          "--menu-paper": "#f1ead8",
          "--menu-red": "#a11d26",
          "--menu-ink": "#0b0f1a",
        } as React.CSSProperties
      }
    >
      <MenuShell>
        <main className="bg-menu-paper bg-[url('/assets/menu/paper.jpg')] bg-[length:342px_342px] bg-repeat text-menu-ink">
          <SurfaceFlag surface="paper" />

          {/*
            A paper band behind the fixed nav. Without it the menu scrolls
            straight through the 76px above the rail and headings show half-cut
            behind the hamburger. Fixed, under the nav (z-20 < z-50), blurred
            like the rail so the two read as one surface. The docked switch
            measures its height to know when the masthead has gone under it.
          */}
          <div
            aria-hidden="true"
            data-menu-band
            className="fixed inset-x-0 top-0 z-20 h-[4.75rem] bg-menu-paper/95 backdrop-blur-sm md:h-[5.75rem]"
          />

          <MenuMasthead />
          {children}
        </main>
        <MenuSwitch variant="dock" />
      </MenuShell>

      {/* Without JS nothing animates in, so nothing may start hidden. */}
      <noscript>
        <style>{`[data-reveal],[data-reveal-rail]{opacity:1!important}`}</style>
      </noscript>
    </div>
  );
}
