import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { OG_IMAGE, SITE_URL, VENUE } from "@/lib/assets";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Footer } from "@/components/sections/Footer";
import "./globals.css";

/**
 * Glorify — Zoi's own display face, the one the wordmark is drawn in. Used for
 * the huge scroll words and every heading outside the menu.
 *
 * Self-hosted from /src/fonts as WOFF2 (12 KB a weight, against 28 KB for the
 * TTFs the client supplied; the pack itself is kept in /fonts as the source).
 * Four weights are declared so the family answers to any weight utility; the
 * site sets its display type at 400 today. next/font preloads every file
 * listed here on every page, which is why the four lighter and heavier cuts
 * in the pack are not — add one here the day a design calls for it.
 *
 * There is no italic in the family. Where the site asks for one (the small
 * label above a heading, the footer line) the browser slants the upright, and
 * that is the intended look now, not the calligraphic italic Playfair had.
 *
 * adjustFontFallback writes a metrics-matched fallback so the line boxes are
 * the same size before and after the font lands — no shift on swap.
 */
const glorify = localFont({
  variable: "--font-glorify",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
  src: [
    { path: "../fonts/Glorify-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Glorify-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Glorify-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Glorify-Bold.woff2", weight: "700", style: "normal" },
  ],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * "Modern dining" is how Zoi describes itself; "fine dining" is what a lot of
 * people type when they are looking for exactly this kind of room. The copy
 * leads with the first and carries the second as a qualifier, so a search for
 * either lands here without the page contradicting itself.
 */
const DESCRIPTION =
  "Zoi is a modern dining restaurant at JD Hi Street Mall, Hindpiri, Ranchi — a fine-dining experience with Asian, Continental & North Indian cuisine. Reserve a table for lunch or dinner, open daily from noon to midnight.";

/**
 * Shorter than the <title>, and deliberately so.
 *
 * A social card is not a SERP result: there is no query to match, the pipe and the
 * CTA read as clutter in a WhatsApp preview, and the card already carries its own
 * button. This keeps the punchier form for sharing while the page title stays
 * optimised for search.
 */
const SOCIAL_TITLE = "Zoi — Modern Dining in Ranchi";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Zoi — Modern Dining Restaurant in Hindpiri, Ranchi | Reserve a Table",
  description: DESCRIPTION,
  /*
    Google has ignored this tag since 2009; Bing and some directories still read
    it lightly. Cheap to keep honest. Both dining terms, the three cuisines the
    kitchen actually cooks, the neighbourhood, and "late night" — which is true
    now that the doors close at midnight.
  */
  keywords: [
    "Zoi",
    "modern dining Ranchi",
    "fine dining Ranchi",
    "restaurant Ranchi",
    "Hindpiri restaurant",
    "JD Hi Street Mall",
    "Asian restaurant Ranchi",
    "Continental restaurant Ranchi",
    "North Indian restaurant Ranchi",
    "late night restaurant Ranchi",
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
  /*
    Restaurant inherits `keywords` from Place and Organization, so this is
    legitimate here. It is where the "modern vs fine dining" question is settled
    for a machine: the business calls itself the first, and is a correct answer
    to a search for the second.
  */
  keywords: "modern dining, fine dining, Asian, Continental, North Indian, late night, Ranchi, Hindpiri",
  priceRange: "₹₹₹",
  currenciesAccepted: "INR",
  // The site's entire purpose. Previously unstated, so Google could not surface a
  // reserve action for a business whose primary CTA is reserving a table.
  acceptsReservations: true,
  // The two cards, each a page with its own Menu markup. This is the link
  // Google follows from the business to what it serves.
  hasMenu: [`${SITE_URL}/menu`, `${SITE_URL}/menu/bar`],
  address: {
    "@type": "PostalAddress",
    streetAddress: VENUE.address.street,
    addressLocality: VENUE.address.city,
    addressRegion: VENUE.address.region,
    addressCountry: VENUE.address.country,
  },
  /*
    The 24-hour form of VENUE.hours ("Daily 12:00 PM – 12:00 AM"), which is the
    string the footer prints. Change both together.

    `closes` is 23:59, not 00:00. Google's own LocalBusiness examples use 23:59
    to mean "through the end of the day"; 00:00 reads as the start of the same
    day to some validators and as next-day-midnight to others, which is exactly
    the ambiguity a schema exists to remove.
  */
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
    closes: "23:59",
  },
  sameAs: [VENUE.instagramUrl],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${glorify.variable} ${inter.variable} antialiased`}>
      {/*
        Grammarly and its kind write their own attributes onto <body> before
        React hydrates; React then reports a mismatch that is not ours. The
        suppression covers this element's attributes only, nothing below it.
      */}
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        {/*
          The chrome every page shares: smooth scroll, the nav, the progress bar,
          the footer. Pages supply only their own <main>.

          The loader and its PreloadProvider are deliberately NOT here. They gate
          on the hero's stills and video, so they belong to the home page alone —
          a menu or careers page has nothing to wait for and should not open on a
          three-second curtain. Nav and Footer read Lenis only, never the
          preloader, which is what lets them sit above it.
        */}
        <SmoothScroll>
          <Nav />
          <ScrollProgress />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
