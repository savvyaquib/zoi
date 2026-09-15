import { VENUE } from "@/lib/assets";

/**
 * Press feedback shared by every button on the site.
 *
 * Transform-only, so it stays on the compositor. No hand-rolled
 * `(hover: hover) and (pointer: fine)` wrapper: Tailwind v4 already emits `hover:`
 * inside `@media (hover: hover)`, which is the same guard against a tap on a phone
 * leaving the element stuck in its hover state.
 */
export const BUTTON_MOTION =
  "transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]";

export type ReservationDetails = {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  occasion: string;
  requests: string;
};

/**
 * Service window, in minutes past midnight.
 *
 * The venue is open noon to midnight, so 11:45 PM is the last quarter-hour slot
 * that still falls inside it. Nothing here invents a "last seating" rule — if
 * the restaurant wants to stop taking tables earlier, move LAST_SLOT.
 */
const FIRST_SLOT = 12 * 60;
const LAST_SLOT = 23 * 60 + 45;

/** Quarter-hour granularity: 7:15, 7:30, 7:45 — never 7:16. */
const SLOT_STEP = 15;

function toLabel(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function toValue(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Every bookable time, as `{ value: "19:30", label: "7:30 PM" }`.
 *
 * The dial in TimeDial generates its own positions from the clock face, so this
 * list no longer drives the picker. It stays because it is the canonical record of
 * what is bookable, and `formatTime` reads it to turn a stored "19:30" into the
 * "7:30 PM" that goes into the WhatsApp message.
 *
 * Not `<input type="time">`, then or now: a time input steps by the minute unless
 * you set `step`, looks different in every browser, and even with `step=900` a
 * visitor can type 7:16 and only discover it is unbookable on submit.
 */
export const TIME_SLOTS: ReadonlyArray<{
  value: string;
  label: string;
}> = Array.from(
  { length: Math.floor((LAST_SLOT - FIRST_SLOT) / SLOT_STEP) + 1 },
  (_, i) => {
    const minutes = FIRST_SLOT + i * SLOT_STEP;
    return { value: toValue(minutes), label: toLabel(minutes) };
  }
);

/** "2026-09-12" -> "Sat, 12 Sep 2026". Falls back to the raw value if unparsable. */
export function formatDate(iso: string): string {
  // Parsed as LOCAL midnight, not UTC — `new Date("2026-09-12")` would be UTC and
  // can render as the previous day for anyone west of Greenwich.
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** "19:30" -> "7:30 PM". */
export function formatTime(value: string): string {
  return TIME_SLOTS.find((slot) => slot.value === value)?.label ?? value;
}

/**
 * The message the visitor sends. Plain text, one detail per line — it has to stay
 * readable in a WhatsApp bubble on a phone, which is where it will be read.
 */
export function formatReservationMessage(d: ReservationDetails): string {
  const lines = [
    `Hi ${VENUE.name}, I'd like to request a table.`,
    "",
    `Name: ${d.name.trim()}`,
    `Phone: ${d.phone.trim()}`,
    `Date: ${formatDate(d.date)}`,
    `Time: ${formatTime(d.time)}`,
    `Guests: ${d.guests}`,
    `Occasion: ${d.occasion}`,
  ];

  if (d.requests.trim()) {
    lines.push(`Special requests: ${d.requests.trim()}`);
  }

  return lines.join("\n");
}

/**
 * Deep link that opens WhatsApp with the request pre-typed.
 *
 * `wa.me` is the officially supported click-to-chat form and resolves correctly on
 * desktop (WhatsApp Web / the desktop app) as well as on a phone. The number must
 * be digits only — no `+`, no spaces.
 *
 * Nothing is sent automatically: WhatsApp opens with the text prefilled and the
 * visitor presses send. That is the honest behaviour to describe in the UI.
 */
export function buildWhatsAppUrl(details: ReservationDetails): string {
  const number = VENUE.phoneRaw.replace(/\D/g, "");
  const text = encodeURIComponent(formatReservationMessage(details));
  return `https://wa.me/${number}?text=${text}`;
}
