import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { VENUE } from "@/lib/assets";
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

const SITE_URL = "https://zoi-ranchi.vercel.app";
const DESCRIPTION =
  "Zoi is a fine-dining restaurant in Ranchi — low light, long dinners, and plates built to order. Reserve your table at JD Hi Street Mall, Hindpiri.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Zoi — Fine Dining in Ranchi",
  description: DESCRIPTION,
  keywords: [
    "Zoi",
    "fine dining Ranchi",
    "restaurant Ranchi",
    "Hindpiri restaurant",
    "JD Hi Street Mall",
  ],
  openGraph: {
    title: "Zoi — Fine Dining in Ranchi",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Zoi",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/assets/brand/og.jpg",
        width: 1200,
        height: 630,
        alt: "The dining room at Zoi, Ranchi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zoi — Fine Dining in Ranchi",
    description: DESCRIPTION,
    images: ["/assets/brand/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0F1A",
};

/** Static JSON-LD so search engines get the exact NAP for the venue. */
const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Zoi",
  description: DESCRIPTION,
  url: SITE_URL,
  telephone: VENUE.phoneRaw,
  servesCuisine: "Fine Dining",
  priceRange: "₹₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: VENUE.address.street,
    addressLocality: VENUE.address.city,
    addressRegion: VENUE.address.region,
    addressCountry: VENUE.address.country,
  },
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
