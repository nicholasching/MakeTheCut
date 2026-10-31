"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, motion, AnimatePresence } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  ADMISSION,
} from "@/lib/appwriteDb";
import { getCutoffTotalCached, listTrafficDocsCached } from "@/lib/appwriteCache";
import { COHORT_LAUNCH_YEAR } from "@/lib/scheduleConfig";
import {
  addDaysUtc,
  dailyToMap,
  expandDocsToDaily,
  getLastTrafficDayInclusiveUtc,
  sumViewsInRange,
  type TrafficMonthDoc,
} from "@/lib/trafficDaily";
import { usePageTransition } from "@/components/TransitionProvider";

interface LiveCounterProps {
  className?: string;
  /** `contributions` = lifetime data points (home). `siteViews` = 7-day traffic + WoW (dashboard). */
  mode?: "contributions" | "siteViews";
  /** `dashboard` = fixed, centered between home and profile. */
  layout?: "default" | "dashboard";
}

type WowInfo =
  | { kind: "dash"; direction: "neutral" }
  | { kind: "zero"; direction: "flat" }
  | { kind: "percent"; direction: "up" | "down" | "flat"; value: number };

function computeWow(cur: number, prev: number): WowInfo {
  if (prev === 0 && cur === 0) return { kind: "zero", direction: "flat" };
  if (prev === 0) return { kind: "dash", direction: "neutral" };
  const p = ((cur - prev) / prev) * 100;
  if (p > 0) return { kind: "percent", direction: "up", value: p };
  if (p < 0) return { kind: "percent", direction: "down", value: p };
  return { kind: "percent", direction: "flat", value: 0 };
}

const counterEase = [0.22, 1, 0.36, 1] as const;
const counterDuration = 2;

export default function LiveCounter({
  className = "",
  mode = "contributions",
  layout = "default",
}: LiveCounterProps) {
  const { navigate } = usePageTransition();
  const [totalContributions, setTotalContributions] = useState<number | null>(
    null
  );
  const [animatedCount, setAnimatedCount] = useState(0);

  const [views7d, setViews7d] = useState<number | null>(null);
  const [wowInfo, setWowInfo] = useState<WowInfo | null>(null);
  const [animatedWowPercent, setAnimatedWowPercent] = useState(0);

  const lastTrafficDay = useMemo(() => getLastTrafficDayInclusiveUtc(), []);

  useEffect(() => {
    if (mode !== "contributions") return;
    const getContributions = async () => {
      const years: number[] = [];
      for (let y = COHORT_LAUNCH_YEAR; y <= ADMISSION.current; y++) years.push(y);
      const totals = await Promise.all(
        years.map((year) => getCutoffTotalCached(year))
      );
      const contributions = totals.reduce((sum, totalDoc, idx) => {
        const year = years[idx];
        const streamCount =
          typeof totalDoc.streamCount === "number" ? totalDoc.streamCount : 0;
        const reportCutoff =
          typeof totalDoc.reportCutoff === "number" ? totalDoc.reportCutoff : 0;
        if (year === ADMISSION.current) return sum + streamCount * 8;
        return sum + streamCount * 10 + reportCutoff;
      }, 0);
      setTotalContributions(contributions);
    };
    getContributions();
  }, [mode]);

  useEffect(() => {
    if (mode !== "siteViews") return;
    async function loadTraffic() {
      setViews7d(null);
      setWowInfo(null);
      try {
        const res = await listTrafficDocsCached(120);
        const docs = res.documents as unknown as TrafficMonthDoc[];
        const daily = expandDocsToDaily(docs, lastTrafficDay);
        const map = dailyToMap(daily);
        const end = lastTrafficDay;
        const curStart = addDaysUtc(end, -6);
        const prevEnd = addDaysUtc(curStart, -1);
        const prevStart = addDaysUtc(prevEnd, -6);
        const cur = sumViewsInRange(map, curStart, end);
        const prev = sumViewsInRange(map, prevStart, prevEnd);
        setViews7d(cur);
        setWowInfo(computeWow(cur, prev));
      } catch (e) {
        console.error("Failed to load traffic for LiveCounter", e);
        setViews7d(null);
        setWowInfo(null);
      }
    }
    loadTraffic();
  }, [mode, lastTrafficDay]);

  useEffect(() => {
    if (mode !== "contributions" || totalContributions === null) return;
    const controls = animate(0, totalContributions, {
      duration: counterDuration,
      ease: counterEase,
      onUpdate(value) {
        setAnimatedCount(Math.round(value));
      },
    });
    return () => controls.stop();
  }, [mode, totalContributions]);

  useEffect(() => {
    if (mode !== "siteViews" || views7d === null || wowInfo === null) return;

    setAnimatedCount(0);
    setAnimatedWowPercent(0);

    const c1 = animate(0, views7d, {
      duration: counterDuration,
      ease: counterEase,
      onUpdate(value) {
        setAnimatedCount(Math.round(value));
      },
    });

    let c2: { stop: () => void } | undefined;
    if (wowInfo.kind === "percent") {
      c2 = animate(0, wowInfo.value, {
        duration: counterDuration,
        ease: counterEase,
        onUpdate(value) {
          setAnimatedWowPercent(Number(value.toFixed(1)));
        },
      });
    }

    return () => {
      c1.stop();
      c2?.stop();
    };
  }, [mode, views7d, wowInfo]);

  const shell =
    "bg-white/10 backdrop-blur-lg rounded-md p-3 px-5 flex items-center justify-center gap-3";

  const positionClass =
    mode === "siteViews" && layout === "dashboard"
      ? "w-fit"
      : "fixed top-10 w-fit left-1/2 transform -translate-x-1/2 md:translate-x-0 md:right-15 md:left-auto z-10";

  const mergedClass = `${shell} ${positionClass} ${className}`.trim();
  if (mode === "siteViews") {
    return (
      <button
        type="button"
        onClick={() => navigate("/stats")}
        className={`${mergedClass} pointer-events-auto cursor-pointer border border-white/10 text-subtitle hover:bg-white/[0.14] hover:border-white/20 transition-colors duration-200 group`}
        aria-label="Open site statistics and traffic charts"
      >
        <div
          className="relative flex h-3 w-3 shrink-0 items-center justify-center"
          aria-hidden
        >
          <span className="absolute inset-0 rounded-full bg-red-500" />
          <span className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping" />
        </div>
        <div className="flex items-center gap-x-1 whitespace-nowrap text-white leading-normal">
          <span className="shrink-0">Site Traffic:</span>
          <span className="inline-flex items-center tabular-nums font-semibold">
            <AnimatePresence mode="wait">
              {views7d === null ? (
                <motion.span
                  key="loading"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Loading...
                </motion.span>
              ) : (
                <motion.span
                  key="count"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {animatedCount.toLocaleString()}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          {views7d !== null && wowInfo !== null && (
            <>
              {wowInfo.kind === "dash" && (
                <span className="inline-flex items-center font-semibold tabular-nums text-neutral-400">
                  —
                </span>
              )}
              {wowInfo.kind === "zero" && (
                <span className="inline-flex items-center font-semibold tabular-nums text-neutral-400">
                  0%
                </span>
              )}
              {wowInfo.kind === "percent" && (
                <span
                  className={`inline-flex items-center gap-0.5 font-semibold tabular-nums leading-none ${
                    wowInfo.direction === "up"
                      ? "text-emerald-400"
                      : wowInfo.direction === "down"
                        ? "text-red-400"
                        : "text-neutral-400"
                  }`}
                >
                  {animatedWowPercent >= 0 ? "+" : ""}
                  {animatedWowPercent.toFixed(1)}%
                  {wowInfo.direction === "up" && (
                    <TrendingUp
                      className="size-[1em] shrink-0"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  )}
                  {wowInfo.direction === "down" && (
                    <TrendingDown
                      className="size-[1em] shrink-0"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  )}
                </span>
              )}
            </>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className={mergedClass}>
      <div className="relative w-3 h-3">
        <div className="absolute inset-0 rounded-full bg-red-500"></div>
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
      </div>
      <p className="text-white text-subtitle whitespace-nowrap">
        Lifetime Data Points:{" "}
        <AnimatePresence mode="wait">
          {totalContributions === null ? (
            <motion.span
              key="loading"
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              Loading...
            </motion.span>
          ) : (
            <motion.span
              key="count"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {animatedCount}
            </motion.span>
          )}
        </AnimatePresence>
      </p>
    </div>
  );
}
