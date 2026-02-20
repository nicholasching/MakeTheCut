"use client"

import { ChevronDown, Check } from "lucide-react"
import { Bar, BarChart, ReferenceLine, Label, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as ChartTooltip } from "recharts"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import { database } from "../app/appwrite";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils"

// S-curve easing: easeInOutCubic
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * Math.pow(t, 3) : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const COURSES = [
  { value: "math1za3", label: "Calc 1 / 1ZA3" },
  { value: "math1zb3", label: "Calc 2 / 1ZB3" },
  { value: "math1zc3", label: "Linear Algebra / 1ZC3" },
  { value: "phys1d03", label: "Physics / 1D03" },
  { value: "phys1e03", label: "Physics / 1E03" },
  { value: "chem1e03", label: "Chemistry / 1E03" },
  { value: "eng1p13", label: "Engineer / 1P13" },
] as const

// Initial structure for chart data (numeric grade for smooth ReferenceLine positioning)
const initialChartData = [
  { grade: 1, count: 0 },
  { grade: 2, count: 0 },
  { grade: 3, count: 0 },
  { grade: 4, count: 0 },
  { grade: 5, count: 0 },
  { grade: 6, count: 0 },
  { grade: 7, count: 0 },
  { grade: 8, count: 0 },
  { grade: 9, count: 0 },
  { grade: 10, count: 0 },
  { grade: 11, count: 0 },
  { grade: 12, count: 0 },
]

async function fetchDistribution(course: string) {
  try {
    // Fetch course averages from the database
    let document = await database.getDocument('MacStats', 'MarkData24', course);

    console.log(`Course data for ${course} fetched successfully!`);

    let grades = document.distribution.split(",").map(Number);
    grades.push(Number(document.average))

    // Parse and return the distribution array
    return grades;
  }
  catch (error) {
    console.error(`Error fetching course data for ${course}:`, error);
    return null;
  }
} 

const chartConfig = {
  count: {
    label: "Count",
    color: "#1B79C5", // Changed from #f4ab33 to red
  },
} satisfies ChartConfig

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-800 p-2 rounded border border-neutral-700 text-sm">
        <p className="mb-1"><strong>{label}</strong></p>
        <p style={{ color: chartConfig.count.color }}>
          {chartConfig.count.label}: {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

// Spinning Loader Component 
const SpinningLoader = () => {
  return (
    <div className="flex justify-center items-center">
      <svg className="animate-spin" width="250" height="250" viewBox="0 0 250 250">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <g filter="url(#glow)">
          {[...Array(6)].map((_, i) => {
            const angle = (i * 60) * Math.PI / 180;
            const cx = 125 + 85 * Math.cos(angle);
            const cy = 125 + 85 * Math.sin(angle);
            const opacity = 0.2 + (0.8 * (1 - (i % 6) / 6));
            return (
              <circle 
                key={i} 
                cx={cx} 
                cy={cy} 
                r={18} 
                fill={`rgba(255, 255, 255, ${opacity})`} 
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default function GradeDistributionChart() {
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const [chartData, setChartData] = useState(initialChartData);
  const [courseAvg, setCourseAvg] = useState(0);
  const [animatedCourseAvg, setAnimatedCourseAvg] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("math1za3");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const initPage = async () => {
      setIsLoading(true);
      
      // Fetch contribution count
      try {
        const contributions = await database.getDocument('MacStats', 'StatData24', 'total');
        setTotalContributions(contributions.streamCount);
      } catch (error) {
        console.error("Error fetching contribution count:", error);
      }

      // Fetch initial course data (math1za3)
      const distribution = await fetchDistribution("math1za3");
      distribution !== null && setCourseAvg(distribution.pop() || 0); // Get the average from the distribution array
      
      if (distribution) {
        // Update chart data with fetched distribution
        const updatedData = initialChartData.map((item, index) => ({
          ...item,
          count: distribution[index] ?? 0,
        }));
        
        setChartData(updatedData);
      } else {
        console.error("Error fetching distribution data");
        setChartData(initialChartData);
      }

      setIsLoading(false);
    };
    
    initPage();
  }, []);

  const handleCourseChange = async (value: string) => {
    setPopoverOpen(false);
    setIsLoading(true);
    setSelectedCourse(value);
    
    const distribution = await fetchDistribution(value);
    distribution !== null && setCourseAvg(distribution.pop() || 0); // Get the average from the distribution array
    
    if (distribution) {
      // Update chart data with new distribution
      const updatedData = initialChartData.map((item, index) => ({
        ...item,
        count: distribution[index] ?? 0,
      }));
      
      setChartData(updatedData);
    } else {
      console.error(`Error fetching distribution data for ${value}`);
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

  // Show loading animation when data is loading
  if (isLoading) {
    return (
      <Card className="bg-neutral-900/40 backdrop-blur-sm text-white w-full border border-neutral-600/30 rounded-2xl p-1 pt-6 pb-4 relative overflow-hidden">
        <CardHeader className="text-neutral-500">
          <CardTitle className="text-subtitle">Loading Course Data...</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px] md:h-[600px] flex items-center justify-center">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <SpinningLoader />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900/40 backdrop-blur-sm text-white w-full border border-neutral-600/30 rounded-2xl gap-0 pt-6 pb-4 overflow-hidden">
      <CardHeader className="text-neutral-500">
        <div className="flex flex-col justify-center items-center">
          <CardTitle className="text-subtitle flex items-center gap-3 mb-1">
            2024/2025 Course Grade Distributions
          </CardTitle>
          <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse mb-4">
            <p>Total Contributions: {totalContributions}</p>
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
                    {COURSES.find((c) => c.value === selectedCourse)?.label ?? "Select course"}
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
                    {COURSES.map((course) => (
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
      <CardContent className="h-[500px] md:h-[600px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
                accessibilityLayer
                data={chartData}
                margin={{
                    top: 30, right: 10, left: -15, bottom: 20, // Reduced left from 30 to 10
                }}
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
                    label={{value: 'Grade', position: "outsideBottom", dy: 20, style: { fill: '#737373', textAnchor: 'middle' }}}
                />
                <ReferenceLine
                  x={courseAvg > 0 ? Math.max(0.5, animatedCourseAvg) : 1}
                  stroke="white"
                  strokeDasharray="4 4"
                >
                  <Label position="top" fill="white" fontSize={14} dy={-5} className="cursor-pointer text-[0.55rem] md:text-[0.7rem] text-color-neutral-500">
                    {"Mean: "+ animatedCourseAvg.toFixed(2)}
                  </Label>
                </ReferenceLine>
                <YAxis
                    type="number"
                    tickLine={false}
                    axisLine={true}
                    className="text-[0.55rem] md:text-[0.7rem]"
                    stroke="#737373"
                    label={{
                        value: 'Number of Students', 
                        angle: -90, 
                        position: "insideMiddle", 
                        dx: -5,
                        style: { fill: '#737373', textAnchor: 'middle' }
                    }}
                />
                <ChartTooltip
                    cursor={false}
                    content={<CustomTooltip />}
                />
                <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
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
  )
}