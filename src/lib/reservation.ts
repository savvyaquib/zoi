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
 * The venue is open 12:00 PM - 11:00 PM, so 10:45 PM is the last quarter-hour
 * slot that still falls inside it. Nothing here invents a "last seating" rule —
 * if the restaurant wants to stop taking tables earlier, move LAST_SLOT.
 */
const FIRST_SLOT = 12 * 60;
const LAST_SLOT = 22 * 60 + 45;

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
 * A <select> of these rather than <input type="time"> deliberately. A time input
 * steps by the minute unless you set `step`, its picker looks different in every
 * browser, and even with `step=900` a visitor can still type 7:16 and only find
 * out it is invalid on submit. A select cannot express an unbookable time at all.
 */
export const TIME_SLOTS: ReadonlyArray<{
  value: string;
  label: string;
  /** Meridiem-free, for chips that already sit under a Lunch/Evening/Dinner heading. */
  short: string;
}> = Array.from(
  { length: Math.floor((LAST_SLOT - FIRST_SLOT) / SLOT_STEP) + 1 },
  (_, i) => {
    const minutes = FIRST_SLOT + i * SLOT_STEP;
    const label = toLabel(minutes);
    return { value: toValue(minutes), label, short: label.replace(/ [AP]M$/, "") };
  }
);

/**
 * The same slots, cut into service periods.
 *
 * Forty-four times in one list is a scroll-and-hunt: the visitor has to read the
 * whole thing to find the one they want. Split three ways it is ~15 per view,
 * which is scannable at a glance, and "Dinner" is a word people already think in
 * — they pick the period first and the time second, which is how they decide
 * anyway.
 *
 * Boundaries are exclusive upper hours, so the groups tile the window with no
 * slot in two places and none missed.
 */
const GROUP_BOUNDS = [
  { label: "Lunch", untilHour: 16 },
  { label: "Evening", untilHour: 20 },
  { label: "Dinner", untilHour: 24 },
] as const;

export const TIME_GROUPS = GROUP_BOUNDS.map((group, i) => ({
  label: group.label,
  slots: TIME_SLOTS.filter((slot) => {
    const hour = Number(slot.value.slice(0, 2));
    const from = i === 0 ? 0 : GROUP_BOUNDS[i - 1].untilHour;
    return hour >= from && hour < group.untilHour;
  }),
}));

/** Which period a stored value belongs to, so the picker opens on the right one. */
export function groupForTime(value: string): string {
  return (
    TIME_GROUPS.find((g) => g.slots.some((s) => s.value === value))?.label ??
    TIME_GROUPS[0].label
  );
}

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
