"use client";

import { useState, useEffect, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as ChartTooltip } from "recharts";
import { database } from "../app/appwrite";
import {
  ADMISSION,
  DATABASE_ID,
  COLL_CUTOFFS,
  queriesForCutoffYear,
  streamKeyFromCutoffDocId,
  liveAcademicYearLabel,
  academicYearFullLabel,
} from "@/lib/appwriteDb";
import { getCohortAccess } from "@/lib/scheduleConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const initialChartData = [
  { stream: "Chemical", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Civil", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Computer", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Electrical", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Engineering Physics", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Materials", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Mechanical", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Mechatronics", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Software", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
];

const chartConfig = {
  firstChoice: { label: "First Choice", color: "#7C3AED" },
  secondChoice: { label: "Second Choice", color: "#A78BFA" },
  thirdChoice: { label: "Third Choice", color: "#DDD6FE" },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: (typeof initialChartData)[0]; dataKey: string; color: string; value: number }[] }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-neutral-800 p-2 rounded border border-neutral-700 text-sm">
        <p className="mb-1">
          <strong>{payload[0].payload.stream}</strong>
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {chartConfig[entry.dataKey as keyof typeof chartConfig].label}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

async function fetchStreamChoiceData(year: number) {
  try {
    const documents = await database.listDocuments(DATABASE_ID, COLL_CUTOFFS, queriesForCutoffYear(year));
    const updatedChartData = [...initialChartData];
    let totalSubmissions = 0;

    documents.documents.forEach((doc) => {
      let streamIndex = -1;
      const key = streamKeyFromCutoffDocId(doc.$id);
      if (key === "total") {
        totalSubmissions = doc.streamCount || 0;
        return;
      }
      switch (key) {
        case "chem":
          streamIndex = 0;
          break;
        case "civ":
          streamIndex = 1;
          break;
        case "comp":
          streamIndex = 2;
          break;
        case "elec":
          streamIndex = 3;
          break;
        case "engphys":
          streamIndex = 4;
          break;
        case "mat":
          streamIndex = 5;
          break;
        case "mech":
          streamIndex = 6;
          break;
        case "tron":
          streamIndex = 7;
          break;
        case "soft":
          streamIndex = 8;
          break;
      }
      if (streamIndex !== -1) {
        updatedChartData[streamIndex] = {
          ...updatedChartData[streamIndex],
          firstChoice: doc.firstChoice || 0,
          secondChoice: doc.secondChoice || 0,
          thirdChoice: doc.thirdChoice || 0,
        };
      }
    });

    return { chartData: updatedChartData, totalSubmissions };
  } catch (error) {
    console.error("Error fetching stream choice data:", error);
    return { chartData: initialChartData, totalSubmissions: 0 };
  }
}

export default function StreamChoiceGraph({
  year = ADMISSION.current,
  onTransitionReadyChange,
}: {
  year?: number;
  onTransitionReadyChange?: (ready: boolean) => void;
}) {
  const access = useMemo(() => getCohortAccess(year), [year]);
  const [chartData, setChartData] = useState(initialChartData);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);
  const [yAxisWidth, setYAxisWidth] = useState(55);
  const [isMobile, setIsMobile] = useState(false);

  const title =
    year === ADMISSION.current
      ? `${liveAcademicYearLabel()} Stream Choice Distribution`
      : `${academicYearFullLabel(year)} Stream Choice Distribution`;

  const hideLive = year === ADMISSION.current && !access.streamChoiceVisible;
  const transitionReady = hideLive || !isLoading;

  useEffect(() => {
    const updateLayout = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setYAxisWidth(mobile ? 55 : 70);
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    const initPage = async () => {
      if (hideLive) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const data = await fetchStreamChoiceData(year);
      setChartData(data.chartData);
      setTotalSubmissions(data.totalSubmissions);
      setKey((prev) => prev + 1);
      setIsLoading(false);
    };
    initPage();
  }, [year, hideLive]);

  useEffect(() => {
    onTransitionReadyChange?.(transitionReady);
  }, [onTransitionReadyChange, transitionReady]);

  if (hideLive) {
    return null;
  }

  const isLive = year === ADMISSION.current;
  const cardClass = isLive
    ? "bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-2xl text-white w-full gap-0 pt-6 pb-4 overflow-hidden"
    : "bg-neutral-900/40 backdrop-blur-sm text-white w-full border border-neutral-600/30 rounded-2xl p-1 pt-6 pb-4 overflow-hidden";
  const contentClass = isLive ? "h-[500px] md:h-[600px]" : "h-[500px] md:h-[600px] px-2";

  if (isLoading) {
    return (
      <Card className={`${cardClass} relative`}>
        <CardHeader className="text-neutral-500 pb-2">
          <div className="flex flex-col justify-center items-center">
            <CardTitle className="text-subtitle flex items-center gap-3 mb-1">{title}</CardTitle>
            <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse">
              <p>Loading choice distribution data...</p>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className={`${contentClass} flex items-center justify-center`}>
          <div className="text-neutral-400">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClass}>
      <CardHeader className="text-neutral-500">
        <div className="flex flex-col justify-center items-center">
          <CardTitle className="text-subtitle flex items-center gap-3 mb-1">{title}</CardTitle>
          <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse">
            <p>Total Contributions: {totalSubmissions}</p>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className={contentClass}>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              key={key}
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={
                isMobile
                  ? { top: 20, right: 10, left: 5, bottom: 20 }
                  : { top: 20, right: 30, left: 30, bottom: 20 }
              }
              barCategoryGap="20%"
            >
              <CartesianGrid horizontal={false} stroke="#333" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={true}
                className="text-[0.55rem] md:text-[0.7rem]"
                stroke="#737373"
                label={{
                  value: "Number of Students",
                  position: "insideBottom",
                  dy: 10,
                  style: { fill: "#737373", textAnchor: "middle" },
                }}
              />
              <YAxis
                dataKey="stream"
                type="category"
                tickLine={false}
                axisLine={false}
                className="text-[0.55rem] md:text-[0.7rem]"
                stroke="#737373"
                width={yAxisWidth}
              />
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <Bar
                dataKey="firstChoice"
                radius={[0, 4, 4, 0]}
                isAnimationActive
                fill={chartConfig.firstChoice.color}
                name={chartConfig.firstChoice.label}
                stroke="none"
              />
              <Bar
                dataKey="secondChoice"
                radius={[0, 4, 4, 0]}
                isAnimationActive
                fill={chartConfig.secondChoice.color}
                name={chartConfig.secondChoice.label}
                stroke="none"
              />
              <Bar
                dataKey="thirdChoice"
                radius={[0, 4, 4, 0]}
                isAnimationActive
                fill={chartConfig.thirdChoice.color}
                name={chartConfig.thirdChoice.label}
                stroke="none"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
