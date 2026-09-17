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
