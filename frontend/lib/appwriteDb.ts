import { Query } from "appwrite";
import { computeCurrentAdmitYear } from "./scheduleConfig";

/** MacStats database + consolidated collections (post-restructure). */
export const DATABASE_ID = "MacStats";
export const COLL_USERS = "users";
export const COLL_MARKS = "marks";
export const COLL_CUTOFFS = "cutoffs";

/**
 * Admission cohort (2-digit keys). `current` is derived from calendar gates in
 * `scheduleConfig.ts` (May 1 turnover).
 *
 * Backend still uses manual `ADMIT_CURRENT` — see backend comments each May.
 */
export const ADMISSION = {
  /** Cohorts that have fully cycled through Eng 1 (optional log / audit). */
  pastYears: [24] as const,
  /** Active first-year Engineering cohort (live grades, preferences, estimated cutoffs). */
  get current(): number {
    return computeCurrentAdmitYear();
  },
} as const;

/** Re-export: incoming cohort sign-up allowed from Apr 1 of their intake year. */
export { incomingSignUpAvailable } from "./scheduleConfig";

/** Next cohort after `current` (copy, onboarding). */
export function incomingCohortYear(): number {
  return ADMISSION.current + 1;
}

/** Cohort that just finished Eng 1 — prior charts, stream results window. */
export function priorCohortYear(): number {
  return ADMISSION.current - 1;
}

export function isActiveEng1Cohort(admitYear: number | undefined): boolean {
  return admitYear === ADMISSION.current;
}

/** Any cohort before the active Eng 1 year (alumni / locked grades). */
export function isGraduatedCohort(admitYear: number | undefined): boolean {
  if (admitYear === undefined || admitYear === null) return false;
  return admitYear < ADMISSION.current;
}

/**
 * “Last completed” stream cycle — GPA line on prior-year charts only for this cohort.
 * (Older alumni still see charts without a personal line.)
 */
export function isPriorCohort(admitYear: number | undefined): boolean {
  return admitYear === priorCohortYear();
}

/** UI: `2025/2026` from cohort key 25. */
export function academicYearFullLabel(cohortKey: number): string {
  const y = 2000 + cohortKey;
  return `${y}/${y + 1}`;
}

/** UI: `2024/25` from cohort key 24. */
export function academicYearShortLabel(cohortKey: number): string {
  const y = 2000 + cohortKey;
  return `${y}/${String(y + 1).slice(-2)}`;
}

/** Live section titles, e.g. “Live 2025/2026 …”. */
export function liveAcademicYearLabel(): string {
  return `Live ${academicYearFullLabel(ADMISSION.current)}`;
}

/** Prior cohort section titles, e.g. “2024/2025 …”. */
export function priorAcademicYearLabel(): string {
  return academicYearFullLabel(priorCohortYear());
}

export const STREAM_KEYS = [
  "chem",
  "civ",
  "comp",
  "elec",
  "engphys",
  "mat",
  "mech",
  "tron",
  "soft",
] as const;

export type StreamKey = (typeof STREAM_KEYS)[number];

export function cutoffDocId(year: number, key: string) {
  return `${year}_${key}`;
}

export function markDocId(year: number, course: string) {
  return `${year}_${course}`;
}

/** Document IDs for one admission year's cutoff rows (streams + total). */
export function cutoffDocIdsForYear(year: number): string[] {
  return [...STREAM_KEYS.map((k) => cutoffDocId(year, k)), cutoffDocId(year, "total")];
}

/**
 * Query helper: list cutoff docs for a given year (streams + total).
 * Uses $id IN [...] when supported by the SDK.
 */
export function queriesForCutoffYear(year: number) {
  return [Query.equal("$id", cutoffDocIdsForYear(year))];
}

/** Strip `{year}_` prefix from cutoff document $id for switch/mapping. */
export function streamKeyFromCutoffDocId(docId: string): string | null {
  const i = docId.indexOf("_");
  if (i < 0) return null;
  return docId.slice(i + 1);
}

/**
 * Fetch all cutoff documents for a year via listDocuments + $id filter.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listCutoffsForYear(database: any, year: number) {
  const res = await database.listDocuments(DATABASE_ID, COLL_CUTOFFS, [
    ...queriesForCutoffYear(year),
  ]);
  return res.documents;
}
