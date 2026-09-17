"use client";

import { Component, useActionState, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import Script from "next/script";
import { submitApplication } from "@/app/careers/actions";
import {
  applicationSchema,
  describeFileProblem,
  fieldErrorsFrom,
  POSITIONS,
  RESUME_ACCEPT,
  RESUME_MAX_BYTES,
  SIGNATURE_BYTES,
  type ApplicationState,
  type FieldErrors,
} from "@/lib/careers";
import { VENUE } from "@/lib/assets";
import { FIELD, FIELD_ERROR, LABEL } from "@/lib/form";
import { BUTTON_MOTION } from "@/lib/reservation";

/**
 * The application form.
 *
 * A native <form action={serverAction}>, so it works with JavaScript disabled
 * and React handles the multipart encoding for the file. `useActionState`
 * carries the result back: field errors land next to their fields, a mail
 * failure lands at the top, and success swaps the form for a confirmation.
 *
 * ── Validation happens twice, on purpose ─────────────────────────────────────
 *
 * The browser runs the SAME zod schema and the SAME file check the server does,
 * in `onSubmit`, before anything is sent. Two reasons:
 *
 *   1. An applicant gets told "this file is 9.3 MB, the limit is 4 MB" the
 *      instant they pick it — not after uploading 9 MB and watching the server
 *      refuse the whole request, which the browser can only report as
 *      "Failed to fetch".
 *   2. The messages are identical either way, because they come from one place.
 *
 * The server still validates everything it receives. The browser's copy is a
 * courtesy to the applicant, not a security boundary.
 *
 * ── Why every input has a defaultValue from state ────────────────────────────
 *
 * React resets an uncontrolled form once its action returns, whatever the
 * result. Without these, a single typo would empty every field. The action
 * echoes the text back on failure and these put it where it was. The file
 * cannot be restored — browsers do not allow a script to set one — so the
 * resume error says so explicitly.
 */

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const INITIAL: ApplicationState = { status: "idle" };

/*
  The fallback when mail fails is WhatsApp, not HR's address. HR's email lives
  only in a server env var and must never reach the page — anything in the page
  is readable by every bot that loads it. The WhatsApp number is already public
  in the footer, so linking it here costs nothing.
*/
const WHATSAPP_URL = `https://wa.me/${VENUE.phoneRaw.replace(/\D/g, "")}`;

/** Marks a required label. The `required` attribute is what assistive tech reads; this is for eyes. */
function Req() {
  return (
    <span aria-hidden="true" className="ml-1 text-orange">
      *
    </span>
  );
}

/**
 * Catches the one failure the action cannot report on itself: the request
 * never completing. A dead network, a server mid-restart, a body a proxy
 * refused — all surface as a thrown fetch, which would otherwise be a blank
 * error screen. This turns it into the same honest message as a mail failure.
 */
class SubmitBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div
        role="alert"
        className="rounded-xl border border-orange/40 bg-orange/10 px-4 py-4 font-sans text-sm text-white"
      >
        <p>
          Your application could not be sent — the connection to our server dropped before it
          arrived. Nothing was received, so please reload the page and try again.
        </p>
        <p className="mt-2">
          If it keeps happening,{" "}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange underline underline-offset-4"
          >
            send it to us on WhatsApp instead
          </a>
          .
        </p>
      </div>
    );
  }
}

export function CareersForm() {
  return (
    <SubmitBoundary>
      <ApplicationForm />
    </SubmitBoundary>
  );
}

function ApplicationForm() {
  const uid = useId();
  const [state, action, pending] = useActionState(submitApplication, INITIAL);
  const topRef = useRef<HTMLDivElement>(null);

  /*
    Errors found in the browser, before submitting. They take precedence over
    whatever the server said last time, and are cleared on the next attempt.
    `fileProblem` is checked the moment a file is chosen, so it is ready by the
    time the button is pressed and `onSubmit` can stay synchronous — it has to
    be, because `preventDefault` does not work after an `await`.
  */
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [fileProblem, setFileProblem] = useState<string | null>(null);

  const id = (name: string) => `${uid}-${name}`;
  const errId = (name: string) => `${uid}-${name}-error`;

  const serverErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const errors: FieldErrors = { ...serverErrors, ...clientErrors };
  const values = state.status === "error" ? (state.values ?? {}) : {};

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileProblem(null);
      return;
    }
    const head = new Uint8Array(await file.slice(0, SIGNATURE_BYTES).arrayBuffer());
    const problem = describeFileProblem(file, head);
    setFileProblem(problem);
    // Surface it immediately, not only on submit — the applicant is looking here.
    setClientErrors((e) => {
      const next = { ...e };
      if (problem) next.resume = problem;
      else delete next.resume;
      return next;
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const data = new FormData(form);
    const text: Record<string, string> = {};
    for (const [k, v] of data.entries()) if (typeof v === "string") text[k] = v;

    const found = fieldErrorsFrom(applicationSchema.safeParse(text));

    const file = data.get("resume");
    if (!(file instanceof File) || file.size === 0) {
      found.resume = "Please attach your resume.";
    } else if (fileProblem) {
      found.resume = fileProblem;
    }

    if (Object.keys(found).length > 0) {
      // Stop here — nothing leaves the browser until it would be accepted.
      event.preventDefault();
      setClientErrors(found);
      const first = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`#${CSS.escape(id(first))}`)?.focus();
      return;
    }

    setClientErrors({});
  };

  /*
    After a server round-trip, move focus to whatever needs attention: the
    confirmation, the top-level message, or the first field with a problem. A
    form that reports an error two screens above the cursor has not reported it.
  */
  useEffect(() => {
    if (state.status === "idle") return;
    if (state.status === "sent") {
      topRef.current?.focus();
      return;
    }
    const first = Object.keys(state.fieldErrors ?? {})[0];
    if (first) {
      document.getElementById(id(first))?.focus();
    } else {
      topRef.current?.focus();
    }
    // `id` is stable for the component's lifetime; only the state matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state.status === "sent") {
    return (
      <div
        ref={topRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-white/12 bg-white/4 p-8 focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none md:p-10"
      >
        <p className="font-display text-2xl text-blue italic md:text-3xl">Sent.</p>
        <h2 className="mt-2 font-display text-3xl leading-tight md:text-4xl">
          Your application is with the team.
        </h2>
        <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-white/65 md:text-base">
          Thanks for applying for <span className="text-white">{state.position}</span>. We read
          every application, and if your experience fits what we are looking for, someone will be
          in touch by phone or email.
        </p>
      </div>
    );
  }

  const fieldError = (name: keyof FieldErrors) =>
    errors[name] ? (
      <p id={errId(name)} className={FIELD_ERROR}>
        {errors[name]}
      </p>
    ) : null;

  const describe = (name: keyof FieldErrors) => (errors[name] ? errId(name) : undefined);
  const invalid = (name: keyof FieldErrors) => Boolean(errors[name]);

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {state.status === "error" && state.message && (
        <div
          ref={topRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-orange/40 bg-orange/10 px-4 py-3 font-sans text-sm text-white focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
        >
          {state.message}{" "}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange underline underline-offset-4"
          >
            Send it to us on WhatsApp instead.
          </a>
        </div>
      )}

      <p className="font-sans text-xs text-white/55">
        <span aria-hidden="true" className="text-orange">
          *
        </span>{" "}
        Required
      </p>

      {/*
        The honeypot. Off-screen and unreachable to a person: not in the tab
        order, hidden from assistive tech, autocomplete refused. A bot that fills
        every field it finds fills this one.
      */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id("name")} className={LABEL}>
            Name
            <Req />
          </label>
          <input
            id={id("name")}
            name="name"
            type="text"
            autoComplete="name"
            required
            defaultValue={values.name}
            aria-invalid={invalid("name")}
            aria-describedby={describe("name")}
            className={FIELD}
          />
          {fieldError("name")}
        </div>

        <div>
          <label htmlFor={id("phone")} className={LABEL}>
            Phone
            <Req />
          </label>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91"
            required
            defaultValue={values.phone}
            aria-invalid={invalid("phone")}
            aria-describedby={describe("phone")}
            className={FIELD}
          />
          {fieldError("phone")}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={id("email")} className={LABEL}>
            Email
            <Req />
          </label>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={values.email}
            aria-invalid={invalid("email")}
            aria-describedby={describe("email")}
            className={FIELD}
          />
          {fieldError("email")}
        </div>

        <div>
          <label htmlFor={id("position")} className={LABEL}>
            Position
            <Req />
          </label>
          <select
            id={id("position")}
            name="position"
            required
            defaultValue={values.position ?? ""}
            aria-invalid={invalid("position")}
            aria-describedby={describe("position")}
            className={FIELD}
          >
            <option value="" disabled className="bg-navy">
              Choose one
            </option>
            {POSITIONS.map((p) => (
              <option key={p} value={p} className="bg-navy">
                {p}
              </option>
            ))}
          </select>
          {fieldError("position")}
        </div>

        <div>
          <label htmlFor={id("experience")} className={LABEL}>
            Experience
            <Req />
          </label>
          <input
            id={id("experience")}
            name="experience"
            type="text"
            placeholder="e.g. 3 years, cocktail bar"
            required
            maxLength={200}
            defaultValue={values.experience}
            aria-invalid={invalid("experience")}
            aria-describedby={describe("experience")}
            className={FIELD}
          />
          {fieldError("experience")}
        </div>
      </div>

      <div>
        <label htmlFor={id("message")} className={LABEL}>
          Anything else <span className="normal-case tracking-normal text-white/35">(optional)</span>
        </label>
        <textarea
          id={id("message")}
          name="message"
          rows={4}
          maxLength={1500}
          placeholder="What you would bring, when you could start, anything you would like us to know."
          defaultValue={values.message}
          aria-invalid={invalid("message")}
          aria-describedby={describe("message")}
          className={`${FIELD} resize-y`}
        />
        {fieldError("message")}
      </div>

      <div>
        <label htmlFor={id("resume")} className={LABEL}>
          Resume
          <Req />
        </label>
        {/*
          A native file input, styled through the `file:` variants so the button
          inside it matches the site rather than the operating system. Native
          means the keyboard, screen readers and the OS picker all work
          without any of it being reimplemented.
        */}
        <input
          id={id("resume")}
          name="resume"
          type="file"
          accept={RESUME_ACCEPT}
          required
          onChange={onFileChange}
          aria-invalid={invalid("resume")}
          aria-describedby={errors.resume ? errId("resume") : id("resume-hint")}
          className={`${FIELD} cursor-pointer py-3 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-1.5 file:font-sans file:text-xs file:tracking-[0.1em] file:text-white file:uppercase hover:file:bg-white/15`}
        />
        {fieldError("resume") ?? (
          <p id={id("resume-hint")} className="mt-2 font-sans text-xs text-white/55">
            PDF, DOC or DOCX, up to {RESUME_MAX_BYTES / 1024 / 1024} MB.
            {state.status === "error" && " Please re-attach it after fixing the fields above."}
          </p>
        )}
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 font-sans text-sm text-white/70">
          <input
            name="consent"
            type="checkbox"
            required
            aria-invalid={invalid("consent")}
            aria-describedby={describe("consent")}
            className="mt-0.5 size-4 shrink-0 accent-orange focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
          />
          <span>
            I am happy for Zoi to hold my details and resume for this application. They go to the
            hiring team by email and are not stored on this website.
            <Req />
          </span>
        </label>
        {fieldError("consent")}
      </div>

      {TURNSTILE_SITE_KEY && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="dark" />
        </>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`mt-2 inline-flex items-center justify-center rounded-full bg-orange px-8 py-4 font-sans text-sm font-medium tracking-[0.08em] text-navy uppercase focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-navy focus-visible:outline-none disabled:cursor-wait disabled:opacity-70 ${BUTTON_MOTION}`}
      >
        {pending ? "Sending…" : "Send application"}
      </button>
    </form>
  );
}
