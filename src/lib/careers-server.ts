import "server-only";

import { Resend } from "resend";
import { VENUE } from "@/lib/assets";
import {
  applicationSchema,
  describeFileProblem,
  extensionOf,
  fieldErrorsFrom,
  SIGNATURE_BYTES,
  type ApplicationFields,
  type ApplicationState,
} from "@/lib/careers";

/**
 * The careers pipeline, as plain functions with no Next.js in them.
 *
 * The Server Action in app/careers/actions.ts is a thin wrapper that reads the
 * request (IP, Turnstile token) and hands off here. Keeping this file free of
 * `headers()` and `"use server"` is what lets it be exercised from a script
 * against a real inbox before anything is wired to a browser.
 *
 * ── A letterbox, not a filing cabinet ────────────────────────────────────────
 *
 * The resume goes into the HR email as an attachment and nowhere else. Nothing
 * is written to disk or a database. Every stored resume would be personal data
 * the venue is responsible for, so the server keeps none — HR's inbox is the
 * record.
 */

/** Only these hosts may send. A missing key is a configuration error, not a crash. */
function env(name: "RESEND_API_KEY" | "CAREERS_TO_EMAIL" | "CAREERS_FROM_EMAIL"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

/** Newlines in a header field are how mail injection happens. One line, always. */
function oneLine(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}

/** Keep a filename to letters, digits, dot, dash, underscore — nothing the OS or a mail client could misread. */
function safeFilename(original: string, applicant: string): string {
  const ext = extensionOf(original);
  const stem = applicant.replace(/[^\w-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "applicant";
  return `${stem}-resume.${ext}`;
}

// ── Rate limiting ─────────────────────────────────────────────────────────────

/**
 * Five submissions per address per ten minutes, in memory.
 *
 * On a single long-running Node process (Hostinger) this is a real limit. On
 * serverless (Vercel) each instance has its own map, so it is best-effort
 * there — Turnstile is the layer that actually holds on that platform. Both are
 * cheap; neither is the only lock on the door.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Keep the map from growing without bound on a long-lived process.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

// ── Turnstile ─────────────────────────────────────────────────────────────────

/**
 * Verifies a Cloudflare Turnstile token. Skipped entirely — and reported as
 * passed — when no secret is configured, so the form works before the keys
 * exist. Set TURNSTILE_SECRET_KEY and it becomes mandatory.
 */
export async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

export type ValidatedApplication = {
  fields: ApplicationFields;
  resume: { filename: string; bytes: Buffer };
};

type ValidationFailure = Extract<ApplicationState, { status: "error" }>;

/**
 * Turns a FormData into a fully validated application, or the exact errors to
 * show. The resume is checked three ways — size, extension, and the bytes it
 * actually starts with — because only the last one cannot be lied about.
 */
export async function validateApplication(
  form: FormData
): Promise<{ ok: true; value: ValidatedApplication } | { ok: false; error: ValidationFailure }> {
  const raw = Object.fromEntries(
    ["name", "email", "phone", "position", "experience", "message", "consent", "website"].map(
      (k) => [k, form.get(k)]
    )
  ) as Record<string, FormDataEntryValue | null>;

  // Everything except the checkbox comes back as text; a missing checkbox is null.
  const text: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) text[k] = typeof v === "string" ? v : "";

  const parsed = applicationSchema.safeParse(text);
  const fieldErrors = fieldErrorsFrom(parsed);

  const file = form.get("resume");
  let resume: ValidatedApplication["resume"] | null = null;

  if (!(file instanceof File)) {
    fieldErrors.resume = "Please attach your resume.";
  } else {
    // The same check the browser already ran — repeated because the browser is
    // not to be trusted, and this is the copy that actually gates the send.
    const bytes = Buffer.from(await file.arrayBuffer());
    const problem = describeFileProblem(file, bytes.subarray(0, SIGNATURE_BYTES));
    if (problem) fieldErrors.resume = problem;
    else resume = { filename: safeFilename(file.name, text.name), bytes };
  }

  if (!parsed.success || !resume) {
    // Echo the text back so the form does not empty itself on a mistake. Never
    // the honeypot, never the consent — those must be re-affirmed.
    const { website: _w, consent: _c, ...values } = text;
    void _w;
    void _c;
    return { ok: false, error: { status: "error", fieldErrors, values } };
  }

  return { ok: true, value: { fields: parsed.data, resume } };
}

// ── Sending ───────────────────────────────────────────────────────────────────

/**
 * Two emails. The first is the one that matters; the second is a courtesy.
 *
 * HR's goes out first and its failure is the caller's failure. The applicant's
 * acknowledgement is attempted afterwards and its failure is swallowed — while
 * the sending domain is unverified, Resend only delivers to the account owner,
 * so the acknowledgement WILL fail in that state, and that must not turn a
 * successfully delivered application into an error on screen.
 */
export async function sendApplication(app: ValidatedApplication): Promise<{ id: string }> {
  const resend = new Resend(env("RESEND_API_KEY"));
  const to = env("CAREERS_TO_EMAIL");
  const fromAddress = env("CAREERS_FROM_EMAIL");
  const from = `${VENUE.name} Careers <${fromAddress}>`;
  const { fields, resume } = app;

  /*
    Resend's sandbox sender can only deliver to the account owner. While it is
    in use, the acknowledgement to an applicant is guaranteed to bounce, so it is
    not attempted at all rather than attempted and swallowed — which would log an
    API error for every genuine application. Verify zoiworld.com, switch the
    sender, and this turns itself on.
  */
  const canAcknowledge = !fromAddress.endsWith("@resend.dev");

  const hrBody = [
    `New application for: ${fields.position}`,
    "",
    `Name:        ${fields.name}`,
    `Email:       ${fields.email}`,
    `Phone:       ${fields.phone}`,
    `Position:    ${fields.position}`,
    `Experience:  ${fields.experience}`,
    "",
    fields.message ? `Message:\n${fields.message}` : "(no message)",
    "",
    `Resume attached: ${resume.filename}`,
    "",
    `Reply to this email to reach the applicant directly.`,
  ].join("\n");

  const hr = await resend.emails.send({
    from,
    to,
    replyTo: fields.email,
    subject: oneLine(`Application — ${fields.position} — ${fields.name}`),
    text: hrBody,
    attachments: [{ filename: resume.filename, content: resume.bytes }],
  });

  if (hr.error || !hr.data) {
    throw new Error(`Resend rejected the HR email: ${hr.error?.message ?? "no id returned"}`);
  }

  if (!canAcknowledge) return { id: hr.data.id };

  const ackBody = [
    `Hi ${fields.name.split(" ")[0]},`,
    "",
    `Thanks for applying to ${VENUE.name} — we have your application for ${fields.position} and your resume is with the team.`,
    "",
    `We read every application. If your experience matches what we are looking for, someone will be in touch on ${fields.phone} or by replying to this email.`,
    "",
    `${VENUE.name}`,
    VENUE.address.line,
  ].join("\n");

  try {
    await resend.emails.send({
      from,
      to: fields.email,
      subject: `We have your application — ${VENUE.name}`,
      text: ackBody,
    });
  } catch {
    /* courtesy only — see the note above */
  }

  return { id: hr.data.id };
}
