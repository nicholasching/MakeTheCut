"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Query } from "appwrite";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import Footer from "@/components/Footer";
import { database } from "../appwrite";
import { DATABASE_ID, COLL_TRAFFIC } from "@/lib/appwriteDb";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import {
  addDaysUtc,
  dailyToMap,
  expandDocsToDaily,
  getLastTrafficDayInclusiveUtc,
  sumViewsInRange,
  type DailyPoint,
  type TrafficMonthDoc,
} from "@/lib/trafficDaily";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type RangeKey = "7d" | "30d" | "365d" | "all";

/**
 * Chart row: `views` = current period (solid); optional `prior` = previous window (dashed, 7d/30d).
 * For 365d / all time, only `views` is used.
 */
interface ChartPoint {
  date: string;
  views: number;
  label: string;
  prior?: number;
  priorDate?: string;
  priorLabel?: string;
}

// ---------------------------------------------------------------------------
// Changelog
// ---------------------------------------------------------------------------
type ChangelogEntry = {
  version: string;
  date: string;
  features: string[];
  maintenance: string[];
};

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.1",
    date: "April 2026",
    features: [
      "Statistics & roadmap page with site traffic charts (7 days through all time)",
      "If you're already signed in, the home page offers a quick way to open your dashboard",
    ],
    maintenance: [
      "Faster, more reliable data syncing so dashboards stay up to date",
      "Smoother page transitions once the site has finished loading",
      "Grade distribution charts behave more reliably after you choose a stream",
      "Easier-to-tap navigation, traffic charts that read better on phones, and smoother rotating text on iOS",
    ],
  },
  {
    version: "2.0",
    date: "February 2026",
    features: [],
    maintenance: [
      "Smoother moves between pages with a subtle glow so it's clearer you've changed screens",
      "Fixed awkward double scrollbars on the home page and elsewhere",
      "Methodology and chart areas refreshed with a cleaner, glass-style look",
      "Grade distribution chart animates more naturally and switching courses feels quicker",
      "Cutoff estimates won't drop below 4 when a stream still has empty seats—so numbers stay realistic",
    ],
  },
  {
    version: "1.3",
    date: "January 2026",
    features: [
      "Enter letter grades (for example A+) as well as numeric GPAs",
      "Live count of how many community data points power the estimates",
      "Graduates see cutoff and contribution info that matches their situation",
      "Site updated for the new admissions cycle (2025/26)",
    ],
    maintenance: [
      "Clearer note when a chart is based on a smaller sample",
      "More accurate cutoff estimates by ignoring incomplete submissions",
    ],
  },
  {
    version: "1.2",
    date: "June 2025",
    features: [
      "Compare estimated cutoffs with what students actually reported after offers",
      "Crowdsourced stream results on the dashboard so everyone benefits from shared info",
      "Dedicated sign-up flow if you already graduated, with clearer handling for free-choice streams",
      "New stream-choice visuals and a clearer way to pick and compare streams",
      "Forgot your password? You can now reset it when logging in",
    ],
    maintenance: [
      "Cutoffs and charts target the right application year after the annual rollover",
      "Clearer wording on how cutoffs work and cleaner live contribution counts",
    ],
  },
  {
    version: "1.1",
    date: "April 2025",
    features: [
      "Grade and mark distribution charts with tabs, readable labels, and a class-average line",
      "Accounts stay McMaster-only (@mcmaster.ca) for privacy and trust",
      "See how many people are contributing and read real course names on the graphs",
      "Branded logo and timely banners when something important is happening",
    ],
    maintenance: [
      "Press Enter to sign in; brighter, easier-to-read chart colors",
      "More trustworthy cutoff numbers end-to-end",
      "Stricter password rules and tighter email verification",
    ],
  },
  {
    version: "1.0",
    date: "March 2025",
    features: [
      "First release of MakeTheCut: cutoffs at a glance on the home dashboard",
      "Choose your stream and submit grades to improve estimates for everyone",
      "Create an account, verify your email, and sign in securely",
    ],
    maintenance: [],
  },
];

function ChangelogBulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((text, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          <span
            className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"
            aria-hidden
          />
          <span className="text-neutral-300 leading-relaxed">{text}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Date helpers (UTC)
// ---------------------------------------------------------------------------
function minDateStr(a: string, b: string): string {
  return a <= b ? a : b;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** X-axis: e.g. 2025 Jan (UTC, short month). */
function formatMonthYearTick(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  const year = d.getUTCFullYear();
  const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return `${year} ${month}`;
}

/** Round to `sigDigits` significant figures (positive values only). */
function roundToSignificantDigits(value: number, sigDigits: number): number {
  if (value === 0) return 0;
  const v = Math.abs(value);
  const p = Math.floor(Math.log10(v));
  const magnitude = 10 ** (sigDigits - 1 - p);
  const rounded = Math.round(v * magnitude) / magnitude;
  return value < 0 ? -rounded : rounded;
}

/**
 * Y-axis: always 3 significant digits, e.g. 100, 1.00K, 10.0K, 100K, 1.00M (no scientific notation).
 */
function formatTrafficYAxisTick(v: number): string {
  if (v === 0) return "";
  const sign = v < 0 ? "-" : "";
  const n = Math.abs(v);

  let divisor = 1;
  let suffix = "";
  if (n >= 1_000_000) {
    divisor = 1_000_000;
    suffix = "M";
  } else if (n >= 1000) {
    divisor = 1000;
    suffix = "K";
  }

  let m = roundToSignificantDigits(n / divisor, 3);
  if (suffix === "K" && m >= 1000) {
    divisor = 1_000_000;
    suffix = "M";
    m = roundToSignificantDigits(n / divisor, 3);
  }

  let body: string;
  if (m >= 100) body = String(Math.round(m));
  else if (m >= 10) body = m.toFixed(1);
  else body = m.toFixed(2);

  return sign + body + suffix;
}

/**
 * Pick which `date` values get X-axis labels. Always includes first & last
 * indices so the right edge shows the true end date (Recharts minTickGap +
 * interval was collapsing / mis-aligning the last tick).
 */
function selectXAxisTickDates(data: ChartPoint[], maxTicks: number): string[] {
  const dates = data.map((d) => d.date);
  if (dates.length === 0) return [];
  if (dates.length <= maxTicks) return dates;
  const n = dates.length;
  const indices = new Set<number>();
  indices.add(0);
  indices.add(n - 1);
  const inner = maxTicks - 2;
  for (let j = 1; j <= inner; j++) {
    const idx = Math.round((j * (n - 1)) / (inner + 1));
    indices.add(Math.min(n - 1, Math.max(0, idx)));
  }
  return Array.from(indices)
    .sort((a, b) => a - b)
    .map((i) => dates[i]);
}

function pctChangeLabel(current: number, previous: number): string {
  if (previous === 0) {
    if (current === 0) return "0%";
    return "—";
  }
  const p = ((current - previous) / previous) * 100;
  const sign = p >= 0 ? "+" : "";
  return `${sign}${p.toFixed(1)}%`;
}

function pctChangeTone(current: number, previous: number): string {
  if (previous === 0 && current === 0) return "text-neutral-500";
  if (previous === 0) return "text-emerald-400";
  const p = current - previous;
  if (p > 0) return "text-emerald-400";
  if (p < 0) return "text-red-400";
  return "text-neutral-400";
}

// ---------------------------------------------------------------------------
// Series builders
// ---------------------------------------------------------------------------

/** Full calendar rows for current window + aligned prior window (same length) for WoW / MoM charts. */
function alignedComparisonSeries(
  map: Map<string, number>,
  yesterday: string,
  numDays: number
): ChartPoint[] {
  const curStart = addDaysUtc(yesterday, -(numDays - 1));
  const priorEnd = addDaysUtc(curStart, -1);
  const priorStart = addDaysUtc(priorEnd, -(numDays - 1));
  const points: ChartPoint[] = [];
  for (let i = 0; i < numDays; i++) {
    const dCur = addDaysUtc(curStart, i);
    const dPrior = addDaysUtc(priorStart, i);
    points.push({
      date: dCur,
      views: map.get(dCur) ?? 0,
      label: formatShortDate(dCur),
      prior: map.get(dPrior) ?? 0,
      priorDate: dPrior,
      priorLabel: formatShortDate(dPrior),
    });
  }
  return points;
}

/** Consecutive ≤7-day buckets from `windowStart` through `yesterday` (365-day window). */
function weeklySeriesLast365Days(
  map: Map<string, number>,
  yesterday: string
): ChartPoint[] {
  const windowStart = addDaysUtc(yesterday, -364);
  const points: ChartPoint[] = [];
  let ws = windowStart;
  while (ws <= yesterday) {
    const naturalEnd = addDaysUtc(ws, 6);
    const we = minDateStr(naturalEnd, yesterday);
    const sum = sumViewsInRange(map, ws, we);
    points.push({
      date: we,
      views: sum,
      label: `${formatShortDate(ws)} – ${formatShortDate(we)}`,
    });
    ws = addDaysUtc(we, 1);
  }
  return points;
}

/** All history: 7-day buckets from first day through yesterday, then cumulative sum. */
function weeklyCumulativeAllTime(
  daily: DailyPoint[],
  yesterday: string
): ChartPoint[] {
  const inRange = daily.filter((d) => d.date <= yesterday);
  if (inRange.length === 0) return [];
  const map = dailyToMap(inRange);
  const first = inRange[0].date;
  const points: ChartPoint[] = [];
  let weekStart = first;
  let cum = 0;
  while (weekStart <= yesterday) {
    const naturalEnd = addDaysUtc(weekStart, 6);
    const end = minDateStr(naturalEnd, yesterday);
    const sum = sumViewsInRange(map, weekStart, end);
    cum += sum;
    points.push({
      date: end,
      views: cum,
      label: `${formatShortDate(weekStart)} – ${formatShortDate(end)}`,
    });
    weekStart = addDaysUtc(end, 1);
  }
  return points;
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------
function TrafficTooltip({
  active,
  payload,
  range,
}: {
  active?: boolean;
  payload?: { value: number; dataKey?: string; payload?: ChartPoint }[];
  range: RangeKey;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as ChartPoint | undefined;
  if (!row) return null;

  if (
    (range === "7d" || range === "30d") &&
    row.prior !== undefined &&
    row.priorLabel
  ) {
    return (
      <div className="bg-neutral-900/95 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm shadow-2xl space-y-2">
        <div>
          <p className="text-red-400/90 text-xs font-medium mb-0.5">
            Current period
          </p>
          <p className="text-neutral-500 text-xs">{row.label}</p>
          <p className="text-white font-semibold tabular-nums">
            {row.views.toLocaleString()} views
          </p>
        </div>
        <div className="border-t border-neutral-700/80 pt-2">
          <p className="text-neutral-400 text-xs font-medium mb-0.5">
            Prior period
          </p>
          <p className="text-neutral-500 text-xs">{row.priorLabel}</p>
          <p className="text-neutral-200 font-semibold tabular-nums">
            {row.prior.toLocaleString()} views
          </p>
        </div>
      </div>
    );
  }

  const v = row.views;
  const title = row.label;
  const sub =
    range === "all"
      ? "Running total"
      : range === "365d"
      ? "Week total"
      : null;
  return (
    <div className="bg-neutral-900/95 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm shadow-2xl">
      <p className="text-neutral-400 mb-1 text-xs">{title}</p>
      <p className="text-white font-semibold tabular-nums">
        {range === "all"
          ? `${v.toLocaleString()} cumulative views`
          : `${v.toLocaleString()} views`}
      </p>
      {sub && <p className="text-neutral-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Motion (Site Traffic graph block only)
// ---------------------------------------------------------------------------
/** Traffic block: cross-fade between ranges; next view mounts after exit (mode="wait"). */
const RANGE_VIEW_EASE = [0.25, 0.1, 0.25, 1] as const;
const rangeViewTransition = { duration: 0.32, ease: RANGE_VIEW_EASE };

const RANGE_OPTIONS: { key: RangeKey; label: string; shortLabel: string }[] = [
  { key: "7d", label: "7 Days", shortLabel: "7D" },
  { key: "30d", label: "30 Days", shortLabel: "30D" },
  { key: "365d", label: "365 Days", shortLabel: "365D" },
  { key: "all", label: "All Time", shortLabel: "AT" },
];

type TrafficOverviewStats = {
  primary: string;
  primaryLabel: string;
  secondary: string;
  secondaryLabel: string;
  tertiary: string;
  tertiaryLabel: string;
  compare: string | null;
  compareClass: string;
};

function TrafficOverviewBody({
  range,
  showCompareCard,
  stats,
  loading,
  chartData,
  xAxisTicks,
}: {
  range: RangeKey;
  showCompareCard: boolean;
  stats: TrafficOverviewStats;
  loading: boolean;
  chartData: ChartPoint[];
  xAxisTicks: string[];
}) {
  return (
    <>
      <div
        className={`grid gap-3 md:gap-4 ${
          showCompareCard
            ? "grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-3"
        }`}
      >
        <div className="flex h-full min-h-[6.5rem] flex-col items-center justify-center text-center bg-white/[0.04] border border-neutral-600/40 rounded-xl p-4 md:p-5">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">
            {stats.primaryLabel}
          </p>
          <p className="text-white text-xl md:text-2xl font-semibold tabular-nums">
            {loading ? "—" : stats.primary}
          </p>
        </div>
        <div className="flex h-full min-h-[6.5rem] flex-col items-center justify-center text-center bg-white/[0.04] border border-neutral-600/40 rounded-xl p-4 md:p-5">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">
            {stats.secondaryLabel}
          </p>
          <p className="text-white text-xl md:text-2xl font-semibold tabular-nums">
            {loading ? "—" : stats.secondary}
          </p>
        </div>
        <div className="flex h-full min-h-[6.5rem] flex-col items-center justify-center text-center bg-white/[0.04] border border-neutral-600/40 rounded-xl p-4 md:p-5">
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1 line-clamp-2">
            {stats.tertiaryLabel}
          </p>
          <p className="text-white text-xl md:text-2xl font-semibold tabular-nums">
            {loading ? "—" : stats.tertiary}
          </p>
        </div>
        {showCompareCard && (
          <div className="flex h-full min-h-[6.5rem] flex-col items-center justify-center text-center bg-white/[0.04] border border-neutral-600/40 rounded-xl p-4 md:p-5">
            <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">
              {range === "7d" ? "Week / week" : "Month / month"}
            </p>
            <p
              className={`text-xl md:text-2xl font-semibold tabular-nums ${stats.compareClass}`}
            >
              {loading ? "—" : stats.compare ?? "—"}
            </p>
          </div>
        )}
      </div>

      <div className="min-h-[320px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-neutral-500">
            Loading traffic data…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-neutral-500">
            No traffic data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 12, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient
                  id="statsTrafficGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#ef4444"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="#ef4444"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                type="category"
                dataKey="date"
                ticks={xAxisTicks}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                tickFormatter={(value) => {
                  const v = String(value);
                  return range === "7d" || range === "30d"
                    ? formatShortDate(v)
                    : formatMonthYearTick(v);
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                tickFormatter={(v: number) => formatTrafficYAxisTick(v)}
                width={40}
              />
              <Tooltip
                content={<TrafficTooltip range={range} />}
                cursor={{
                  stroke: "rgba(255,255,255,0.12)",
                  strokeWidth: 1,
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Current"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#statsTrafficGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#ef4444",
                  stroke: "#fff",
                  strokeWidth: 1.5,
                }}
              />
              {(range === "7d" || range === "30d") && (
                <Line
                  type="monotone"
                  dataKey="prior"
                  name="Prior period"
                  stroke="#a3a3a3"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={{
                    r: 3,
                    fill: "#a3a3a3",
                    stroke: "#fff",
                    strokeWidth: 1,
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {(range === "7d" || range === "30d") &&
          !loading &&
          chartData.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-neutral-500">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-10 h-0.5 rounded-full bg-red-500 shrink-0"
                  aria-hidden
                />
                Current period
              </span>
              <span className="flex items-center gap-2">
                <svg
                  width={40}
                  height={10}
                  className="shrink-0 text-neutral-400"
                  aria-hidden
                >
                  <line
                    x1="0"
                    y1="5"
                    x2="40"
                    y2="5"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                  />
                </svg>
                Prior period
              </span>
            </div>
          )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function StatsPage() {
  const sectionRef = useSectionTracking<HTMLDivElement>("Stats");
  const reduceMotion = useReducedMotion();
  const [dailyAll, setDailyAll] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("30d");

  const yesterday = useMemo(() => getLastTrafficDayInclusiveUtc(), []);

  useEffect(() => {
    async function load() {
      try {
        const res = await database.listDocuments(DATABASE_ID, COLL_TRAFFIC, [
          Query.limit(120),
        ]);
        const docs = res.documents as unknown as TrafficMonthDoc[];
        setDailyAll(expandDocsToDaily(docs, yesterday));
      } catch (e) {
        console.error("Failed to load traffic data", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [yesterday]);

  const map = useMemo(() => dailyToMap(dailyAll), [dailyAll]);

  const { chartData, stats } = useMemo(() => {
    const emptyStats = {
      primary: "—",
      primaryLabel: "—",
      secondary: "—",
      secondaryLabel: "—",
      tertiary: "—",
      tertiaryLabel: "—",
      compare: null as string | null,
      compareClass: "text-neutral-500",
    };

    if (dailyAll.length === 0) {
      return { chartData: [] as ChartPoint[], stats: emptyStats };
    }

    if (range === "7d") {
      const chartData = alignedComparisonSeries(map, yesterday, 7);
      const total = chartData.reduce((s, d) => s + d.views, 0);
      const avg = chartData.length ? Math.round(total / chartData.length) : 0;
      const peakRow = chartData.reduce(
        (b, d) => (!b || d.views > b.views ? d : b),
        null as ChartPoint | null
      );
      const prevStart = addDaysUtc(yesterday, -13);
      const prevEnd = addDaysUtc(yesterday, -7);
      const curTotal = sumViewsInRange(
        map,
        addDaysUtc(yesterday, -6),
        yesterday
      );
      const prevTotal = sumViewsInRange(map, prevStart, prevEnd);
      return {
        chartData,
        stats: {
          primary: total.toLocaleString(),
          primaryLabel: "Views (7 days)",
          secondary: avg.toLocaleString(),
          secondaryLabel: "Daily average views",
          tertiary: peakRow ? peakRow.views.toLocaleString() : "—",
          tertiaryLabel: peakRow ? `Peak · ${peakRow.label}` : "Peak day",
          compare: pctChangeLabel(curTotal, prevTotal),
          compareClass: pctChangeTone(curTotal, prevTotal),
        },
      };
    }

    if (range === "30d") {
      const chartData = alignedComparisonSeries(map, yesterday, 30);
      const total = chartData.reduce((s, d) => s + d.views, 0);
      const avg = chartData.length ? Math.round(total / chartData.length) : 0;
      const peakRow = chartData.reduce(
        (b, d) => (!b || d.views > b.views ? d : b),
        null as ChartPoint | null
      );
      const curTotal = sumViewsInRange(
        map,
        addDaysUtc(yesterday, -29),
        yesterday
      );
      const prevTotal = sumViewsInRange(
        map,
        addDaysUtc(yesterday, -59),
        addDaysUtc(yesterday, -30)
      );
      return {
        chartData,
        stats: {
          primary: total.toLocaleString(),
          primaryLabel: "Views (30 days)",
          secondary: avg.toLocaleString(),
          secondaryLabel: "Daily average views",
          tertiary: peakRow ? peakRow.views.toLocaleString() : "—",
          tertiaryLabel: peakRow ? `Peak · ${peakRow.label}` : "Peak day",
          compare: pctChangeLabel(curTotal, prevTotal),
          compareClass: pctChangeTone(curTotal, prevTotal),
        },
      };
    }

    if (range === "365d") {
      const chartData = weeklySeriesLast365Days(map, yesterday);
      const total = sumViewsInRange(
        map,
        addDaysUtc(yesterday, -364),
        yesterday
      );
      const avgDaily = Math.round(total / 365);
      const peak = chartData.reduce(
        (b, p) => (!b || p.views > b.views ? p : b),
        null as ChartPoint | null
      );
      const prevTotal = sumViewsInRange(
        map,
        addDaysUtc(yesterday, -729),
        addDaysUtc(yesterday, -365)
      );
      return {
        chartData,
        stats: {
          primary: total.toLocaleString(),
          primaryLabel: "Views (365 days)",
          secondary: avgDaily.toLocaleString(),
          secondaryLabel: "Daily average views",
          tertiary: peak ? peak.views.toLocaleString() : "—",
          tertiaryLabel: peak ? `Peak week · ${peak.label}` : "Peak week",
          compare: pctChangeLabel(total, prevTotal),
          compareClass: pctChangeTone(total, prevTotal),
        },
      };
    }

    // all time — cumulative weekly
    const chartData = weeklyCumulativeAllTime(dailyAll, yesterday);
    const lastCum = chartData.length ? chartData[chartData.length - 1].views : 0;
    const totalAll = dailyAll.reduce((s, d) => s + d.views, 0);
    const avgDaily =
      dailyAll.length > 0 ? Math.round(totalAll / dailyAll.length) : 0;
    const peakDay = dailyAll.reduce(
      (b, d) => (!b || d.views > b.views ? d : b),
      null as DailyPoint | null
    );
    return {
      chartData,
      stats: {
        primary: lastCum.toLocaleString(),
        primaryLabel: "Cumulative views",
        secondary: avgDaily.toLocaleString(),
        secondaryLabel: "Daily average views",
        tertiary: peakDay ? peakDay.views.toLocaleString() : "—",
        tertiaryLabel: peakDay
          ? `Peak day · ${formatShortDate(peakDay.date)}`
          : "Peak day",
        compare: null,
        compareClass: "",
      },
    };
  }, [dailyAll, map, range, yesterday]);

  const xAxisTicks = useMemo((): string[] => {
    if (chartData.length === 0) return [];
    const maxTicks =
      range === "7d"
        ? 7
        : range === "30d"
        ? 7
        : range === "365d"
        ? 9
        : 10;
    return selectXAxisTickDates(chartData, maxTicks);
  }, [chartData, range]);

  const showCompareCard = range === "7d" || range === "30d";

  return (
    <div className="flex flex-col min-h-screen">
      <GridBackground className="flex-1 flex flex-col">
        <HomeButton />

        <div
          ref={sectionRef}
          className="flex flex-col gap-6 md:gap-8 px-6 md:px-16 lg:px-28 pt-24 pb-16 max-w-6xl mx-auto w-full"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            MakeTheCut Statistics &amp; Change Log
          </h1>


          <section className="w-full bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 md:p-8 border-b border-neutral-600/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">
                Site Traffic
              </h2>
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="Date range"
              >
                {RANGE_OPTIONS.map(({ key, label, shortLabel }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-label={label}
                    aria-selected={range === key}
                    onClick={() => setRange(key)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      range === key
                        ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : "bg-white/[0.04] text-neutral-400 border-neutral-600/40 hover:bg-white/[0.07] hover:text-neutral-200"
                    }`}
                  >
                    <span className="md:hidden" aria-hidden="true">
                      {shortLabel}
                    </span>
                    <span className="hidden md:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8">
              {reduceMotion ? (
                <div key={range} className="space-y-6">
                  <TrafficOverviewBody
                    range={range}
                    showCompareCard={showCompareCard}
                    stats={stats}
                    loading={loading}
                    chartData={chartData}
                    xAxisTicks={xAxisTicks}
                  />
                </div>
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={range}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={rangeViewTransition}
                  >
                    <TrafficOverviewBody
                      range={range}
                      showCompareCard={showCompareCard}
                      stats={stats}
                      loading={loading}
                      chartData={chartData}
                      xAxisTicks={xAxisTicks}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </section>

          <section className="w-full bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 md:p-8 border-b border-neutral-600/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">Change Log</h2>
              <p className="text-neutral-500 text-sm sm:text-right">
                Product updates &amp; milestones
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-4 md:space-y-5">
              {CHANGELOG.map((entry) => (
                <div
                  key={entry.version}
                  className="bg-white/[0.04] border border-neutral-600/40 rounded-xl p-4 md:p-5"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-3 md:mb-4">
                    <span className="bg-red-500/15 text-red-400 text-xs font-semibold px-3 py-1 rounded-full border border-red-500/30">
                      v{entry.version}
                    </span>
                    <span className="text-neutral-500 text-sm tabular-nums">
                      {entry.date}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {entry.features.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">
                          New features
                        </p>
                        <ChangelogBulletList items={entry.features} />
                      </div>
                    )}
                    {entry.maintenance.length > 0 && (
                      <div
                        className={
                          entry.features.length > 0
                            ? "space-y-2 pt-4 border-t border-neutral-700/40"
                            : "space-y-2"
                        }
                      >
                        <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">
                          Maintenance &amp; quality of life
                        </p>
                        <ChangelogBulletList items={entry.maintenance} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </GridBackground>
      <Footer />
    </div>
  );
}
