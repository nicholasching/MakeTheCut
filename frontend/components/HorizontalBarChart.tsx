"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis, Label } from "recharts"
import { account, database, ID } from "../app/appwrite"

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

let averages = {chem: 4, civil: 4, computer: 4, electrical: 4, engphys: 4, materials: 4, mechanical: 4, mechatronics: 4, software: 4};

let documents = await database.listDocuments('MacStats', 'StatData');

// Access documents by their $id
documents.documents.forEach(doc => {
  if (doc.$id === 'chem') averages.chem = parseFloat(doc.streamCutoff);
  if (doc.$id === 'civ') averages.civil = parseFloat(doc.streamCutoff);
  if (doc.$id === 'comp') averages.computer = parseFloat(doc.streamCutoff);
  if (doc.$id === 'elec') averages.electrical = parseFloat(doc.streamCutoff);
  if (doc.$id === 'engphys') averages.engphys = parseFloat(doc.streamCutoff);
  if (doc.$id === 'mat') averages.materials = parseFloat(doc.streamCutoff);
  if (doc.$id === 'mech') averages.mechanical = parseFloat(doc.streamCutoff);
  if (doc.$id === 'tron') averages.mechatronics = parseFloat(doc.streamCutoff);
  if (doc.$id === 'soft') averages.software = parseFloat(doc.streamCutoff);
});

const chartData = [
  { stream: "Chemical", GPA: averages.chem },
  { stream: "Civil", GPA: averages.civil},
  { stream: "Computer", GPA: averages.computer },
  { stream: "Electrical", GPA: averages.electrical },
  { stream: "Engineering Physics", GPA: averages.engphys },
  { stream: "Materials", GPA: averages.materials },
  { stream: "Mechanical", GPA: averages.mechanical },
  { stream: "Mechatronics", GPA: averages.mechatronics },
  { stream: "Software", GPA: averages.software },
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