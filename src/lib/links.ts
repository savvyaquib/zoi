/**
 * The in-page sections, as links that work from ANY page.
 *
 * Every href carries the leading slash — `/#about`, not `#about`. On the home
 * page the two behave identically. From any other page a bare `#about` does
 * nothing at all: it changes the URL fragment and the browser looks for an
 * element that is not there. `/#about` navigates home and lands on the section.
 *
 * Nav and Footer both render this list, so adding a section is a one-line change
 * here and cannot leave the two out of step.
 */
export const SECTION_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Ambience", href: "/#ambience" },
  { label: "Reserve", href: "/#reserve" },
] as const;

/** Back to the top of the home page. */
export const HOME_LINK = "/#hero";

/**
 * What the hamburger opens: the home sections with the menu slotted in before
 * Reserve — read, look, choose, book. Menu is a real page, so the click
 * handlers' hash lookup finds nothing and the browser simply navigates.
 */
export const NAV_LINKS = [
  SECTION_LINKS[0],
  SECTION_LINKS[1],
  { label: "Menu", href: "/menu" },
  SECTION_LINKS[2],
] as const;

/**
 * Careers is not one of the nav's four destinations. The nav is for someone
 * deciding whether to book a table; a job link among those four is noise to
 * almost everyone who opens it. It appears twice, both times as a quieter,
 * secondary link: in the footer, where people expect it, and pinned to the
 * bottom of the opened nav, under the four, for anyone who opens the menu
 * looking for it.
 */
export const CAREERS_LINK = { label: "Careers", href: "/careers" } as const;

/** The footer's list: the nav, plus the pages that are not for diners. */
export const FOOTER_LINKS = [...NAV_LINKS, CAREERS_LINK] as const;

/**
 * "/#about" -> "#about", for `document.querySelector`.
 *
 * The full href is NOT a valid selector — a leading slash throws a SyntaxError —
 * so the click handlers that smooth-scroll on the home page query by the hash
 * alone. When the hash matches nothing (we are on another page), the handler
 * stands down and the browser follows the full href home.
 */
export function hashOf(href: string): string {
  const i = href.indexOf("#");
  return i === -1 ? "" : href.slice(i);
}
