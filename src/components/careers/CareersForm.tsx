"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import Script from "next/script";
import { submitApplication } from "@/app/careers/actions";
import {
  POSITIONS,
  RESUME_ACCEPT,
  RESUME_MAX_BYTES,
  type ApplicationState,
} from "@/lib/careers";
import { FIELD, FIELD_ERROR, LABEL } from "@/lib/form";
import { BUTTON_MOTION } from "@/lib/reservation";
import { VENUE } from "@/lib/assets";

/**
 * The application form.
 *
 * A native <form action={serverAction}>, so it works with JavaScript disabled
 * and React handles the multipart encoding for the file. `useActionState`
 * carries the result back: field errors land next to their fields, a mail
 * failure lands at the top, and success swaps the form for a confirmation.
 *
 * ── Why every input has a defaultValue from state ────────────────────────────
 *
 * React resets an uncontrolled form once its action returns, whatever the
 * result. Without these, a single typo would empty every field. The action
 * echoes the text back on failure and these put it where it was. The file
 * cannot be restored — browsers do not allow a script to set one — so the
 * résumé error says so explicitly.
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

export function CareersForm() {
  const uid = useId();
  const [state, action, pending] = useActionState(submitApplication, INITIAL);
  const topRef = useRef<HTMLDivElement>(null);

  const id = (name: string) => `${uid}-${name}`;
  const errId = (name: string) => `${uid}-${name}-error`;

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  /*
    After a submit, move focus to whatever needs the visitor's attention: the
    confirmation, the top-level message, or the first field with a problem. A
    form that reports an error two screens above where the cursor is has not
    really reported it.
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

  const fieldError = (name: string) =>
    errors[name as keyof typeof errors] ? (
      <p id={errId(name)} className={FIELD_ERROR}>
        {errors[name as keyof typeof errors]}
      </p>
    ) : null;

  const describe = (name: string) => (errors[name as keyof typeof errors] ? errId(name) : undefined);
  const invalid = (name: string) => Boolean(errors[name as keyof typeof errors]);

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
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
          Résumé
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
            I am happy for Zoi to hold my details and résumé for this application. They go to
            the hiring team by email and are not stored on this website.
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
