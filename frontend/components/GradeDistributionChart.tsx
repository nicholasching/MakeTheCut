"use client";

import { ChevronDown, Check } from "lucide-react";
import {
  Bar,
  BarChart,
  ReferenceLine,
  Label,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip as ChartTooltip,
} from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { database } from "../app/appwrite";
import {
  ADMISSION,
  DATABASE_ID,
  COLL_MARKS,
  markDocId,
  liveAcademicYearLabel,
  academicYearFullLabel,
} from "@/lib/appwriteDb";
import { getCohortAccess } from "@/lib/scheduleConfig";
import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * Math.pow(t, 3) : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const COURSES_SEM1 = [
  { value: "math1za3", label: "Calc 1 / 1ZA3" },
  { value: "math1zc3", label: "Linear Algebra / 1ZC3" },
  { value: "phys1d03", label: "Physics / 1D03" },
] as const;

const COURSES_ALL = [
  ...COURSES_SEM1,
  { value: "math1zb3", label: "Calc 2 / 1ZB3" },
  { value: "phys1e03", label: "Physics / 1E03" },
  { value: "chem1e03", label: "Chemistry / 1E03" },
  { value: "eng1p13", label: "Engineer / 1P13" },
] as const;

type CourseValue = (typeof COURSES_ALL)[number]["value"];

function coursesForYear(year: number, access: ReturnType<typeof getCohortAccess>) {
  if (!access.hasGradeData) return [];
  if (year < ADMISSION.current || access.hasFullGradeData) {
    return [...COURSES_ALL];
  }
  return [...COURSES_SEM1];
}

const initialChartData = Array.from({ length: 12 }, (_, i) => ({
  grade: i + 1,
  count: 0,
}));

async function fetchDistribution(year: number, course: string) {
  try {
    const document = await database.getDocument(
      DATABASE_ID,
      COLL_MARKS,
      markDocId(year, course)
    );
    const grades = document.distribution.split(",").map(Number);
    grades.push(Number(document.average));
    return grades;
  } catch (error) {
    console.error(`Error fetching course data for ${course}:`, error);
    return null;
  }
}

const chartConfig = {
  count: { label: "Count", color: "#1B79C5" },
} satisfies ChartConfig;

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-neutral-800 p-2 rounded border border-neutral-700 text-sm">
        <p className="mb-1">
          <strong>{label}</strong>
        </p>
        <p style={{ color: chartConfig.count.color }}>
          {chartConfig.count.label}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const SpinningLoader = () => (
  <div className="flex justify-center items-center">
    <svg className="animate-spin" width="250" height="250" viewBox="0 0 250 250">
      <defs>
        <filter id="glow-gdc" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g filter="url(#glow-gdc)">
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

export default function GradeDistributionChart({
  year = ADMISSION.current,
}: {
  year?: number;
}) {
  const access = useMemo(() => getCohortAccess(year), [year]);
  const courses = useMemo(() => coursesForYear(year, access), [year, access]);
  const noData = !access.hasGradeData || courses.length === 0;

  const [totalContributions, setTotalContributions] = useState(0);
  const [chartData, setChartData] = useState(initialChartData);
  const [courseAvg, setCourseAvg] = useState(0);
  const [animatedCourseAvg, setAnimatedCourseAvg] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseValue>("math1za3");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const rafRef = useRef<number | null>(null);

  const title =
    year === ADMISSION.current
      ? `${liveAcademicYearLabel()} Course Distributions`
      : `${academicYearFullLabel(year)} Course Distributions`;

  useEffect(() => {
    if (noData) {
      setIsLoading(false);
      return;
    }
    const first = courses[0]?.value ?? "math1za3";
    if (!courses.some((c) => c.value === selectedCourse)) {
      setSelectedCourse(first as CourseValue);
    }
  }, [noData, courses, selectedCourse]);

  useEffect(() => {
    if (noData) return;
    const initPage = async () => {
      setIsLoading(true);
      const course = courses.some((c) => c.value === selectedCourse)
        ? selectedCourse
        : (courses[0].value as CourseValue);
      const distribution = await fetchDistribution(year, course);
      if (distribution !== null) {
        setCourseAvg(distribution.pop() || 0);
        const sum = distribution.reduce((acc: number, val: number) => acc + val, 0);
        setTotalContributions(sum);
        setChartData(
          initialChartData.map((item, index) => ({
            ...item,
            count: distribution[index] ?? 0,
          }))
        );
      } else {
        setChartData(initialChartData);
      }
      setIsLoading(false);
    };
    initPage();
  }, [year, noData, courses, selectedCourse]);

  const handleCourseChange = async (value: string) => {
    if (noData) return;
    setPopoverOpen(false);
    setIsLoading(true);
    setSelectedCourse(value as CourseValue);
    const distribution = await fetchDistribution(year, value);
    if (distribution !== null) {
      setCourseAvg(distribution.pop() || 0);
      const sum = distribution.reduce((acc: number, val: number) => acc + val, 0);
      setTotalContributions(sum);
      setChartData(
        initialChartData.map((item, index) => ({
          ...item,
          count: distribution[index] ?? 0,
        }))
      );
    } else {
      setChartData(initialChartData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const target = courseAvg;
    const duration = 800;
    setAnimatedCourseAvg(0);
    const animate = (startTime: number) => {
      const run = (now: number) => {
        const elapsed = now - startTime;
        if (elapsed >= duration) {
          setAnimatedCourseAvg(target);
          rafRef.current = null;
          return;
        }
        const t = easeInOutCubic(elapsed / duration);
        setAnimatedCourseAvg(target * t);
        rafRef.current = requestAnimationFrame(run);
      };
      rafRef.current = requestAnimationFrame(run);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [courseAvg]);

  if (noData) {
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
        <CardHeader className="text-neutral-500">
          <CardTitle className="text-subtitle">Loading Course Data...</CardTitle>
        </CardHeader>
        <CardContent className={`${contentClass} flex items-center justify-center`}>
          <SpinningLoader />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClass}>
      <CardHeader className="text-neutral-500">
        <div className="flex flex-col justify-center items-center">
          <CardTitle className="text-subtitle flex items-center gap-3 mb-1">{title}</CardTitle>
          <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse mb-4">
            <p>Current Contributions: {totalContributions}</p>
          </CardDescription>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "min-h-[35px] w-full max-w-[280px] bg-neutral-800 border-neutral-600 text-white hover:bg-neutral-700 hover:text-white rounded-md mb-2",
                  "text-sm font-medium"
                )}
              >
                <div className="flex items-center w-full justify-between">
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="flex-1 text-center">
                    {courses.find((c) => c.value === selectedCourse)?.label ?? "Select course"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0 border-neutral-700 bg-neutral-900"
              align="center"
            >
              <Command>
                <CommandList>
                  <CommandGroup>
                    {courses.map((course) => (
                      <CommandItem
                        key={course.value}
                        value={course.value}
                        onSelect={() => handleCourseChange(course.value)}
                        className="text-sm cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCourse === course.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {course.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className={contentClass}>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 30, right: 10, left: -15, bottom: 20 }}
            >
              <CartesianGrid vertical={false} stroke="#333" />
              <XAxis
                dataKey="grade"
                type="number"
                domain={[0.5, 12.5]}
                ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => String(value)}
                className="text-[0.55rem] md:text-[0.7rem]"
                stroke="#737373"
                label={{
                  value: "Grade",
                  position: "outsideBottom",
                  dy: 20,
                  style: { fill: "#737373", textAnchor: "middle" },
                }}
              />
              <ReferenceLine
                x={courseAvg > 0 ? Math.max(0.5, animatedCourseAvg) : 1}
                stroke="white"
                strokeDasharray="4 4"
              >
                <Label
                  position="top"
                  fill="white"
                  fontSize={14}
                  dy={-5}
                  className="cursor-pointer text-[0.55rem] md:text-[0.7rem]"
                >
                  {"Mean: " + animatedCourseAvg.toFixed(2)}
                </Label>
              </ReferenceLine>
              <YAxis
                type="number"
                tickLine={false}
                axisLine={true}
                className="text-[0.55rem] md:text-[0.7rem]"
                stroke="#737373"
                label={{
                  value: "Number of Students",
                  angle: -90,
                  position: "insideMiddle",
                  dx: -5,
                  style: { fill: "#737373", textAnchor: "middle" },
                }}
              />
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                isAnimationActive
                fillOpacity={1}
                name={chartConfig.count.label}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartConfig.count.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
