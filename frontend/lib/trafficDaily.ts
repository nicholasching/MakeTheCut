/**
 * Shared traffic month documents → daily views (UTC), aligned with Site Statistics.
 */

export interface TrafficMonthDoc {
  $id: string;
  average: number;
  total: number;
  byDate: string;
}

export interface DailyPoint {
  date: string;
  views: number;
}

/**
 * Latest calendar day (UTC) included in traffic. A day's data is shown only
 * starting at 12:00 UTC on the following calendar day.
 */
export function getLastTrafficDayInclusiveUtc(): string {
  const now = new Date();
  const nowMs = now.getTime();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();

  const yesterday = new Date(Date.UTC(y, m, d));
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yy = yesterday.getUTCFullYear();
  const mm = yesterday.getUTCMonth();
  const dd = yesterday.getUTCDate();
  const releaseMs = Date.UTC(yy, mm, dd + 1, 12, 0, 0);

  if (nowMs >= releaseMs) {
    return yesterday.toISOString().slice(0, 10);
  }

  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return yesterday.toISOString().slice(0, 10);
}

export function addDaysUtc(dateStr: string, delta: number): string {
  const dt = new Date(dateStr + "T00:00:00Z");
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

function parseTrafficDocId(
  id: string
): { year: number; month: number } | null {
  const i = id.indexOf("_");
  if (i < 0) return null;
  const yy = parseInt(id.slice(0, i), 10);
  const month = parseInt(id.slice(i + 1), 10);
  if (Number.isNaN(yy) || Number.isNaN(month) || month < 1 || month > 12)
    return null;
  return { year: 2000 + yy, month };
}

export function expandDocsToDaily(
  docs: TrafficMonthDoc[],
  lastDateInclusive: string
): DailyPoint[] {
  const sorted = [...docs].sort((a, b) => {
    const pa = parseTrafficDocId(a.$id);
    const pb = parseTrafficDocId(b.$id);
    if (!pa || !pb) return 0;
    if (pa.year !== pb.year) return pa.year - pb.year;
    return pa.month - pb.month;
  });
  const daily: DailyPoint[] = [];
  for (const doc of sorted) {
    const ym = parseTrafficDocId(doc.$id);
    if (!ym) continue;
    const { year: y, month: m } = ym;
    const parts = doc.byDate.split(",").map((s) => parseInt(s.trim(), 10));
    if (parts.some((n) => Number.isNaN(n))) continue;
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const ymd = `${y}-${String(m).padStart(2, "0")}`;
    for (let day = 1; day <= dim && day <= parts.length; day++) {
      const date = `${ymd}-${String(day).padStart(2, "0")}`;
      if (date > lastDateInclusive) break;
      daily.push({ date, views: parts[day - 1] ?? 0 });
    }
  }
  return daily;
}

export function dailyToMap(daily: DailyPoint[]): Map<string, number> {
  return new Map(daily.map((d) => [d.date, d.views]));
}

export function sumViewsInRange(
  map: Map<string, number>,
  start: string,
  end: string
): number {
  let s = 0;
  let d = start;
  while (d <= end) {
    s += map.get(d) ?? 0;
    d = addDaysUtc(d, 1);
  }
  return s;
}
