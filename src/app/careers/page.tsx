import type { Metadata } from "next";
import { CareersForm } from "@/components/careers/CareersForm";
import { VENUE } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Careers at Zoi — Modern Dining in Hindpiri, Ranchi",
  description:
    "Work at Zoi, a modern dining and lifestyle destination in Ranchi. Kitchen, service, bar and management roles — send us your resume.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers at Zoi",
    description:
      "Kitchen, service, bar and management roles at Zoi, Ranchi. Send us your resume.",
    url: "/careers",
  },
};

/**
 * The careers page.
 *
 * Navy, on the reservation form's chrome, so it reads as a room in the same
 * building rather than a separate site. The copy leans on the client's own
 * line — Zoi is shaped by the people who fill it — because that is the honest
 * pitch to someone who would be one of those people.
 *
 * The HR address is read only inside the Server Action. Nothing on this page,
 * server or client, ever holds it.
 */
export default function CareersPage() {
  return (
    <main className="bg-navy text-white">
      <div className="mx-auto max-w-2xl px-5 pt-28 pb-24 md:px-8 md:pt-40 md:pb-32">
        <p className="font-display text-2xl text-orange italic md:text-3xl">Careers</p>
        <h1 className="mt-2 font-display text-4xl leading-[1.05] md:text-6xl">
          Work at {VENUE.name}
        </h1>

        <div className="mt-6 max-w-lg space-y-4 font-sans text-sm leading-relaxed text-white/65 md:text-base">
          <p>
            {VENUE.name} changes through the day — bright and easy over lunch, warm as the evening
            settles in, full of energy when the night comes alive. The people who work here are
            what makes that happen.
          </p>
          <p>
            If you have the craft — in the kitchen, on the floor, behind the bar — and you care
            about how people feel while they are here, we would like to hear from you. Tell us a
            little about yourself and attach your resume. It goes straight to the hiring team.
          </p>
        </div>

        <div className="mt-12">
          <CareersForm />
        </div>
      </div>
    </main>
  );
}
