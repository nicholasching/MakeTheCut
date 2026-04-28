"use client";

import { useState, useEffect, useMemo } from "react";
import { usePageTransition } from "@/components/TransitionProvider";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  Cell,
  Tooltip as ChartTooltip,
} from "recharts";
import { account, database } from "../app/appwrite";
import {
  ADMISSION,
  COLL_USERS,
  DATABASE_ID,
  COLL_CUTOFFS,
  COLL_MARKS,
  isActiveEng1Cohort,
  isGraduatedCohort,
  listCutoffsForYear,
  streamKeyFromCutoffDocId,
  cutoffDocId,
  markDocId,
  liveAcademicYearLabel,
  academicYearFullLabel,
} from "@/lib/appwriteDb";
import { getCohortAccess } from "@/lib/scheduleConfig";
import { CardDescription } from "@/components/ui/card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

type Row = {
  stream: string;
  GPA: number;
  reportCutoff: number;
  people: number;
  freeChoicePeople: number;
};

const STREAM_ORDER = [
  { key: "chem", label: "Chemical" },
  { key: "civ", label: "Civil" },
  { key: "comp", label: "Computer" },
  { key: "elec", label: "Electrical" },
  { key: "engphys", label: "Engineering Physics" },
  { key: "mat", label: "Materials" },
  { key: "mech", label: "Mechanical" },
  { key: "tron", label: "Mechatronics" },
  { key: "soft", label: "Software" },
] as const;

function emptyRows(): Row[] {
  return STREAM_ORDER.map((s) => ({
    stream: s.label,
    GPA: 4,
    reportCutoff: 4,
    people: 0,
    freeChoicePeople: 0,
  }));
}

const chartConfigEstimated = {
  GPA: { label: "GPA Cutoff", color: "#ffffff" },
} satisfies ChartConfig;

const chartConfigBoth = {
  GPA: { label: "Estimated Cutoff", color: "#ffffff" },
  reportCutoff: { label: "Reported Cutoff", color: "#22c55e" },
} satisfies ChartConfig;

const CustomTooltipEstimated = ({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) => {
  if (active && payload?.length) {
    const p = payload[0].payload;
    const freeChoicePercent =
      p.people > 0 ? ((p.freeChoicePeople / p.people) * 100).toFixed(1) : "0.0";
    return (
      <div className="bg-neutral-800 p-2 rounded border border-neutral-700 text-sm">
        <p className="mb-1">
          <strong>{p.stream}</strong>
        </p>
        <p className="text-[#f4ab33]">GPA Cutoff: {p.GPA.toFixed(2)}</p>
        <p className="text-white">
          People Entering Stream: {p.people} ({freeChoicePercent}% FC)
        </p>
      </div>
    );
  }
  return null;
};

const CustomTooltipBoth = ({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) => {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-800 p-2 rounded border border-neutral-700 text-sm">
        <p className="mb-1">
          <strong>{data.stream}</strong>
        </p>
        <p className="text-[#f4ab33]">Estimated Cutoff: {data.GPA.toFixed(2)}</p>
        <p className="text-[#22c55e]">Reported Cutoff: {data.reportCutoff.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const SpinningLoader = () => (
  <div className="flex justify-center items-center">
    <svg className="animate-spin" width="250" height="250" viewBox="0 0 250 250">
      <defs>
        <filter id="glow-hbc" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g filter="url(#glow-hbc)">
        {[...Array(6)].map((_, i) => {
          const angle = ((i * 60) * Math.PI) / 180;
          const cx = 125 + 85 * Math.cos(angle);
          const cy = 125 + 85 * Math.sin(angle);
          const opacity = 0.2 + 0.8 * (1 - (i % 6) / 6);
          return (
            <circle key={i} cx={cx} cy={cy} r={18} fill={`rgba(255, 255, 255, ${opacity})`} />
          );
        })}
      </g>
    </svg>
  </div>
);

export default function HorizontalBarChart({
  year = ADMISSION.current,
  onTransitionReadyChange,
}: {
  year?: number;
  onTransitionReadyChange?: (ready: boolean) => void;
}) {
  const access = useMemo(() => getCohortAccess(year), [year]);
  const { navigate } = usePageTransition();
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<Row[]>(emptyRows);
  const [shouldShowUserLine, setShouldShowUserLine] = useState(false);
  const [userGPA, setUserGPA] = useState(4);
  const [totalContributions, setTotalContributions] = useState(0);
  const [totalFreeChoiceContributions, setTotalFreeChoiceContributions] = useState(0);
  const [totalReported, setTotalReported] = useState(0);

  /** Restore original per-year styling: live uses subtle white, archived uses dark overlay. */
  const isLive = year === ADMISSION.current && !access.showReportedCutoffs;
  const cardClass = isLive
    ? "bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-2xl text-white w-full gap-0 pt-6 pb-4 overflow-hidden"
    : "bg-neutral-900/40 backdrop-blur-sm text-white w-full border border-neutral-600/30 rounded-2xl p-1 pt-6 pb-4 overflow-hidden";
  const contentClass = isLive
    ? "h-[500px] md:h-[600px]"
    : "h-[500px] md:h-[600px] px-2";
  const transitionReady = !access.hasGradeData || !loading;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!getCohortAccess(year).hasGradeData) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const rows = emptyRows();
      let showLine = false;
      let ugpa = 4;

      try {
        const loggedInUser = await account.get();
        try {
          const user = await database.getDocument(
            DATABASE_ID,
            COLL_USERS,
            loggedInUser.$id
          );
          const ay = (user as { admitYear?: number }).admitYear;
          ugpa = Number((user as { gpa?: number }).gpa) || 0;
          const acc = getCohortAccess(year);
          if (acc.showReportedCutoffs) {
            showLine = ay === year && ugpa > 0;
          } else {
            showLine =
              year === ADMISSION.current &&
              isActiveEng1Cohort(ay) &&
              !isGraduatedCohort(ay) &&
              ugpa > 0;
          }
        } catch {
          navigate("/me");
          setLoading(false);
          return;
        }

        const cutoffDocs = await listCutoffsForYear(database, year);
        cutoffDocs.forEach(
          (doc: {
            $id: string;
            streamCutoff?: string | number;
            streamCount?: number;
            freeChoice?: number;
            reportCutoff?: string | number;
          }) => {
            const key = streamKeyFromCutoffDocId(doc.$id);
            const idx = STREAM_ORDER.findIndex((s) => s.key === key);
            if (idx < 0) return;
            rows[idx].GPA = parseFloat(String(doc.streamCutoff)) || 4;
            rows[idx].people = doc.streamCount || 0;
            rows[idx].freeChoicePeople = Number(doc.freeChoice) || 0;
            rows[idx].reportCutoff =
              parseFloat(String(doc.reportCutoff ?? 4)) || 4;
          }
        );

        try {
          if (getCohortAccess(year).showReportedCutoffs) {
            const totalDoc = await database.getDocument(
              DATABASE_ID,
              COLL_CUTOFFS,
              cutoffDocId(year, "total")
            );
            setTotalContributions(Number(totalDoc.streamCount) || 0);
            setTotalFreeChoiceContributions(Number(totalDoc.freeChoice) || 0);
            setTotalReported(Number(totalDoc.reportCutoff) || 0);
          } else {
            const [marksTotal, cutoffTotal] = await Promise.all([
              database.getDocument(
                DATABASE_ID,
                COLL_MARKS,
                markDocId(year, "total")
              ),
              database.getDocument(
                DATABASE_ID,
                COLL_CUTOFFS,
                cutoffDocId(year, "total")
              ),
            ]);
            const distributionStr = marksTotal.distribution || "";
            const distributionArr = distributionStr
              .split(",")
              .map(Number)
              .filter((x: number) => !isNaN(x));
            const sum = distributionArr.reduce((acc: number, val: number) => acc + val, 0);
            setTotalContributions(sum);
            setTotalFreeChoiceContributions(Number(cutoffTotal.freeChoice) || 0);
            setTotalReported(0);
          }
        } catch {
          setTotalContributions(0);
          setTotalFreeChoiceContributions(0);
          setTotalReported(0);
        }

        if (!cancelled) {
          setChartData(rows);
          setUserGPA(ugpa);
          setShouldShowUserLine(showLine);
        }
      } catch {
        navigate("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [year, navigate]);

  useEffect(() => {
    onTransitionReadyChange?.(transitionReady);
  }, [onTransitionReadyChange, transitionReady]);

  if (!access.hasGradeData) {
    return null;
  }

  if (loading) {
    return (
      <Card className={`${cardClass} relative overflow-hidden`}>
        <CardHeader className="text-neutral-500">
          <CardTitle className="text-subtitle">Loading Stream Data...</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px] md:h-[600px] flex items-center justify-center">
          <SpinningLoader />
        </CardContent>
      </Card>
    );
  }

  const title = access.showReportedCutoffs
    ? `${academicYearFullLabel(year)} Stream Cutoffs`
    : `${liveAcademicYearLabel()} Estimated Stream Cutoffs`;

  const barColors = [
    "#CC7400",
    "#E07F00",
    "#F58B00",
    "#FF950A",
    "#FF9E1F",
    "#FFA833",
    "#FFB147",
    "#FFB95C",
    "#FFC170",
  ];
  const getBarFill = (stream: string) => {
    const index = chartData.findIndex((item) => item.stream === stream);
    return barColors[index % barColors.length];
  };

  return (
    <Card className={cardClass}>
      <CardHeader className="text-neutral-500">
        <div className="flex flex-col justify-center items-center">
          <CardTitle className="text-subtitle flex items-center gap-3 mb-1">{title}</CardTitle>
          <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse">
            {access.showReportedCutoffs ? (
              <p>
                Total Estimated Cutoff Contributions: {totalContributions} | Total Reported Cutoff
                Contributions: {totalReported}
              </p>
            ) : (
              <>
                {totalContributions < 100 && totalContributions !== 0 && (
                  <p>
                    Note: Initial results may swing significantly as data rolls in. For any specific stream, the
                    numbers will become statistically significant once we surpass 100 responses.
                  </p>
                )}
                <p>
                  Current Contributions: {totalContributions} | Free Choice: {totalFreeChoiceContributions}
                </p>
              </>
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className={contentClass}>
        <ChartContainer
          config={access.showReportedCutoffs ? chartConfigBoth : chartConfigEstimated}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={
                isMobile
                  ? { top: 20, right: 10, left: 5, bottom: 20 }
                  : { top: 20, right: 30, left: 30, bottom: 20 }
              }
            >
              <CartesianGrid horizontal={false} stroke="#333" />
              <YAxis
                dataKey="stream"
                type="category"
                tickLine={false}
                axisLine={false}
                className="text-[0.55rem] md:text-[0.7rem]"
                width={55}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={true}
                className="text-[0.55rem] md:text-[0.7rem]"
                domain={[0, 12]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                label={{
                  value: "GPA Cutoffs",
                  position: "outsideBottom",
                  dy: 20,
                  style: { fill: "#737373", textAnchor: "middle" },
                }}
              />
              {shouldShowUserLine && (
                <ReferenceLine x={userGPA} stroke="white" strokeDasharray="4 4">
                  <Label
                    position="top"
                    fill="white"
                    fontSize={14}
                    dy={-10}
                    onClick={() => navigate("/me")}
                    className="cursor-pointer hover:fill-[#CC7400] transition-all underline"
                  >
                    You ✎
                  </Label>
                </ReferenceLine>
              )}
              <ChartTooltip
                cursor={false}
                content={
                  access.showReportedCutoffs ? (
                    <CustomTooltipBoth />
                  ) : (
                    <CustomTooltipEstimated />
                  )
                }
              />
              <Bar
                dataKey="GPA"
                radius={[0, 4, 4, 0]}
                isAnimationActive
                fill="#f4ab33"
                fillOpacity={1}
                name="Estimated"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`g-${index}`} fill={getBarFill(entry.stream)} />
                ))}
              </Bar>
              {access.showReportedCutoffs && (
                <Bar
                  dataKey="reportCutoff"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive
                  fill="#22c55e"
                  fillOpacity={1}
                  name="Reported"
                  stroke="none"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
