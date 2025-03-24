"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

// Removed mobile data from chart data
const chartData = [
  { month: "Chemical", desktop: 8 },
  { month: "Civil", desktop: 11 },
  { month: "Computer", desktop: 3 },
  { month: "Electrical", desktop: 5 },
  { month: "Engineering Physics", desktop: 6 },
  { month: "Materials", desktop: 7 },
  { month: "Mechanical", desktop: 8 },
  { month: "Mechatronics", desktop: 9 },
  { month: "Software", desktop: 2 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#f4ab33",
  },
} satisfies ChartConfig

export default function HorizontalBarChart() {
  return (
    <Card className="bg-neutral-900 text-white w-2/3 mx-auto border-none">
      <CardHeader>
        <CardTitle>Chart</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} layout="vertical">
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={80}
            />
            <XAxis type="number" tickLine={false} axisLine={true} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="desktop"
              fill="var(--color-desktop)"
              radius={[0, 4, 4, 0]} // Rounded corners on the right side
              isAnimationActive={false}
            />
            {/* Removed the mobile Bar component entirely */}
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}