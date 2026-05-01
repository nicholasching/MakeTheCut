"use client";

import { useState, useEffect, useCallback } from "react";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import HorizontalBarChart from "@/components/HorizontalBarChart";
import StreamChoiceGraph from "@/components/StreamChoiceGraph";
import GradeDistributionChart from "@/components/GradeDistributionChart";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import LiveCounter from "@/components/LiveCounter";
import LogoutButton from "@/components/LogoutButton";
import Footer from "@/components/Footer";
import {
  ChevronDown,
  Calculator,
  ClipboardList,
  Info,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  usePageTransition,
  useTransitionPageReady,
} from "@/components/TransitionProvider";
import {
  academicYearFullLabel,
  academicYearShortLabel,
  streamKeyFromCutoffDocId,
} from "@/lib/appwriteDb";
import {
  getAccountCached,
  getCutoffTotalCached,
  getMarksTotalCached,
  getUserDocCached,
  listCutoffsForYearCached,
} from "@/lib/appwriteCache";
import {
  computeCurrentDashboardYear,
  getCompletedYears,
  getCohortAccess,
} from "@/lib/scheduleConfig";

const SPECTATOR_ADMIT_YEAR = 99;

type DashboardGraphKey = "cutoffs" | "streamChoice" | "gradeDistribution";

const initialChartReadyState: Record<DashboardGraphKey, boolean> = {
  cutoffs: false,
  streamChoice: false,
  gradeDistribution: false,
};

type ChoiceBucket = 1 | 2 | 3;

type ChoiceSummary = {
  first: number;
  second: number;
  third: number;
  denominator: number;
  projected: ChoiceBucket | null;
};

const initialChoiceSummary: ChoiceSummary = {
  first: 0,
  second: 0,
  third: 0,
  denominator: 0,
  projected: null,
};

function percentageText(count: number, denominator: number) {
  if (!denominator || denominator <= 0) return "0.0%";
  return `${((count / denominator) * 100).toFixed(1)}%`;
}

function LiveChoiceProjectionSection({
  summary,
}: {
  summary: ChoiceSummary;
}) {
  const cards: { key: ChoiceBucket; title: string; value: number }[] = [
    { key: 1, title: "First Choice", value: summary.first },
    { key: 2, title: "Second Choice", value: summary.second },
    { key: 3, title: "Third Choice", value: summary.third },
  ];

  return (
    <section className="w-full bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-center mb-3">
        <div className="text-center">
          <h2 className="text-lg md:text-xl font-semibold text-white">
            Live Stream Choice Outcomes
          </h2>
          <p className="text-xs md:text-sm text-neutral-400">
            Percentage of students projected to receive each choice from live submissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => {
          const isProjected = summary.projected === card.key;
          return (
            <div
              key={card.key}
              className={`rounded-xl border p-4 transition-all ${
                isProjected
                  ? "border-red-400/70 bg-red-500/10 shadow-[0_0_0_1px_rgba(248,113,113,0.35)]"
                  : "border-neutral-600/40 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-center text-center">
                <p className="text-sm text-neutral-300 font-medium">{card.title}</p>
              </div>
              <p className="text-3xl font-bold text-white text-center">
                {percentageText(card.value, summary.denominator)}
              </p>
              <p className="text-xs text-neutral-500 mt-1 text-center">
                {card.value} / {summary.denominator || 0} students
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatisticsDropdown({ year }: { year: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setHasOpened(true);
      return next;
    });
  };

  return (
    <div className="w-full bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-2xl overflow-hidden shadow-2xl">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center justify-between w-full p-6 hover:bg-white/[0.04] transition-all duration-300 group"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          <span className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
            {academicYearFullLabel(year)} Stream Statistics
          </span>
        </div>
        <div
          className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          <ChevronDown className="w-6 h-6 text-neutral-400 group-hover:text-blue-400" />
        </div>
      </button>

      <div
        className={`transition-all duration-700 ease-out overflow-hidden ${
          isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {hasOpened && (
          <div className="p-6 pt-2 space-y-8">
            <div>
              <HorizontalBarChart year={year} />
            </div>
            <div>
              <StreamChoiceGraph year={year} />
            </div>
            <div>
              <GradeDistributionChart year={year} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MethodologyDropdown({ priorYear }: { priorYear: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-2xl overflow-hidden shadow-2xl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-6 hover:bg-white/[0.04] transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
            Methodology & Data Sources
          </span>
        </div>
        <div
          className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          <ChevronDown className="w-6 h-6 text-neutral-400 group-hover:text-blue-400" />
        </div>
      </button>

      <div
        className={`transition-all duration-700 ease-out overflow-hidden ${
          isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 pt-0 space-y-8">
          <p className="text-neutral-400 text-base leading-relaxed">
            MakeTheCut uses two separate pipelines: estimated cutoffs from simulated allocation and reported cutoffs from
            student admission outcomes.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/[0.04] border border-neutral-600/40 rounded-xl p-6 hover:border-blue-500/20 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-blue-500/15">
                  <Calculator className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Estimated Cutoffs</h3>
              </div>
              <p className="text-neutral-400 text-sm mb-4">
                Simulated allocation using McMaster&apos;s historical seat proportions and current preference submissions:
              </p>
              <ul className="space-y-2.5 text-neutral-300 text-sm">
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">1.</span>
                  Exclude submissions with zero GPA; apply historical stream seat shares (averaged over 4 years).
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">2.</span>
                  Assign free-choice students first, then non-free-choice by descending GPA, respecting preferences and
                  capacity.
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">3.</span>
                  Cutoff = lowest non-free-choice GPA admitted. Underfilled streams use 4.0; fully free-choice-filled
                  streams use 12.0.
                </li>
              </ul>
              <p className="mt-4 text-xs text-neutral-500 italic">
                {academicYearShortLabel(priorYear)} estimates are locked; no further updates.
              </p>
            </div>

            <div className="bg-white/[0.04] border border-neutral-600/40 rounded-xl p-6 hover:border-blue-500/20 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-blue-500/15">
                  <ClipboardList className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Reported Cutoffs</h3>
              </div>
              <p className="text-neutral-400 text-sm mb-4">
                Derived from student-reported admission and rejection outcomes by stream:
              </p>
              <ul className="space-y-2.5 text-neutral-300 text-sm">
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">1.</span>
                  Collect stream-in and stream-out reports linked to GPA; exclude free-choice and invalid/zero GPA
                  entries.
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">2.</span>
                  Iteratively remove outlier pairs when the gap between lowest admitted and highest rejected exceeds 0.5
                  GPA.
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">3.</span>
                  Cutoff = midpoint of lowest admitted and highest rejected, or a one-sided bound when only one side
                  exists.
                </li>
              </ul>
              <p className="mt-4 text-xs text-neutral-500 italic">Updated as students share results.</p>
            </div>
          </div>

          <div className="bg-white/[0.04] border border-neutral-600/40 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/15">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Limitations & Updates</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-neutral-300 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-neutral-200">Limitations</p>
                <ul className="space-y-1.5">
                  <li>• Limited sample sizes may reduce accuracy</li>
                  <li>• Possible fake submissions affect data quality</li>
                  <li>• Seat shares based on historical data may vary</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-neutral-200">Update cadence</p>
                <ul className="space-y-1.5">
                  <li>• Stream preferences: real-time</li>
                  <li>• Reported cutoffs: as students report</li>
                  <li>• Estimated cutoffs: locked for {academicYearShortLabel(priorYear)}</li>
                  <li>• Historical data: annual verification</li>
                </ul>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-600/30">
              <AlertCircle className="w-5 h-5 text-amber-400/90 shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-400">
                <strong className="text-neutral-300">Disclaimer:</strong> This data is for informational purposes only.
                Always consult official university sources for final admission requirements and decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { navigate } = usePageTransition();
  const sectionRef = useSectionTracking<HTMLDivElement>("Dashboard");
  const [, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartReady, setChartReady] = useState(() => initialChartReadyState);
  const [choiceSummary, setChoiceSummary] = useState<ChoiceSummary>(
    initialChoiceSummary
  );
  const setChartTransitionReady = useCallback(
    (key: DashboardGraphKey, ready: boolean) => {
      setChartReady((prev) =>
        prev[key] === ready ? prev : { ...prev, [key]: ready }
      );
    },
    []
  );
  const handleCutoffsTransitionReady = useCallback(
    (ready: boolean) => setChartTransitionReady("cutoffs", ready),
    [setChartTransitionReady]
  );
  const handleStreamChoiceTransitionReady = useCallback(
    (ready: boolean) => setChartTransitionReady("streamChoice", ready),
    [setChartTransitionReady]
  );
  const handleGradeDistributionTransitionReady = useCallback(
    (ready: boolean) => setChartTransitionReady("gradeDistribution", ready),
    [setChartTransitionReady]
  );
  const dashboardReady =
    !isLoading &&
    chartReady.cutoffs &&
    chartReady.streamChoice &&
    chartReady.gradeDistribution;
  useTransitionPageReady(dashboardReady);
  const dashboardYear = computeCurrentDashboardYear();
  const priorDashboardYear = dashboardYear - 1;
  const completedYears = getCompletedYears();
  const showLiveChoiceProjection = getCohortAccess(dashboardYear).hasFullGradeData;

  useEffect(() => {
    async function initiatePage() {
      try {
        const loggedInUser = await getAccountCached();
        if (!loggedInUser.emailVerification) {
          navigate("/authenticate");
          return;
        }
        setUserName(loggedInUser.name || "User");

        // ── Gating: check required data for each currently-open window ──
        let doc: Record<string, unknown> | null = null;
        try {
          doc = (await getUserDocCached(loggedInUser.$id)) as unknown as Record<string, unknown>;
        } catch {
          // No user doc yet — redirect to /me whenever any window is open.
          const a = getCohortAccess(dashboardYear);
          const shouldEnforceGating = !a.streamResultsLocked;
          if (
            shouldEnforceGating &&
            (
              a.canEditStreamPrefs ||
              a.canEditSem1Grades ||
              a.canEditAllGrades ||
              a.canEditStreamResults
            )
          ) {
            navigate("/me");
            return;
          }
        }

        if (doc) {
          const admitYear = (doc.admitYear as number | undefined) ?? dashboardYear;
          const isSpectator = admitYear === SPECTATOR_ADMIT_YEAR;
          const a = getCohortAccess(admitYear);
          const shouldEnforceGating = !isSpectator && !a.streamResultsLocked;

          // Apr 1 year N → Jun 1 year N+1: must have all three stream preferences set.
          if (shouldEnforceGating && a.canEditStreamPrefs) {
            const streams = doc.streams as string | undefined;
            const parts =
              streams && streams !== "null" ? streams.split(",").filter(Boolean) : [];
            if (parts.length < 3) {
              navigate("/me");
              return;
            }
          }

          // Dec 20 → lock: must have at least one grade > 0 (any course).
          if (shouldEnforceGating && (a.canEditSem1Grades || a.canEditAllGrades)) {
            const gradeCols = [
              "math1za3", "math1zb3", "math1zc3",
              "phys1d03", "phys1e03", "chem1e03", "eng1p13",
            ];
            const hasNumericGrade = gradeCols.some((col) => Number(doc![col]) > 0);
            const elec1 = doc.elec1 as string | undefined;
            const elec2 = doc.elec2 as string | undefined;
            const hasElecGrade =
              (elec1 && elec1 !== "null" && Number(elec1.split(",")[1]) > 0) ||
              (elec2 && elec2 !== "null" && Number(elec2.split(",")[1]) > 0);
            if (!hasNumericGrade && !hasElecGrade) {
              navigate("/me");
              return;
            }
          }

          // Jun 1 N+1 → May 1 N+2: must have streamIn set.
          if (shouldEnforceGating && a.canEditStreamResults) {
            const streamIn = doc.streamIn as string | undefined;
            if (!streamIn || streamIn === "null" || streamIn.trim() === "") {
              navigate("/me");
              return;
            }
          }
        }

        if (showLiveChoiceProjection) {
          try {
            const [cutoffTotalDoc, marksTotalDoc, allCutoffs] = await Promise.all([
              getCutoffTotalCached(dashboardYear),
              getMarksTotalCached(dashboardYear),
              listCutoffsForYearCached(dashboardYear),
            ]);

            const first = Number(cutoffTotalDoc.firstChoice) || 0;
            const second = Number(cutoffTotalDoc.secondChoice) || 0;
            const third = Number(cutoffTotalDoc.thirdChoice) || 0;
            const distribution = String(marksTotalDoc.distribution || "")
              .split(",")
              .map((n) => Number(n))
              .filter((n) => !Number.isNaN(n));
            const denominator = distribution.reduce((sum, n) => sum + n, 0);

            let projected: ChoiceBucket | null = null;
            if (doc) {
              const userGpa = Number(doc.gpa) || 0;
              const isFreeChoice = Boolean(doc.freechoice);
              const streamChoices = String(doc.streams || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 3);

              if (isFreeChoice && streamChoices.length > 0) {
                projected = 1;
              } else if (userGpa > 0 && streamChoices.length > 0) {
                const cutoffByStream: Record<string, number> = {};
                allCutoffs.documents.forEach((cDoc: { $id: string; streamCutoff?: number | string }) => {
                  const key = streamKeyFromCutoffDocId(cDoc.$id);
                  if (!key || key === "total") return;
                  cutoffByStream[key] = Number(cDoc.streamCutoff) || 0;
                });

                if (streamChoices[0] && userGpa >= (cutoffByStream[streamChoices[0]] ?? 13)) {
                  projected = 1;
                } else if (streamChoices[1] && userGpa >= (cutoffByStream[streamChoices[1]] ?? 13)) {
                  projected = 2;
                } else if (streamChoices[2] && userGpa >= (cutoffByStream[streamChoices[2]] ?? 13)) {
                  projected = 3;
                }
              }
            }

            setChoiceSummary({ first, second, third, denominator, projected });
          } catch {
            setChoiceSummary(initialChoiceSummary);
          }
        } else {
          setChoiceSummary(initialChoiceSummary);
        }
        // ── End gating ──
      } catch {
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    }
    initiatePage();
  }, [navigate, dashboardYear, showLiveChoiceProjection]);

  if (isLoading) {
    return (
      <GridBackground className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-neutral-400 animate-pulse">Loading your dashboard...</p>
        </div>
      </GridBackground>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" ref={sectionRef}>
      <GridBackground className="flex flex-1 p-5 pt-28 lg:p-12 lg:pt-28">
        <HomeButton />
        <LogoutButton />

        <div className="relative w-full max-w-7xl mx-auto">
          <div className="pointer-events-none absolute inset-x-0 -top-20 z-20 flex justify-center">
            <LiveCounter mode="siteViews" layout="dashboard" />
          </div>
          <div className="flex flex-col gap-8">
            <div className="z-10 flex flex-col gap-8">
              {showLiveChoiceProjection && (
                <LiveChoiceProjectionSection summary={choiceSummary} />
              )}
              <HorizontalBarChart
                year={dashboardYear}
                onTransitionReadyChange={handleCutoffsTransitionReady}
              />
              <StreamChoiceGraph
                year={dashboardYear}
                onTransitionReadyChange={handleStreamChoiceTransitionReady}
              />
              <GradeDistributionChart
                year={dashboardYear}
                onTransitionReadyChange={handleGradeDistributionTransitionReady}
              />
            </div>

            <div className="flex flex-col gap-6">
              {completedYears.map((y) => (
                <StatisticsDropdown key={y} year={y} />
              ))}
            </div>

            <div>
              <MethodologyDropdown priorYear={priorDashboardYear} />
            </div>
          </div>
        </div>
      </GridBackground>

      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
