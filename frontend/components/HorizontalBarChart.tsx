"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis, Label } from "recharts"

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

const yourValue = 8;

const chartData = [
  { stream: "Chemical", GPA: 5 },
  { stream: "Chemical Bioengineering", GPA: 2 },
  { stream: "Civil", GPA: 11 },
  { stream: "Computer", GPA: 3 },
  { stream: "Electrical", GPA: 5 },
  { stream: "Engineering Physics", GPA: 6 },
  { stream: "Materials", GPA: 7 },
  { stream: "Mechanical", GPA: 8 },
  { stream: "Mechatronics", GPA: 9 },
  { stream: "Software", GPA: 2 },
]

const chartConfig = {
  GPA: {
    label: "GPA Cutoff",
    color: "#f4ab33",
  },
} satisfies ChartConfig

export default function HorizontalBarChart() {
  return (
    <Card className="bg-neutral-900 text-white w-full md:w-2/3 mx-auto border-none">
      <CardHeader>
        <CardTitle>Estimated Stream Cutoffs</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
            <CartesianGrid horizontal={false} />
            <YAxis dataKey="stream" type="category" tickLine={false} tickMargin={10} axisLine={false} width={80}/>
            <XAxis type="number" tickLine={false} axisLine={true} domain={[0, 12]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} label={{value: 'GPA Cutoffs', position: "outsideBottom", dy: 20, style: { fill: '#474747', textAnchor: 'middle' }}}/>
            <ReferenceLine x={yourValue} stroke="white" strokeDasharray="4 4" ifOverflow="extendDomain" label={false}>
              <Label value="You" position="top" fill="white" fontSize={14} dy={-10} />
            </ReferenceLine>
            <Bar dataKey="GPA" fill="var(--color-GPA)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}