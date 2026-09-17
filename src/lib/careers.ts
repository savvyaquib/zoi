import { z } from "zod";

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
 * 4 MB, not 5. Vercel caps a function's request body at 4.5 MB, and multipart
 * framing adds ~10-20 KB on top of the file. next.config raises the Server
 * Action limit to match.
 */
export const RESUME_MAX_BYTES = 4 * 1024 * 1024;

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

/**
 * The text fields. `website` is the honeypot — it is rendered off-screen with
 * every hint a browser understands not to fill it, so a value there means a bot.
 */
export const applicationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email: z.string().trim().email("Please enter a valid email address.").max(120),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Please enter a phone number we can reach you on."),
  position: z.enum(POSITIONS, { message: "Please choose a position." }),
  experience: z.string().trim().min(1, "Tell us a little about your experience.").max(200),
  message: z.string().trim().max(1500, "Please keep this under 1500 characters.").optional().default(""),
  consent: z.literal("on", { message: "Please confirm you are happy for us to hold your details." }),
  website: z.string().max(0).optional().default(""),
});

export type ApplicationFields = z.infer<typeof applicationSchema>;

/** What the action reports back to the form. */
export type ApplicationState =
  | { status: "idle" }
  | { status: "sent"; position: Position }
  | {
      status: "error";
      /** Shown at the top when nothing field-specific applies. */
      message?: string;
      fieldErrors?: Partial<Record<keyof ApplicationFields | "resume", string>>;
      /** Echoed back so a failed submit does not wipe what was typed. */
      values?: Partial<Record<keyof ApplicationFields, string>>;
    };
