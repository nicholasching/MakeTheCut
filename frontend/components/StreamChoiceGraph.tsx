"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as ChartTooltip } from "recharts";
import { database } from "../app/appwrite";
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

// Initial chart data structure
const initialChartData = [
  { stream: "Chemical", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Civil", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Computer", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Electrical", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Eng Physics", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Materials", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Mechanical", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Mechatronics", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
  { stream: "Software", firstChoice: 0, secondChoice: 0, thirdChoice: 0 },
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

async function fetchStreamChoiceData() {
  try {
    // Fetch all documents from StatData collection
    const documents = await database.listDocuments('MacStats', 'StatData');
    
    // Create a copy of initial data to update
    const updatedChartData = [...initialChartData];
    let totalSubmissions = 0;
    
    // Update chart data with fetched choice counts
    documents.documents.forEach(doc => {
      let streamIndex = -1;
      
      // Check if this is the total document to get submission count
      if (doc.$id === 'total') {
        totalSubmissions = doc.streamCount || 0;
        return;
      }
      
      // Map document IDs to chart data indices
      switch (doc.$id) {
        case 'chem':
          streamIndex = 0; // Chemical
          break;
        case 'civ':
          streamIndex = 1; // Civil
          break;
        case 'comp':
          streamIndex = 2; // Computer
          break;
        case 'elec':
          streamIndex = 3; // Electrical
          break;
        case 'engphys':
          streamIndex = 4; // Engineering Physics
          break;
        case 'mat':
          streamIndex = 5; // Materials
          break;
        case 'mech':
          streamIndex = 6; // Mechanical
          break;
        case 'tron':
          streamIndex = 7; // Mechatronics
          break;
        case 'soft':
          streamIndex = 8; // Software
          break;
      }
      
      // Update the chart data if we found a matching stream
      if (streamIndex !== -1) {
        updatedChartData[streamIndex] = {
          ...updatedChartData[streamIndex],
          firstChoice: doc.firstChoice || 0,
          secondChoice: doc.secondChoice || 0,
          thirdChoice: doc.thirdChoice || 0,
        };
      }
    });
    
    console.log("Stream choice data fetched successfully:", updatedChartData);
    return { chartData: updatedChartData, totalSubmissions };
  } catch (error) {
    console.error("Error fetching stream choice data:", error);
    return { chartData: initialChartData, totalSubmissions: 0 };
  }
}

export default function StreamChoiceGraph() {
  const [chartData, setChartData] = useState(initialChartData);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const initPage = async () => {
      setIsLoading(true);
      
      // Fetch stream choice data
      const data = await fetchStreamChoiceData();
      setChartData(data.chartData);
      setTotalSubmissions(data.totalSubmissions);
      setKey(prev => prev + 1); // Force re-render
      
      setIsLoading(false);
    };
    
    initPage();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-neutral-900 text-white w-full border-none p-1 pt-6 pb-4">
        <CardHeader className="text-neutral-500 pb-2">
          <div className="flex flex-col justify-center items-center">
            <CardTitle className="text-subtitle flex items-center gap-3 mb-1">
              Live 2025/2026 Stream Choice Distribution
            </CardTitle>
            <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse">
              <p>Loading choice distribution data...</p>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="h-[500px] md:h-[600px] px-2 flex items-center justify-center">
          <div className="text-neutral-400">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900 text-white w-full border-none p-1 pt-6 pb-4">
      <CardHeader className="text-neutral-500 pb-2">
        <div className="flex flex-col justify-center items-center">
          <CardTitle className="text-subtitle flex items-center gap-3 mb-1">
            Live 2025/2026 Stream Choice Distribution
          </CardTitle>
          <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse">
            <p>Total Contributions: {totalSubmissions}</p>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-[500px] md:h-[600px] px-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              key={key}
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                top: 20, right: 40, left: 20, bottom: 20,
              }}
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
                  dy: 20,
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
                width={80}
                dx={-5}
              />
              <ChartTooltip
                cursor={false}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="firstChoice"
                radius={[0, 4, 4, 0]}
                isAnimationActive={true}
                fill={chartConfig.firstChoice.color}
                name={chartConfig.firstChoice.label}
                stroke="none"
              />
              <Bar
                dataKey="secondChoice"
                radius={[0, 4, 4, 0]}
                isAnimationActive={true}
                fill={chartConfig.secondChoice.color}
                name={chartConfig.secondChoice.label}
                stroke="none"
              />
              <Bar
                dataKey="thirdChoice"
                radius={[0, 4, 4, 0]}
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