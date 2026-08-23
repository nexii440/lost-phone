import { customAlphabet } from "nanoid";

// Excludes visually ambiguous characters (0/O, 1/I/L) so a case ID is easy
// to read aloud, write down, and type back in correctly at /case.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const nextSegment = customAlphabet(ALPHABET, 6);

export function generateCaseId(): string {
  return `FML-${nextSegment()}`;
}

// Matches generateCaseId()'s output exactly. Used to validate a case ID
// entered on /case before it's ever sent to the database.
export const CASE_ID_PATTERN = /^FML-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;

export function normalizeCaseId(input: string): string {
  return input.trim().toUpperCase();
}
