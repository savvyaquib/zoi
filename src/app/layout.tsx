import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { OG_IMAGE, SITE_URL, VENUE } from "@/lib/assets";
import "./globals.css";

/** Display face for the huge scroll words. Its true italic also covers the
 *  script-style reservation heading, so no third font is needed. */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPTION =
  "Zoi is a fine-dining restaurant at JD Hi Street Mall, Hindpiri, Ranchi — serving Asian, Continental & North Indian cuisine. Reserve your table for lunch or dinner, open daily 12 PM – 11 PM.";

/**
 * Shorter than the <title>, and deliberately so.
 *
 * A social card is not a SERP result: there is no query to match, the pipe and the
 * CTA read as clutter in a WhatsApp preview, and the card already carries its own
 * button. This keeps the punchier form for sharing while the page title stays
 * optimised for search.
 */
const SOCIAL_TITLE = "Zoi — Fine Dining in Ranchi";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Zoi — Fine Dining Restaurant in Hindpiri, Ranchi | Reserve a Table",
  description: DESCRIPTION,
  keywords: [
    "Zoi",
    "fine dining Ranchi",
    "restaurant Ranchi",
    "Hindpiri restaurant",
    "JD Hi Street Mall",
  ],
  /*
    One page, so the canonical is simply the origin. Resolved against
    `metadataBase`, which means a preview deployment still declares the production
    URL as authoritative instead of competing with it for the same content.
  */
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SOCIAL_TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Zoi",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: OG_IMAGE.src,
        width: OG_IMAGE.width,
        height: OG_IMAGE.height,
        alt: OG_IMAGE.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.src],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0F1A",
};

/**
 * Static JSON-LD so search engines get the exact NAP for the venue.
 *
 * Every value here reads from the same `VENUE` constant the footer renders, so the
 * address, phone and hours in the markup cannot drift from the address, phone and
 * hours a visitor sees. That consistency is the whole point of a citation.
 *
 * Deliberately NOT included, because inventing them would be worse than omitting
 * them — each needs a real value from the Google Business Profile before it ships:
 *   geo             — GeoCoordinates. A 4th-floor unit inside a mall is exactly
 *                     where text geocoding fails, so wrong coordinates would put
 *                     the pin on the wrong building.
 *   hasMap          — the profile's own maps URL.
 *   postalCode      — not recorded anywhere in this repo.
 *   paymentAccepted — not confirmed with the venue.
 *   aggregateRating — self-supplied ratings breach Google's guidelines and risk a
 *                     manual action. Ratings belong on the profile, where they are
 *                     earned.
 */
const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  // Stable identifier, so later markup can reference this entity by name.
  "@id": `${SITE_URL}/#restaurant`,
  name: VENUE.name,
  description: DESCRIPTION,
  url: SITE_URL,
  // Recommended for local business types; it is what carries the visual into
  // rich results. Without it the business has no picture anywhere in the index.
  image: [`${SITE_URL}${OG_IMAGE.src}`],
  telephone: VENUE.phoneRaw,
  /*
    "Fine Dining" was never a cuisine — it is a service style, and it told Google
    nothing about what the kitchen cooks. Now that the title, description and About
    copy all name the three cuisines, this says the same thing in the one field
    built to be read by machines.
  */
  servesCuisine: ["Asian", "Continental", "North Indian"],
  priceRange: "₹₹₹",
  currenciesAccepted: "INR",
  // The site's entire purpose. Previously unstated, so Google could not surface a
  // reserve action for a business whose primary CTA is reserving a table.
  acceptsReservations: true,
  address: {
    "@type": "PostalAddress",
    streetAddress: VENUE.address.street,
    addressLocality: VENUE.address.city,
    addressRegion: VENUE.address.region,
    addressCountry: VENUE.address.country,
  },
  // The 24-hour form of VENUE.hours ("Daily 12:00 PM – 11:00 PM"), which is the
  // string the footer prints. Change both together.
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "12:00",
    closes: "23:00",
  },
  sameAs: [VENUE.instagramUrl],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} antialiased`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
