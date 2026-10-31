/**
 * Academic calendar gates for cohort year N (2-digit key, e.g. 25 = Sep 2025 intake).
 * Edit dates here when the schedule changes.
 */

export const COHORT_LAUNCH_YEAR = 24;

export const SCHEDULE = {
  /** Apr 1 of intake year N */
  streamPrefsOpen: (y: number) => new Date(2000 + y, 3, 1),
  /** Dec 20 of intake year N */
  sem1GradesOpen: (y: number) => new Date(2000 + y, 11, 20),
  /** Apr 20 of year N+1 */
  fullGradesOpen: (y: number) => new Date(2000 + y + 1, 3, 20),
  /** May 1 of year N+1 — ADMISSION.current advances */
  turnover: (y: number) => new Date(2000 + y + 1, 4, 1),
  /** Jun 4 of year N+1 — stream results open, reported cutoffs bar (grades still editable until streamResultsLock) */
  streamResultsOpen: (y: number) => new Date(2000 + y + 1, 5, 4),
  /** Aug 1 of year N+1 — prior year archived; StreamChoiceGraph live for next */
  dashboardArchive: (y: number) => new Date(2000 + y + 1, 7, 1),
  /** May 1 of year N+2 — stream results permanently locked */
  streamResultsLock: (y: number) => new Date(2000 + y + 2, 4, 1),
} as const;

export type MeSectionKey =
  | "streamPrefs"
  | "sem1Grades"
  | "sem2Grades"
  | "streamResults";

export interface CohortAccess {
  canEditStreamPrefs: boolean;
  canEditSem1Grades: boolean;
  canEditAllGrades: boolean;
  canEditStreamResults: boolean;
  streamResultsLocked: boolean;
  isArchived: boolean;
  hasGradeData: boolean;
  hasFullGradeData: boolean;
  showLiveChoiceProjection: boolean;
  showReportedCutoffs: boolean;
  streamChoiceVisible: boolean;
}

/** Smallest cohort year whose May 1 turnover is still in the future. */
export function computeCurrentAdmitYear(now = new Date()): number {
  let y = COHORT_LAUNCH_YEAR;
  while (SCHEDULE.turnover(y) <= now) {
    y++;
  }
  return y;
}

export function incomingCohortYear(now = new Date()): number {
  return computeCurrentAdmitYear(now) + 1;
}

export function priorCohortYear(now = new Date()): number {
  return computeCurrentAdmitYear(now) - 1;
}

/** Smallest cohort year whose Aug 1 dashboard-archive gate is still in the future. */
export function computeCurrentDashboardYear(now = new Date()): number {
  let y = COHORT_LAUNCH_YEAR;
  while (SCHEDULE.dashboardArchive(y) <= now) {
    y++;
  }
  return y;
}

/** Incoming cohort can appear in sign-up from Apr 1 of their intake year. */
export function incomingSignUpAvailable(now = new Date()): boolean {
  const inc = incomingCohortYear(now);
  return now >= SCHEDULE.streamPrefsOpen(inc);
}

/** Years with dashboard archive gate passed, newest first. */
export function getCompletedYears(now = new Date()): number[] {
  const cur = computeCurrentAdmitYear(now);
  const out: number[] = [];
  for (let y = cur - 1; y >= COHORT_LAUNCH_YEAR; y--) {
    if (SCHEDULE.dashboardArchive(y) <= now) out.push(y);
  }
  return out;
}

export function getCohortAccess(
  admitYear: number,
  now = new Date()
): CohortAccess {
  if (admitYear < COHORT_LAUNCH_YEAR) {
    return {
      canEditStreamPrefs: false,
      canEditSem1Grades: false,
      canEditAllGrades: false,
      canEditStreamResults: false,
      streamResultsLocked: true,
      isArchived: true,
      hasGradeData: true,
      hasFullGradeData: true,
      showLiveChoiceProjection: false,
      showReportedCutoffs: true,
      streamChoiceVisible: true,
    };
  }

  const y = admitYear;
  const cur = computeCurrentAdmitYear(now);

  /** Stream prefs stay editable from Apr 1 year N until stream results open Jun 1 year N+1. */
  const canEditStreamPrefs =
    now >= SCHEDULE.streamPrefsOpen(y) && now < SCHEDULE.streamResultsOpen(y);

  /** Sem 1 grades stay editable through stream-results window (until permanent lock). */
  const canEditSem1Grades =
    now >= SCHEDULE.sem1GradesOpen(y) && now < SCHEDULE.streamResultsLock(y);

  /** Sem 2 + full set after Apr 20; same end as sem 1 — edit alongside stream results. */
  const canEditAllGrades =
    now >= SCHEDULE.fullGradesOpen(y) && now < SCHEDULE.streamResultsLock(y);

  const canEditStreamResults =
    now >= SCHEDULE.streamResultsOpen(y) && now < SCHEDULE.streamResultsLock(y);

  const streamResultsLocked = now >= SCHEDULE.streamResultsLock(y);

  const isArchived = now >= SCHEDULE.dashboardArchive(y);

  const hasGradeData = now >= SCHEDULE.sem1GradesOpen(y);

  const hasFullGradeData = now >= SCHEDULE.fullGradesOpen(y);

  const showLiveChoiceProjection =
    hasFullGradeData && now < SCHEDULE.streamResultsOpen(y);

  const showReportedCutoffs = now >= SCHEDULE.streamResultsOpen(y);

  const streamChoiceVisible = y === computeCurrentDashboardYear(now);

  return {
    canEditStreamPrefs,
    canEditSem1Grades,
    canEditAllGrades,
    canEditStreamResults,
    streamResultsLocked,
    isArchived,
    hasGradeData,
    hasFullGradeData,
    showLiveChoiceProjection,
    showReportedCutoffs,
    streamChoiceVisible,
  };
}

function fmt(d: Date): string {
  return d.toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getLockReason(
  admitYear: number,
  section: MeSectionKey,
  now = new Date()
): string | null {
  const a = getCohortAccess(admitYear, now);
  const y = admitYear;

  if (section === "streamPrefs") {
    if (a.canEditStreamPrefs) return null;
    if (now < SCHEDULE.streamPrefsOpen(y))
      return `Opens ${fmt(SCHEDULE.streamPrefsOpen(y))}`;
    if (now >= SCHEDULE.streamResultsOpen(y))
      return `Locked — stream results are open as of ${fmt(SCHEDULE.streamResultsOpen(y))}.`;
    return "Stream preferences are not editable right now.";
  }

  if (section === "sem1Grades") {
    if (a.canEditSem1Grades) return null;
    if (now < SCHEDULE.sem1GradesOpen(y))
      return `Opens ${fmt(SCHEDULE.sem1GradesOpen(y))}`;
    if (now >= SCHEDULE.streamResultsLock(y))
      return `Grades permanently locked after ${fmt(SCHEDULE.streamResultsLock(y))}.`;
    return "Semester 1 grades are not editable right now.";
  }

  if (section === "sem2Grades") {
    if (a.canEditAllGrades) return null;
    if (now < SCHEDULE.fullGradesOpen(y))
      return `Remaining courses open ${fmt(SCHEDULE.fullGradesOpen(y))}.`;
    if (now >= SCHEDULE.streamResultsLock(y))
      return `Grades permanently locked after ${fmt(SCHEDULE.streamResultsLock(y))}.`;
    return "Semester 2 grades are not editable right now.";
  }

  if (section === "streamResults") {
    if (a.canEditStreamResults) return null;
    if (a.streamResultsLocked)
      return `Permanently locked after ${fmt(SCHEDULE.streamResultsLock(y))}.`;
    if (now < SCHEDULE.streamResultsOpen(y))
      return `Opens ${fmt(SCHEDULE.streamResultsOpen(y))} after Eng 1 ends.`;
    return "Stream results are not editable.";
  }

  return null;
}

/** Sign-up dropdown label: "2026-2027 (Incoming)" | "2025-2026 (Current)" | plain year span */
export function getAdmitYearLabel(y: number, now = new Date()): string {
  const start = 2000 + y;
  const base = `${start}-${start + 1}`;
  if (
    now >= SCHEDULE.streamPrefsOpen(y) &&
    now < SCHEDULE.dashboardArchive(y - 1)
  ) {
    return `${base} (Incoming)`;
  }
  if (y === computeCurrentAdmitYear(now)) {
    return `${base} (Current)`;
  }
  return base;
}

/** Options for Admission Year dropdown (newest first). */
export function getSignUpAdmitYearOptions(now = new Date()): {
  value: number;
  label: string;
}[] {
  const cur = computeCurrentAdmitYear(now);
  const inc = incomingCohortYear(now);
  const set = new Set<number>();
  for (let y = COHORT_LAUNCH_YEAR; y <= cur; y++) set.add(y);
  if (incomingSignUpAvailable(now)) set.add(inc);
  const years = Array.from(set).sort((a, b) => b - a);
  return years.map((value) => ({
    value,
    label: getAdmitYearLabel(value, now),
  }));
}
