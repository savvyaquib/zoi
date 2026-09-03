"use client";

import { useEffect, useRef, useState } from "react";
import { TimeDial } from "@/components/TimeDial";
import { formatTime } from "@/lib/reservation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The Time control: a field that reads like the selects beside it, opening the
 * clock face in a popover.
 *
 * ── Why absolute, not the Popover API ───────────────────────────────────────
 *
 * `popover="auto"` would hand over light-dismiss and top-layer rendering for
 * free, but it also renders `position: fixed`, which means the panel detaches
 * from its field the moment the page scrolls — and this page scrolls under
 * Lenis, so that is not a rare edge. Keeping the panel in normal flow, absolutely
 * positioned against the field, means it simply travels with the field and no
 * repositioning code exists to go wrong. The cost is ~15 lines of dismiss
 * handling, below.
 *
 * Nothing here is a UI-kit component: CLAUDE.md rules those out, so the dialog
 * semantics, dismissal and focus return are hand-rolled rather than imported.
 */

const PANEL_WIDTH = "w-[min(21rem,calc(100vw-2.5rem))]";

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function TimeField({
  id,
  value,
  onChange,
  invalid,
  describedBy,
  triggerClassName,
}: {
  /** The submit handler focuses this, so it belongs on the trigger — the dial's
   *  buttons are unreachable while the panel is shut. */
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  describedBy?: string;
  triggerClassName: string;
}) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /*
    Dismissal. Pointerdown rather than click, so a press that begins outside the
    panel closes it without waiting for the release — and so a press that begins
    INSIDE never closes it, however far the finger drags before lifting.
  */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Escape hands focus back, or it is stranded on a panel that no longer exists.
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /*
    Enter and exit for the panel.

    A dropdown at 180ms, per the 150-250ms band for this kind of surface. Strong
    ease-out on both directions — `ease-in` would hold the panel still for the
    first frames, which is exactly when the visitor is looking at it. It scales
    from 0.96 and never from 0: nothing in the real world appears from nothing.

    `origin-top` because the panel is anchored to the field above it, so that is
    the corner it should grow out of.
  */
  const panelMotion = reducedMotion
    ? "transition-opacity duration-150 ease-out"
    : "transition-[opacity,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)]";

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        /*
          No `aria-invalid`: it is not a supported attribute on a button's implicit
          role. The error reaches a screen reader through `aria-describedby`
          instead, which points at the same "Please choose a time." the sighted
          visitor reads, so the state is announced without an invalid ARIA pairing.
          `invalid` then only has to do visual work.
        */
        aria-describedby={describedBy}
        className={`${triggerClassName} flex items-center justify-between gap-3 text-left ${
          invalid ? "border-orange" : ""
        }`}
      >
        <span className={value ? "text-white" : "text-white/35"}>
          {value ? formatTime(value) : "Select a time"}
        </span>
        <ClockIcon />
      </button>

      {/*
        Kept mounted so it can animate out as well as in — unmounting on close
        would make the panel vanish on a cut. `inert` is what stops the hidden
        dial's sixteen buttons sitting in the tab order.
      */}
      <div
        role="dialog"
        aria-label="Choose a time"
        inert={!open}
        className={`absolute top-full left-0 z-30 mt-2 origin-top rounded-2xl border border-white/12 bg-navy p-5 shadow-2xl shadow-navy/60 ${PANEL_WIDTH} ${panelMotion} ${
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-96 opacity-0"
        }`}
      >
        <TimeDial
          value={value}
          onChange={onChange}
          autoFocus={open}
          /*
            Choosing the minutes is the last decision, so the panel closes itself
            and the field shows the result — no OK button to hunt for.

            The delay is not padding. Closing on the same frame as the tap means
            the chip never visibly fills orange and the hand never arrives, so the
            visitor sees the panel go without seeing what they picked land. This
            waits for the hand's own 240ms sweep to be most of the way through,
            then dismisses. Anything under ~150ms reads as the panel flinching.
          */
          onComplete={() => {
            window.setTimeout(() => {
              setOpen(false);
              triggerRef.current?.focus();
            }, 220);
          }}
        />
      </div>
    </div>
  );
}
