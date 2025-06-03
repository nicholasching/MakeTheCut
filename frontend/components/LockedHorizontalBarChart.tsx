"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis, Label, ResponsiveContainer, Cell, Tooltip as ChartTooltip } from "recharts";
import { CardDescription } from "@/components/ui/card";
import GradientPulse from "./GradientPulse";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

let userGPA = 4;

// Hardcoded chart data
const chartData = [
  { stream: "Chemical", GPA: 7.49, people: 24 },
  { stream: "Civil", GPA: 4, people: 29 },
  { stream: "Computer", GPA: 10.26, people: 34 },
  { stream: "Electrical", GPA: 8.29, people: 51 },
  { stream: "Engineering Physics", GPA: 4, people: 13 },
  { stream: "Materials", GPA: 4, people: 9 },
  { stream: "Mechanical", GPA: 8.32, people: 54 },
  { stream: "Mechatronics", GPA: 7, people: 27 },
  { stream: "Software", GPA: 9.97, people: 40 },
];

// Create a custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-800 p-2 rounded border border-neutral-700 text-sm">
        <p className="mb-1"><strong>{payload[0].payload.stream}</strong></p>
        <p className="text-[#f4ab33]">GPA Cutoff: {payload[0].value.toFixed(2)}</p>
        <p className="text-white">People Entering Stream: {payload[0].payload.people}</p>
      </div>
    );
  }
  return null;
};

const chartConfig = {
  GPA: {
    label: "GPA Cutoff",
    color: "#ffffff",
  },
} satisfies ChartConfig;

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

export default function HorizontalBarChart() {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const barColors = ["#CC7400", "#E07F00", "#F58B00", "#FF950A", "#FF9E1F", "#FFA833", "#FFB147", "#FFB95C", "#FFC170"];

  // Function to get bar color based on stream name
  const getBarFill = (stream: string) => {
    const index = chartData.findIndex(item => item.stream === stream);
    return barColors[index % barColors.length];
  };

  return (
    <Card className="bg-neutral-900 text-white w-full md:w-2/3 mx-auto border-none p-1 pt-10 pb-7 lg:pb-5">
      <CardHeader className="text-neutral-500">
        <div className="flex flex-col justify-center items-center">
          <CardTitle className="text-subtitle flex items-center gap-3 mb-1">
            Estimated Stream Cutoffs 2025
          </CardTitle>
          <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse">
            <p>Contributions: {chartData.reduce((acc, item) => acc + item.people, 0)}</p>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-[500px] md:h-[600px] pr-3 pl-3 md:pl-7">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={isMobile ?
                { top: 30, right: 20, left: 5, bottom: 20 } :
                { top: 30, right: 30, left: 30, bottom: 20 }
              }
            >
              <CartesianGrid horizontal={false} stroke="#333" />
              <YAxis dataKey="stream" type="category" tickLine={false} axisLine={false} className="text-[0.55rem] md:text-[0.7rem]" />
              <XAxis type="number" tickLine={false} axisLine={true} domain={[0, 12]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} label={{ value: 'GPA Cutoffs', position: "outsideBottom", dy: 20, style: { fill: '#737373', textAnchor: 'middle' } }} />
              {/* <ReferenceLine x={userGPA} stroke="white" strokeDasharray="4 4">
                <Label position="top" fill="white" fontSize={14} dy={-10} onClick={() => router.push('/grades')} className="cursor-pointer hover:fill-[#CC7400] transition-all underline">
                  You ✎
                </Label>
              </ReferenceLine> */}
              <ChartTooltip
                cursor={false}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="GPA"
                radius={[0, 4, 4, 0]}
                isAnimationActive={true}
                fill="#f4ab33"
                fillOpacity={1}
                name="GPA"
                stroke="none"
                onClick={undefined}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarFill(entry.stream)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}