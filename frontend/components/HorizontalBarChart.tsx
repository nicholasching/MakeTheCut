"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const chartData = [
  { stream: "You", desktop: 8 },
  { stream: "Chemical", desktop: 5 },
  { stream: "Chemical and Biology", desktop: 2 },
  { stream: "Civil", desktop: 11 },
  { stream: "Computer", desktop: 3 },
  { stream: "Electrical", desktop: 5 },
  { stream: "Engineering Physics", desktop: 6 },
  { stream: "Materials", desktop: 7 },
  { stream: "Mechanical", desktop: 8 },
  { stream: "Mechatronics", desktop: 9 },
  { stream: "Software", desktop: 2 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#f4ab33",
  },
} satisfies ChartConfig

export default function HorizontalBarChart() {
  // Get the "You" value to use for the reference line
  const yourValue = chartData.find(item => item.stream === "You")?.desktop || 0;
  
  return (
    <Card className="bg-neutral-900 text-white w-2/3 mx-auto border-none">
      <CardHeader>
        <CardTitle>Estimated Stream Cutoffs</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} layout="vertical">
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="stream"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={80}
            />
            <XAxis type="number" tickLine={false} axisLine={true} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine x={yourValue} stroke="blue" strokeDasharray="4 4" />
            <Bar
              dataKey="desktop"
              fill="var(--color-desktop)"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this stream <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 streams
        </div>
      </CardFooter>
    </Card>
  )
}