"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { RESERVATION_IMAGE, VENUE } from "@/lib/assets";
import {
  BUTTON_MOTION,
  TIME_GROUPS,
  buildWhatsAppUrl,
  formatTime,
  groupForTime,
  type ReservationDetails,
} from "@/lib/reservation";

const GUEST_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9+"];
const OCCASION_OPTIONS = [
  "Just dinner",
  "Birthday",
  "Anniversary",
  "Business",
  "Celebration",
];

const EMPTY: ReservationDetails = {
  name: "",
  phone: "",
  date: "",
  time: "",
  guests: "2",
  occasion: "Just dinner",
  requests: "",
};

type Errors = Partial<Record<keyof ReservationDetails, string>>;

function validate(values: ReservationDetails): Errors {
  const errors: Errors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Please enter your name.";
  }

  const digits = values.phone.replace(/\D/g, "");
  if (digits.length < 10) {
    errors.phone = "Please enter a phone number we can reach you on.";
  }

  if (!values.date) {
    errors.date = "Please choose a date.";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(`${values.date}T00:00:00`) < today) {
      errors.date = "Please choose today or a later date.";
    }
  }

  if (!values.time) errors.time = "Please choose a time.";
  if (!values.guests) errors.guests = "Please select how many are joining.";

  return errors;
}

/**
 * Shared field chrome.
 *
 * `rounded-xl` rather than square, a slightly lifted surface so the input reads as
 * a distinct affordance against the navy, and a border that warms to orange on
 * focus. The focus ring stays — removing it is the single most common a11y
 * regression in a "premium" restyle.
 *
 * `[color-scheme:dark]` is what makes the native date picker render dark instead
 * of a white panel dropped onto a navy form.
 */
const FIELD =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 font-sans " +
  "text-base text-white transition-colors duration-150 ease-out " +
  "placeholder:text-white/35 hover:border-white/25 focus:border-orange " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-navy [color-scheme:dark]";

const LABEL =
  "mb-2 block font-sans text-[11px] tracking-[0.22em] text-white/55 uppercase";

export function Reservation() {
  const uid = useId();
  const [values, setValues] = useState<ReservationDetails>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sentTo, setSentTo] = useState<string | null>(null);

  /**
   * Which service period the chip grid is showing.
   *
   * Seeded from the current value so the picker opens on the period the visitor
   * already chose rather than resetting to Lunch — relevant after a failed submit
   * sends focus back up the form.
   */
  const [period, setPeriod] = useState(() => groupForTime(EMPTY.time));
  const activeSlots =
    TIME_GROUPS.find((g) => g.label === period)?.slots ?? TIME_GROUPS[0].slots;

  const field = (name: keyof ReservationDetails) => `${uid}-${name}`;
  const errorId = (name: keyof ReservationDetails) => `${uid}-${name}-error`;

  const set = (name: keyof ReservationDetails, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    // Clear a field's error as soon as the visitor edits it.
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  /**
   * Deliberately synchronous. Opening a new tab has to happen inside the user
   * gesture that triggered it — an `await` first would hand the popup blocker a
   * reason to swallow the window.
   */
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the first field with a problem.
      const first = Object.keys(found)[0] as keyof ReservationDetails;
      document.getElementById(field(first))?.focus();
      return;
    }

    const url = buildWhatsAppUrl(values);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    // Blocked, or a browser that refuses the popup — go in this tab instead so the
    // request is never silently lost.
    if (!opened) window.location.href = url;
    setSentTo(url);
  };

  const today = new Date().toISOString().slice(0, 10);

  const fieldError = (name: keyof ReservationDetails) =>
    errors[name] ? (
      <p id={errorId(name)} className="mt-2 font-sans text-xs text-orange">
        {errors[name]}
      </p>
    ) : null;

  return (
    <section id="reserve" className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-12 md:py-28">
        <div className="relative h-[52svh] overflow-hidden rounded-3xl md:h-auto md:min-h-[44rem]">
          <Image
            src={RESERVATION_IMAGE.src}
            alt="A warmly lit table set for dinner at Zoi"
            fill
            loading="lazy"
            sizes="(min-width: 768px) 42vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="font-display text-3xl text-blue italic md:text-4xl">
            Reserve Your Table
          </p>
          <h2 className="mt-2 font-display text-4xl leading-[1.05] md:text-6xl">
            Plan Your Perfect Evening
          </h2>
          <p className="mt-5 max-w-md font-sans text-sm leading-relaxed text-white/60 md:text-base">
            Tell us when you are coming and we will have the room ready.{" "}
            {VENUE.hours}.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-9 flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor={field("name")} className={LABEL}>
                  Name
                </label>
                <input
                  id={field("name")}
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? errorId("name") : undefined}
                  className={FIELD}
                />
                {fieldError("name")}
              </div>

              <div>
                <label htmlFor={field("phone")} className={LABEL}>
                  Phone
                </label>
                <input
                  id={field("phone")}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+91"
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? errorId("phone") : undefined}
                  className={FIELD}
                />
                {fieldError("phone")}
              </div>

              <div>
                <label htmlFor={field("date")} className={LABEL}>
                  Date
                </label>
                <input
                  id={field("date")}
                  name="date"
                  type="date"
                  min={today}
                  value={values.date}
                  onChange={(e) => set("date", e.target.value)}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? errorId("date") : undefined}
                  className={FIELD}
                />
                {fieldError("date")}
              </div>

              <div>
                <label htmlFor={field("guests")} className={LABEL}>
                  Guests
                </label>
                <select
                  id={field("guests")}
                  name="guests"
                  value={values.guests}
                  onChange={(e) => set("guests", e.target.value)}
                  className={FIELD}
                >
                  {GUEST_OPTIONS.map((n) => (
                    <option key={n} value={n} className="bg-navy">
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={field("occasion")} className={LABEL}>
                  Occasion
                </label>
                <select
                  id={field("occasion")}
                  name="occasion"
                  value={values.occasion}
                  onChange={(e) => set("occasion", e.target.value)}
                  className={FIELD}
                >
                  {OCCASION_OPTIONS.map((o) => (
                    <option key={o} value={o} className="bg-navy">
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/*
              Time — a two-step picker, not a 44-option dropdown.

              Pick the period, then the slot. Every time is two taps and never
              more than about fifteen choices on screen at once, instead of one
              list you have to read end to end.

              Built on real radio inputs rather than styled buttons: a radiogroup
              gives arrow-key navigation, the selected state, and the group's name
              to a screen reader for free. The inputs are `sr-only` and the chip is
              the `peer-checked` sibling, so none of that is lost to make it look
              like this.
            */}
            <fieldset className="border-0 p-0">
              {/*
                A real <legend> names the group for assistive tech, but legends do
                not lay out reliably inside flex, so it is visually hidden and the
                visible row below carries the label plus the chosen slot. The
                chips are short-form ("7:30"), so this is where the full time is
                read back.
              */}
              <legend className="sr-only">Time</legend>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span aria-hidden="true" className={`${LABEL} mb-0`}>
                  Time
                </span>
                <span className="font-sans text-xs text-orange">
                  {values.time ? formatTime(values.time) : ""}
                </span>
              </div>

              {/*
                Toggle buttons with `aria-pressed`, NOT a tablist. A tab must own a
                tabpanel via `aria-controls`; these only filter which radios show,
                so calling them tabs would have a screen reader announcing a panel
                that does not exist.
              */}
              <div
                role="group"
                aria-label="Service period"
                className="inline-flex gap-1 rounded-full border border-white/12 bg-white/[0.04] p-1"
              >
                {TIME_GROUPS.map((group) => {
                  const active = group.label === period;
                  return (
                    <button
                      key={group.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPeriod(group.label)}
                      className={`rounded-full px-4 py-1.5 font-sans text-xs tracking-[0.08em] uppercase transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none ${
                        active
                          ? "bg-orange text-navy"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      {group.label}
                    </button>
                  );
                })}
              </div>

              <div
                role="radiogroup"
                aria-label="Time"
                aria-invalid={Boolean(errors.time)}
                aria-describedby={errors.time ? errorId("time") : undefined}
                className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8"
              >
                {activeSlots.map((slot, i) => (
                  <label key={slot.value} className="block cursor-pointer">
                    <input
                      /*
                        The first radio carries the field id so the submit handler's
                        `getElementById(field("time"))` still finds something to
                        focus. Losing the <select> would otherwise mean an invalid
                        submit silently focuses nothing.
                      */
                      id={i === 0 ? field("time") : undefined}
                      type="radio"
                      name={field("time")}
                      value={slot.value}
                      checked={values.time === slot.value}
                      onChange={() => set("time", slot.value)}
                      className="peer sr-only"
                    />
                    {/* Meridiem dropped — the period above already says which half. */}
                    <span className="block rounded-lg border border-white/12 bg-white/[0.05] py-2.5 text-center font-sans text-sm text-white/80 transition-colors duration-150 ease-out hover:border-white/30 peer-checked:border-orange peer-checked:bg-orange peer-checked:font-medium peer-checked:text-navy peer-focus-visible:ring-2 peer-focus-visible:ring-orange">
                      {slot.short}
                    </span>
                  </label>
                ))}
              </div>
              {fieldError("time")}
            </fieldset>

            <div>
              <label htmlFor={field("requests")} className={LABEL}>
                Special Requests
              </label>
              <textarea
                id={field("requests")}
                name="requests"
                rows={4}
                placeholder="A quiet corner, a cake at the end of the meal, anything at all."
                value={values.requests}
                onChange={(e) => set("requests", e.target.value)}
                className={`${FIELD} resize-y`}
              />
            </div>

            <button
              type="submit"
              className={`mt-2 inline-flex w-full items-center justify-center gap-3 rounded-full bg-orange px-9 py-4 font-sans text-sm font-medium tracking-[0.18em] text-navy uppercase focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy focus-visible:outline-none sm:w-auto ${BUTTON_MOTION}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.700-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.1.1-.1 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3a3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.5 3.9 1.7.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3Z" />
              </svg>
              Request a Table
            </button>

            {/* Announced to screen readers without stealing focus. */}
            <div role="status" aria-live="polite" className="font-sans text-sm">
              {sentTo && (
                <p className="text-white/65">
                  WhatsApp is opening with your request ready to send — press send to
                  reach us. If nothing happened,{" "}
                  <a
                    href={sentTo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue underline underline-offset-4"
                  >
                    open the chat
                  </a>{" "}
                  or call{" "}
                  <a
                    href={`tel:${VENUE.phoneRaw}`}
                    className="text-blue underline underline-offset-4"
                  >
                    {VENUE.phone}
                  </a>
                  .
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
