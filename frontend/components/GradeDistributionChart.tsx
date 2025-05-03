"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as ChartTooltip } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "1", desktop: 186 },
  { month: "2", desktop: 305 },
  { month: "3", desktop: 237 },
  { month: "4", desktop: 73 },
  { month: "5", desktop: 209 },
  { month: "6", desktop: 214 },
  { month: "7", desktop: 214 },
  { month: "8", desktop: 214 },
  { month: "9", desktop: 214 },
  { month: "10", desktop: 214 },
  { month: "11", desktop: 214 },
  { month: "12", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#f4ab33",
  },
} satisfies ChartConfig

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-800 p-2 rounded border border-neutral-700 text-sm">
        <p className="mb-1"><strong>{label}</strong></p>
        <p style={{ color: chartConfig.desktop.color }}>
          {chartConfig.desktop.label}: {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export default function GradeDistributionChart() {
  return (
    <Card className="bg-neutral-900 text-white w-full md:w-2/3 mx-auto border-none p-1 pt-10 pb-7 lg:pb-5">
      <CardHeader className="text-neutral-500">
      <div className="flex flex-col justify-center items-center">
          <CardTitle className="text-subtitle flex items-center gap-3 mb-1">
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 rounded-full bg-red-500"></div>
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
            </div>
            Live Estimated Stream Cutoffs
          </CardTitle>
          <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse">
            {/* <p>Current Contributions: {totalContributions}</p> */}
          </CardDescription>
        </div>
        <Tabs defaultValue="account" className="w-full text-center flex-row justify-center mt-5">
            <TabsList className="bg-transparent text-neutral-500 flex flex-wrap gap-1 sm:gap-2 md:gap-3 lg:gap-4">
                <TabsTrigger 
                    className="text-neutral-500 text-teenytiny hover:bg-neutral-700 data-[state=active]:bg-neutral-800 transition-all" 
                    value="math1za3"
                >
                    Calc 1 / 1ZA3
                </TabsTrigger>
                <TabsTrigger 
                    className="text-neutral-500 text-teenytiny hover:bg-neutral-700 data-[state=active]:bg-neutral-800 transition-all" 
                    value="math1zb3"
                >
                    Calc 2 / 1ZB3
                </TabsTrigger>
                <TabsTrigger 
                    className="text-neutral-500 text-teenytiny hover:bg-neutral-700 data-[state=active]:bg-neutral-800 transition-all" 
                    value="math1zc3"
                >
                    Linear Algebra / 1ZC3
                </TabsTrigger>
                <TabsTrigger 
                    className="text-neutral-500 text-teenytiny hover:bg-neutral-700 data-[state=active]:bg-neutral-800 transition-all" 
                    value="phys1d03"
                >
                    Physics / 1D03
                </TabsTrigger>
                <TabsTrigger 
                    className="text-neutral-500 text-teenytiny hover:bg-neutral-700 data-[state=active]:bg-neutral-800 transition-all" 
                    value="phys1e03"
                >
                    Physics / 1E03
                </TabsTrigger>
                <TabsTrigger 
                    className="text-neutral-500 text-teenytiny hover:bg-neutral-700 data-[state=active]:bg-neutral-800 transition-all" 
                    value="chem1d03"
                >
                    Chemistry / 1D03
                </TabsTrigger>
                <TabsTrigger 
                    className="text-neutral-500 text-teenytiny hover:bg-neutral-700 data-[state=active]:bg-neutral-800 transition-all" 
                    value="eng1p13"
                >
                    Engineer / 1P13
                </TabsTrigger>
            </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="h-[500px] md:h-[600px] pr-3 pl-3 md:pl-7">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
                accessibilityLayer
                data={chartData}
                margin={{
                    top: 30, right: 30, left: 30, bottom: 20,
                }}
            >
                <CartesianGrid vertical={false} stroke="#333" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => value.slice(0, 3)}
                    className="text-[0.55rem] md:text-[0.7rem]"
                    stroke="#737373"
                    label={{value: 'Grade', position: "outsideBottom", dy: 20, style: { fill: '#737373', textAnchor: 'middle' }}}
                />
                <YAxis
                    type="number"
                    tickLine={false}
                    axisLine={true}
                    className="text-[0.55rem] md:text-[0.7rem]"
                    stroke="#737373"
                    label={{
                        value: '# of classmates', 
                        angle: -90, 
                        position: "insideLeft", 
                        dx: -10,
                        style: { fill: '#737373', textAnchor: 'middle' }
                    }}
                />
                <ChartTooltip
                    cursor={false}
                    content={<CustomTooltip />}
                />
                <Bar
                    dataKey="desktop"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    fillOpacity={1}
                    name={chartConfig.desktop.label}
                    stroke="none"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartConfig.desktop.color} />
                    ))}
                </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}