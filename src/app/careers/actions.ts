"use server";

import { headers } from "next/headers";
import type { ApplicationState } from "@/lib/careers";
import {
  isRateLimited,
  sendApplication,
  validateApplication,
  verifyTurnstile,
} from "@/lib/careers-server";

/**
 * The form's Server Action. Reads what only a request can tell us — the caller's
 * address and the Turnstile token — then hands everything to lib/careers-server.
 *
 * Returns state rather than throwing: a thrown error inside an action becomes
 * an opaque "something went wrong" in the browser, and an applicant deserves to
 * know whether it was their file or our mail server.
 */
export async function submitApplication(
  _previous: ApplicationState,
  form: FormData
): Promise<ApplicationState> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";

  /*
    Honeypot first, and it answers with SUCCESS. A bot that filled the hidden
    field is told its submission went through, learns nothing, and moves on.
    Real applicants never see this branch — the field is unreachable to them.
  */
  const honeypot = form.get("website");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    const position = form.get("position");
    return { status: "sent", position: position === "Bar" ? "Bar" : "Other" };
  }

  if (isRateLimited(ip)) {
    return {
      status: "error",
      message: "That is a few applications in a short time — please try again in ten minutes.",
    };
  }

  const token = form.get("cf-turnstile-response");
  if (!(await verifyTurnstile(typeof token === "string" ? token : null, ip))) {
    return {
      status: "error",
      message: "We could not confirm you are not a robot. Please reload the page and try again.",
    };
  }

  const validated = await validateApplication(form);
  if (!validated.ok) return validated.error;

  try {
    const { id } = await sendApplication(validated.value);
    // The Resend id is the handle for "HR says it never arrived" — no PII in it.
    console.info("[careers] sent", id);
  } catch (err) {
    // The applicant's details never reach a log line; only the cause does.
    console.error("[careers] send failed:", err instanceof Error ? err.message : err);
    // Echo the text back so only the file needs re-attaching, not the whole form.
    const { name, email, phone, position, experience, message } = validated.value.fields;
    return {
      status: "error",
      message:
        "We could not send your application just now. Please try again in a few minutes, or send it to us on WhatsApp.",
      values: { name, email, phone, position, experience, message },
    };
  }

  return { status: "sent", position: validated.value.fields.position };
}
