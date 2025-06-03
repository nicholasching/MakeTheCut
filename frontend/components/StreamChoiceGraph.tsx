"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as ChartTooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Hardcoded chart data for streams
const chartData = [
  { stream: "Chemical", firstChoice: 10, secondChoice: 8, thirdChoice: 6 },
  { stream: "Civil", firstChoice: 12, secondChoice: 9, thirdChoice: 8 },
  { stream: "Computer", firstChoice: 20, secondChoice: 15, thirdChoice: 10 },
  { stream: "Electrical", firstChoice: 18, secondChoice: 14, thirdChoice: 10 },
  { stream: "Engineering Physics", firstChoice: 5, secondChoice: 4, thirdChoice: 3 },
  { stream: "Materials", firstChoice: 6, secondChoice: 5, thirdChoice: 4 },
  { stream: "Mechanical", firstChoice: 22, secondChoice: 18, thirdChoice: 14 },
  { stream: "Mechatronics", firstChoice: 15, secondChoice: 12, thirdChoice: 10 },
  { stream: "Software", firstChoice: 25, secondChoice: 20, thirdChoice: 15 },
];

const chartConfig = {
    firstChoice: {
        label: "First Choice",
        color: "#7C3AED", // Deep purple
    },
    secondChoice: {
        label: "Second Choice",
        color: "#A78BFA", // Medium purple
    },
    thirdChoice: {
        label: "Third Choice",
        color: "#DDD6FE", // Light purple
    },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-800 p-2 rounded border border-neutral-700 text-sm">
        <p className="mb-1"><strong>{payload[0].payload.stream}</strong></p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {chartConfig[entry.dataKey as keyof typeof chartConfig].label}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StreamChoiceGraph() {
  return (
    <Card className="bg-neutral-900 text-white w-full md:w-2/3 mx-auto border-none p-1 pt-10 pb-7 lg:pb-5">
      <CardHeader className="text-neutral-500">
        <div className="flex flex-col justify-center items-center">
          <CardTitle className="text-subtitle flex items-center gap-3 mb-1">
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 rounded-full bg-blue-500"></div>
              <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
            </div>
            Stream Choice Distribution
          </CardTitle>
          <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse">
            <p>Distribution of First, Second, and Third Choices</p>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-[500px] md:h-[600px] pr-3 pl-3 md:pl-7">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="horizontal" // Changed to horizontal for vertical bars
              margin={{
                top: 30, right: 30, left: 30, bottom: 20,
              }}
            >
              <CartesianGrid vertical={false} stroke="#333" />
              <XAxis
                dataKey="stream"
                type="category"
                tickLine={false}
                axisLine={false}
                className="text-[0.55rem] md:text-[0.7rem]"
                stroke="#737373"
                label={{
                  value: "Streams",
                  position: "outsideBottom",
                  dy: 20,
                  style: { fill: "#737373", textAnchor: "middle" },
                }}
              />
              <YAxis
                type="number"
                tickLine={false}
                axisLine={true}
                className="text-[0.55rem] md:text-[0.7rem]"
                stroke="#737373"
                label={{
                  value: "Number of Students",
                  position: "insideLeft",
                  angle: -90,
                  dx: -10,
                  style: { fill: "#737373", textAnchor: "middle" },
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="firstChoice"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                fill={chartConfig.firstChoice.color}
                name={chartConfig.firstChoice.label}
                stroke="none"
              />
              <Bar
                dataKey="secondChoice"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                fill={chartConfig.secondChoice.color}
                name={chartConfig.secondChoice.label}
                stroke="none"
              />
              <Bar
                dataKey="thirdChoice"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
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