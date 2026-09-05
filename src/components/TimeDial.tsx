"use client";

import { useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * An analog clock face for choosing a reservation time.
 *
 * ── Why a clock works here specifically ──────────────────────────────────────
 *
 * A dial is usually a poor picker: it needs an AM/PM toggle, most positions are
 * unbookable, and it hides options behind a second stage. None of that applies to
 * Zoi. The venue serves 12:00 PM - 10:45 PM, so EVERY bookable hour is PM and
 * eleven of the twelve dial positions are live — only 11 is dark. There is no
 * meridiem to disambiguate and almost nothing disabled, which is the one shape of
 * opening hours a clock face actually fits.
 *
 * Quarter-hour granularity does the rest: the minute stage has four targets at
 * 12/3/6/9, not sixty.
 *
 * ── One tap is already a valid time ─────────────────────────────────────────
 *
 * Choosing an hour commits `H:00` immediately and moves to minutes with :00
 * already selected. So a visitor who taps "7" and stops has booked 7:00 PM rather
 * than a half-filled field, and the second tap only refines. Two stages, but never
 * a two-step obligation.
 *
 * ── Positioning ─────────────────────────────────────────────────────────────
 *
 * Numbers are placed with percentage `left`/`top`, which is layout-affecting — but
 * they are computed once and never animated, and percentages are what make the
 * face scale with its container instead of needing a resize listener. The rule
 * against animating layout properties is about the ones that change every frame;
 * only the hand moves here, and it moves on `transform` alone.
 */

/** Dial radius as a percentage of the face, for both the numbers and the hand. */
const RADIUS = 38;

/** 0deg is 12 o'clock; the dial advances clockwise. */
const STEP_DEGREES = 30;

/**
 * The dial numbers, in clock order, mapped to the 24-hour value each one means.
 *
 * Reading clockwise from the top: 12 PM (noon, 12), then 1 PM (13) through 11 PM
 * (23). The kitchen's last seating is 10:45 PM, so 11 is present for the sake of a
 * complete clock face and permanently disabled — a gap there would read as a bug.
 */
const HOURS = Array.from({ length: 12 }, (_, i) => {
  const display = i === 0 ? 12 : i;
  return { display, hour24: i === 0 ? 12 : 12 + i, degrees: i * STEP_DEGREES };
});

const MINUTES = [0, 15, 30, 45].map((minute, i) => ({
  minute,
  label: `:${String(minute).padStart(2, "0")}`,
  degrees: i * 90,
}));

const LAST_BOOKABLE_HOUR = 22;

/** Percentage coordinates of a point on the dial at `degrees` from 12 o'clock. */
function positionAt(degrees: number, radius = RADIUS) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    left: `${50 + radius * Math.cos(radians)}%`,
    top: `${50 + radius * Math.sin(radians)}%`,
  };
}

/** "19:30" -> { hour24: 19, minute: 30 }. Null for an unset or malformed value. */
function parse(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  return { hour24: Number(match[1]), minute: Number(match[2]) };
}

type Stage = "hour" | "minute";

export function TimeDial({
  value,
  onChange,
  onComplete,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  /**
   * Fired when a MINUTE is chosen — the point at which the visitor is done.
   * Choosing an hour does not fire it: the hour stage hands over to the minute
   * stage, so treating it as completion would close the dial mid-decision.
   */
  onComplete?: () => void;
  /** Set when the dial opens inside a popover, so focus lands on the face. */
  autoFocus?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [requestedStage, setRequestedStage] = useState<Stage>("hour");

  const parsed = parse(value);
  const selectedHour = parsed?.hour24 ?? null;
  const selectedMinute = parsed?.minute ?? null;

  /*
    Derived, not synchronised in an effect.

    A cleared value — a reset, or an error path that empties the form — has to put
    the dial back on the hour stage, or it reopens showing minutes for a time that
    no longer exists. Doing that with `useEffect(() => setStage(...))` would mean a
    setState inside an effect, and since `parse()` returns a fresh object every
    render the dependency would never be equal and it would fire on every pass.
    Computing the stage is the same rule expressed without a render cascade.
  */
  const stage: Stage = parsed ? requestedStage : "hour";
  const setStage = setRequestedStage;

  const activeDegrees =
    stage === "hour"
      ? HOURS.find((h) => h.hour24 === selectedHour)?.degrees
      : MINUTES.find((m) => m.minute === selectedMinute)?.degrees;

  const commit = (hour24: number, minute: number) =>
    onChange(`${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);

  /*
    Motion, declared once and shared by the hand and the two rings.

    The hand travels ACROSS the face, which is on-screen movement, so it takes the
    strong ease-in-out. The rings enter and exit, so they take the strong ease-out.
    Both stay under 300ms. Reduced motion keeps the opacity crossfade — it still
    explains which ring is live — and drops the travel, so the hand relocates
    instantly rather than sweeping.
  */
  const handMotion = reducedMotion
    ? ""
    : "transition-transform duration-[240ms] ease-[cubic-bezier(0.77,0,0.175,1)]";
  const ringMotion = reducedMotion
    ? "transition-opacity duration-150 ease-out"
    : "transition-[opacity,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)]";

  return (
    <div>
      {/*
        Readout and stage switch in one. The hour and minute are buttons, so the
        visitor can go back and change either half without starting over — the
        readout is the navigation, which is why there are no separate tabs.
      */}
      <div className="mb-4 flex items-baseline gap-1 font-display text-4xl text-white tabular-nums">
        <button
          type="button"
          onClick={() => setStage("hour")}
          aria-label="Change the hour"
          className={`rounded-md px-1 transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none ${
            stage === "hour" ? "text-orange" : "text-white/45 hover:text-white/75"
          }`}
        >
          {selectedHour === null ? "--" : selectedHour % 12 === 0 ? 12 : selectedHour % 12}
        </button>
        <span aria-hidden="true" className="text-white/30">
          :
        </span>
        <button
          type="button"
          onClick={() => setStage("minute")}
          disabled={selectedHour === null}
          aria-label="Change the minutes"
          className={`rounded-md px-1 transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none disabled:cursor-not-allowed ${
            stage === "minute" ? "text-orange" : "text-white/45 enabled:hover:text-white/75"
          }`}
        >
          {selectedMinute === null ? "--" : String(selectedMinute).padStart(2, "0")}
        </button>
        {/* Static, not a toggle: the venue never opens before noon. */}
        <span className="ml-1.5 font-sans text-sm tracking-[0.18em] text-white/55">PM</span>
      </div>

      <div
        className="relative mx-auto aspect-square w-full max-w-[clamp(16rem,78vw,20rem)] rounded-full bg-white/4 ring-1 ring-white/10"
      >
        {/*
          The hand. A full-size overlay rotated about its own centre, which is the
          dial's centre — far more robust than trying to rotate a stick pinned at
          one end. Hidden until an hour exists, so an untouched dial has no hand
          resting on an arbitrary number.
        */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${handMotion} ${
            activeDegrees === undefined ? "opacity-0" : "opacity-100"
          }`}
          style={{ transform: `rotate(${activeDegrees ?? 0}deg)` }}
        >
          <span
            className="absolute left-1/2 w-px -translate-x-1/2 bg-orange/70"
            style={{ top: `${50 - RADIUS}%`, height: `${RADIUS}%` }}
          />
          <span
            className="absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange"
            style={positionAt(0)}
          />
        </div>

        {/* Centre pin. */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange"
        />

        {/*
          Both rings stay mounted so each can fade rather than pop. `inert` on the
          hidden one keeps it out of the tab order and the accessibility tree —
          `opacity-0` alone would leave twelve invisible buttons focusable.
        */}
        <div
          role="group"
          aria-label="Hour"
          inert={stage !== "hour"}
          className={`absolute inset-0 ${ringMotion} ${
            stage === "hour" ? "opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {HOURS.map((h, i) => {
            const disabled = h.hour24 > LAST_BOOKABLE_HOUR;
            const active = h.hour24 === selectedHour;
            return (
              <button
                key={h.display}
                autoFocus={autoFocus && i === 0}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                aria-label={
                  disabled
                    ? `${h.display} PM, not available`
                    : `${h.display} PM`
                }
                onClick={() => {
                  // One tap is already a valid time — minutes default to :00.
                  commit(h.hour24, selectedMinute ?? 0);
                  setStage("minute");
                }}
                style={positionAt(h.degrees)}
                className={`absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-sans text-base tabular-nums transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none ${
                  disabled
                    ? "cursor-not-allowed text-white/15"
                    : active
                      ? "font-medium text-navy"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {h.display}
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label="Minutes"
          inert={stage !== "minute"}
          className={`absolute inset-0 ${ringMotion} ${
            stage === "minute" ? "opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {MINUTES.map((m) => {
            const active = m.minute === selectedMinute;
            return (
              <button
                key={m.minute}
                type="button"
                aria-pressed={active}
                aria-label={`${m.minute} minutes past`}
                onClick={() => {
                  if (selectedHour === null) return;
                  commit(selectedHour, m.minute);
                  onComplete?.();
                }}
                style={positionAt(m.degrees)}
                className={`absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-sans text-base tabular-nums transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none ${
                  active
                    ? "font-medium text-navy"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center font-sans text-xs text-white/55">
        {stage === "hour" ? "Choose an hour" : "Choose the minutes"}
        <span className="mx-2 text-white/20">·</span>
        Last seating 10:45 PM
      </p>
    </div>
  );
}
