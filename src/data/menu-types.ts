/**
 * The shape of a menu, shared by the food and bar data files and by every
 * component that renders them.
 *
 * Kept deliberately close to how the printed menu is organised — sections with
 * a large heading, optional sub-groups under a small red label (VEG / NON-VEG,
 * SIGNATURE RUM, WHISKEY BASED), and items with a price. Nothing here is
 * invented for the web; if the print menu changes, this is the file that
 * changes with it.
 */

export type Diet = "veg" | "non-veg";

/**
 * One of the printed menu's drawings, cut from the PDF with its paper ground
 * made transparent. Path under /assets/menu, with intrinsic size for next/image.
 */
export type Art = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** A wide drawing (the row of shot glasses) is given more room than a tall one. */
  wide?: boolean;
};

export type MenuItem = {
  name: string;
  description?: string;
  /** A single price in INR. Mutually exclusive with `prices`. */
  price?: number;
  /**
   * Several prices for one dish — Rice & Noodles is 325 / 375 / 395 across
   * VEG / EGG / CHICKEN. The labels come from the group's `priceLabels`, so
   * they are declared once per table rather than once per row.
   */
  prices?: number[];
  /**
   * Per-item marker. Only set where the printed menu shows a square beside the
   * item (mixed sections); sections that are wholly veg or non-veg carry the
   * marker on the group instead.
   */
  diet?: Diet;
  /** A short trailing line — "CONTAINS EGGS", "Add ons: Chicken & Prawns." */
  note?: string;
  /** Variants printed under the name — "ONION / MASALA" under KULCHA. */
  variants?: string;
};

export type MenuGroup = {
  /** The small red sub-heading. Absent when the section has one flat list. */
  label?: string;
  /** Marker shown beside the label, as on the print menu's VEG / NON-VEG headers. */
  diet?: Diet;
  /** Column headings when items carry `prices` — ["VEG", "EGG", "CHICKEN"]. */
  priceLabels?: string[];
  /**
   * A second drawing the print gives this sub-group on its own page — the blue
   * glass on the Signature Rum / Gin / Tequila page, the arch on the Indian
   * Mains non-veg page. Small, beside the label.
   */
  art?: Art;
  items: MenuItem[];
};

export type MenuSection = {
  /** URL-safe, used for the category rail and deep links. */
  id: string;
  title: string;
  /** The drawing printed beside this section's heading. */
  art?: Art;
  /**
   * A photograph that opens the section, full width — the print menu places
   * three of these as spreads before Soups, Dim Sum and Biryani.
   */
  photo?: { src: string; width: number; height: number; alt: string };
  groups: MenuGroup[];
};

export type Menu = {
  id: "food" | "bar";
  title: string;
  /** The small-print line under every page of the printed menu. */
  disclaimer: string;
  sections: MenuSection[];
  /**
   * The back page. The food menu closes on an invitation to host a
   * celebration; the bar menu has no equivalent page.
   */
  closing?: {
    title: string;
    body: string[];
    art: Art;
    /** Contact printed on that page — kept as printed, with its own number. */
    phone?: string;
    email?: string;
  };
};
