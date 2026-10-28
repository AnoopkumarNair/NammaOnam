/**
 * Post-festival archive mode.
 *
 * On by default now that Namma Onam 2.0 (15–16 Aug 2026) is over. It keeps the
 * festival's look and highlights online as a keepsake, but hides everything that
 * only made sense during the event or that names / contacts residents:
 * registrations, live scores, scorekeeper access, walkathon and badminton results,
 * performer schedule, gallery photos, committee phone numbers and announcements.
 *
 * Set NEXT_PUBLIC_FESTIVAL_ARCHIVED=false (Vercel env var) to switch the live
 * festival mode back on for the next edition.
 */
export const ARCHIVED = process.env.NEXT_PUBLIC_FESTIVAL_ARCHIVED !== "false";

export const ARCHIVE_HEADLINE = "Celebrated on 15 & 16 August 2026";
export const ARCHIVE_THANKS = "Thank you to everyone who joined in. See you next Onam!";

/** Removes Indian phone numbers from free text coming from the sheet. */
export function scrubPhones(text: string | undefined | null): string {
  if (!text) return "";
  return text.replace(/(\+?91[\s-]?)?[6-9]\d{2}[\s-]?\d{2}[\s-]?\d{5}|(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/g, "the organisers");
}
