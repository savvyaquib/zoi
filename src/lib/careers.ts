import * as z from "zod/mini";

/**
 * Everything the careers form and its server action agree on. Shared, so the
 * client can render the same limits it will be held to and the two can never
 * drift.
 */

export const POSITIONS = [
  "Kitchen",
  "Service",
  "Bar",
  "Management",
  "Other",
] as const;

export type Position = (typeof POSITIONS)[number];

/**
 * 10 MB — enough for a phone-scanned paper resume, which is the largest thing
 * an applicant is likely to send. next.config raises the Server Action body
 * limit to sit just above it, for the multipart framing (~10-20 KB).
 *
 * This assumes the site's own Node host (Hostinger). Vercel caps a function's
 * request body at 4.5 MB regardless of config; on that platform this must
 * come back down to 4 MB or every larger upload fails before the action runs.
 */
export const RESUME_MAX_BYTES = 10 * 1024 * 1024;

export const RESUME_ACCEPT = ".pdf,.doc,.docx";

/**
 * What the file must BEGIN with to be what its extension claims.
 *
 * Extensions are a label the sender chose; these bytes are what the file is.
 * A renamed executable passes an extension check and fails this one.
 *
 *   PDF   %PDF
 *   DOCX  PK\x03\x04 — it is a ZIP archive
 *   DOC   D0 CF 11 E0 A1 B1 1A E1 — the OLE compound-document header
 */
const SIGNATURES: Record<string, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]],
  docx: [[0x50, 0x4b, 0x03, 0x04]],
  doc: [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]],
};

export function extensionOf(filename: string): string {
  return filename.toLowerCase().split(".").pop() ?? "";
}

/** True when the file's leading bytes match a known signature for its extension. */
export function looksLike(extension: string, bytes: Uint8Array): boolean {
  const candidates = SIGNATURES[extension];
  if (!candidates) return false;
  return candidates.some((sig) => sig.every((b, i) => bytes[i] === b));
}

/** How many leading bytes the signature check needs — the longest signature. */
export const SIGNATURE_BYTES = 8;

function megabytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Why a file cannot be accepted, in words the applicant can act on — or null
 * when it can.
 *
 * Runs in BOTH places. The browser calls it the moment a file is chosen, so a
 * 12 MB PDF is refused with a message before a byte of it is uploaded — and
 * before the server's body limit could reject the whole request with nothing
 * more useful than "Failed to fetch". The server calls it again on what
 * actually arrived, because the browser is not to be trusted.
 *
 * `head` is the file's first few bytes. The browser reads them with a slice;
 * the server already has the whole file.
 */
export function describeFileProblem(
  file: { name: string; size: number },
  head: Uint8Array
): string | null {
  if (file.size === 0) return "Please attach your resume.";
  if (file.size > RESUME_MAX_BYTES) {
    return `This file is ${megabytes(file.size)} — the limit is ${megabytes(RESUME_MAX_BYTES)}. Try exporting it as a smaller PDF.`;
  }
  const ext = extensionOf(file.name);
  if (!(ext in SIGNATURES)) {
    return `"${ext ? "." + ext : "This file"}" is not a format we can open. Please upload a PDF, DOC or DOCX.`;
  }
  if (!looksLike(ext, head)) {
    return `This file is named .${ext} but does not appear to be a real ${ext.toUpperCase()}. Please export it again and re-attach.`;
  }
  return null;
}

/**
 * The text fields. `website` is the honeypot — it is rendered off-screen with
 * every hint a browser understands not to fill it, so a value there means a bot.
 */
/*
  zod/mini, not zod. The rules are the same; the difference is what the
  browser downloads. The classic API hangs every method off every schema, so
  the whole library ships even when a form uses six of them — 95 KB gzipped,
  the largest script on the careers page. The mini API is plain functions the
  bundler can drop when unused. Verified identical results — data, messages,
  trimming — against the classic schema on valid, invalid and partial input.
*/
export const applicationSchema = z.object({
  name: z.string().check(z.trim(), z.minLength(2, "Please enter your name."), z.maxLength(80)),
  email: z.string().check(z.trim(), z.email("Please enter a valid email address."), z.maxLength(120)),
  phone: z
    .string()
    .check(
      z.trim(),
      z.refine((v: string) => v.replace(/\D/g, "").length >= 10, "Please enter a phone number we can reach you on.")
    ),
  position: z.enum(POSITIONS, { message: "Please choose a position." }),
  experience: z
    .string()
    .check(z.trim(), z.minLength(1, "Tell us a little about your experience."), z.maxLength(200)),
  message: z._default(
    z.optional(z.string().check(z.trim(), z.maxLength(1500, "Please keep this under 1500 characters."))),
    ""
  ),
  consent: z.literal("on", { message: "Please confirm you are happy for us to hold your details." }),
  website: z._default(z.optional(z.string().check(z.maxLength(0))), ""),
});

export type ApplicationFields = z.infer<typeof applicationSchema>;

export type FieldErrors = Partial<Record<keyof ApplicationFields | "resume", string>>;

/** First message per field from a zod result, so both sides format errors the same way. */
export function fieldErrorsFrom(result: ReturnType<typeof applicationSchema.safeParse>): FieldErrors {
  const errors: FieldErrors = {};
  if (result.success) return errors;
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ApplicationFields;
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** What the action reports back to the form. */
export type ApplicationState =
  | { status: "idle" }
  | { status: "sent"; position: Position }
  | {
      status: "error";
      /** Shown at the top when nothing field-specific applies. */
      message?: string;
      fieldErrors?: FieldErrors;
      /** Echoed back so a failed submit does not wipe what was typed. */
      values?: Partial<Record<keyof ApplicationFields, string>>;
    };
