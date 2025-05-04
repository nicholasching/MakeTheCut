"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, ReferenceLine, Label, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as ChartTooltip } from "recharts"
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
import { account, database } from "../app/appwrite";
import { useState, useEffect } from "react";
import { createPrerenderSearchParamsForClientPage } from "next/dist/server/request/search-params"

// Initial structure for chart data
const initialChartData = [
  { grade: "1", count: 0 },
  { grade: "2", count: 0 },
  { grade: "3", count: 0 },
  { grade: "4", count: 0 },
  { grade: "5", count: 0 },
  { grade: "6", count: 0 },
  { grade: "7", count: 0 },
  { grade: "8", count: 0 },
  { grade: "9", count: 0 },
  { grade: "10", count: 0 },
  { grade: "11", count: 0 },
  { grade: "12", count: 0 },
]

async function fetchDistribution(course: string) {
  try {
    // Fetch course averages from the database
    let document = await database.getDocument('MacStats', 'MarkData', course);

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
    color: "#1B79C5", // Changed from #f4ab33 to blue
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("math1za3");

  useEffect(() => {
    const initPage = async () => {
      setIsLoading(true);
      
      // Fetch contribution count
      try {
        const contributions = await database.getDocument('MacStats', 'StatData', 'total');
        setTotalContributions(contributions.streamCount);
      } catch (error) {
        console.error("Error fetching contribution count:", error);
      }

      // Fetch initial course data (math1za3)
      const distribution = await fetchDistribution("math1za3");
      setCourseAvg(distribution.pop() || 0); // Get the average from the distribution array
      
      if (distribution) {
        // Update chart data with fetched distribution
        const updatedData = initialChartData.map((item, index) => ({
          ...item,
          count: distribution[index] || 0,
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

  // Function to handle tab changes
  const handleTabChange = async (value: string) => {
    setIsLoading(true);
    setSelectedCourse(value);
    
    const distribution = await fetchDistribution(value);
    console.log(distribution[12])
    setCourseAvg(distribution.pop() || 0); // Get the average from the distribution array
    
    if (distribution) {
      // Update chart data with new distribution
      const updatedData = initialChartData.map((item, index) => ({
        ...item,
        count: distribution[index] || 0,
      }));
      
      setChartData(updatedData);
    } else {
      console.error(`Error fetching distribution data for ${value}`);
      setChartData(initialChartData);
    }
    
    setIsLoading(false);
  };

  // Show loading animation when data is loading
  if (isLoading) {
    return (
      <Card className="bg-neutral-900 text-white w-full md:w-2/3 mx-auto border-none p-5 pt-10 relative overflow-hidden">
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
    <Card className="bg-neutral-900 text-white w-full md:w-2/3 mx-auto border-none p-1 pt-10 pb-7 lg:pb-5">
      <CardHeader className="text-neutral-500">
        <div className="flex flex-col justify-center items-center">
          <CardTitle className="text-subtitle flex items-center gap-3 mb-1">
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 rounded-full bg-blue-500"></div>
              <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
            </div>
            Live Course Distributions
          </CardTitle>
          <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse">
            <p>Current Contributions: {totalContributions}</p>
          </CardDescription>
        </div>
        <Tabs value={selectedCourse} className="w-full text-center flex-row justify-center mt-5" onValueChange={handleTabChange}>
            <TabsList className="bg-transparent text-neutral-500 flex flex-wrap gap-1 sm:gap-2 md:gap-3 lg:gap-4">
                <TabsTrigger 
                    className={`text-teenytiny hover:bg-neutral-700 data-[state=active]:!bg-transparent transition-all ${selectedCourse === "math1za3" ? "bg-neutral-800 ring-2 ring-blue-500 ring-opacity-70 text-white" : ""}`}
                    value="math1za3"
                >
                    {selectedCourse === "math1za3" ? 
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                        Calc 1 / 1ZA3
                      </span> : 
                      "Calc 1 / 1ZA3"
                    }
                </TabsTrigger>
                <TabsTrigger 
                    className={`text-teenytiny hover:bg-neutral-700 data-[state=active]:!bg-transparent transition-all ${selectedCourse === "math1zb3" ? "bg-neutral-800 ring-2 ring-blue-500 ring-opacity-70 text-white" : ""}`}
                    value="math1zb3"
                >
                    {selectedCourse === "math1zb3" ? 
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                        Calc 2 / 1ZB3
                      </span> : 
                      "Calc 2 / 1ZB3"
                    }
                </TabsTrigger>
                <TabsTrigger 
                    className={`text-teenytiny hover:bg-neutral-700 data-[state=active]:!bg-transparent transition-all ${selectedCourse === "math1zc3" ? "bg-neutral-800 ring-2 ring-blue-500 ring-opacity-70 text-white" : ""}`}
                    value="math1zc3"
                >
                    {selectedCourse === "math1zc3" ? 
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                        Linear Algebra / 1ZC3
                      </span> : 
                      "Linear Algebra / 1ZC3"
                    }
                </TabsTrigger>
                <TabsTrigger 
                    className={`text-teenytiny hover:bg-neutral-700 data-[state=active]:!bg-transparent transition-all ${selectedCourse === "phys1d03" ? "bg-neutral-800 ring-2 ring-blue-500 ring-opacity-70 text-white" : ""}`}
                    value="phys1d03"
                >
                    {selectedCourse === "phys1d03" ? 
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                        Physics / 1D03
                      </span> : 
                      "Physics / 1D03"
                    }
                </TabsTrigger>
                <TabsTrigger 
                    className={`text-teenytiny hover:bg-neutral-700 data-[state=active]:!bg-transparent transition-all ${selectedCourse === "phys1e03" ? "bg-neutral-800 ring-2 ring-blue-500 ring-opacity-70 text-white" : ""}`}
                    value="phys1e03"
                >
                    {selectedCourse === "phys1e03" ? 
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                        Physics / 1E03
                      </span> : 
                      "Physics / 1E03"
                    }
                </TabsTrigger>
                <TabsTrigger 
                    className={`text-teenytiny hover:bg-neutral-700 data-[state=active]:!bg-transparent transition-all ${selectedCourse === "chem1e03" ? "bg-neutral-800 ring-2 ring-blue-500 ring-opacity-70 text-white" : ""}`}
                    value="chem1e03"
                >
                    {selectedCourse === "chem1e03" ? 
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                        Chemistry / 1E03
                      </span> : 
                      "Chemistry / 1E03"
                    }
                </TabsTrigger>
                <TabsTrigger 
                    className={`text-teenytiny hover:bg-neutral-700 data-[state=active]:!bg-transparent transition-all ${selectedCourse === "eng1p13" ? "bg-neutral-800 ring-2 ring-blue-500 ring-opacity-70 text-white" : ""}`}
                    value="eng1p13"
                >
                    {selectedCourse === "eng1p13" ? 
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                        Engineer / 1P13
                      </span> : 
                      "Engineer / 1P13"
                    }
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
                    dataKey="grade"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => value.slice(0, 3)}
                    className="text-[0.55rem] md:text-[0.7rem]"
                    stroke="#737373"
                    label={{value: 'Grade', position: "outsideBottom", dy: 20, style: { fill: '#737373', textAnchor: 'middle' }}}
                />
                <ReferenceLine x={Math.round(courseAvg).toString()} stroke="white" strokeDasharray="4 4">
                  <Label position="top" fill="white" fontSize={14} dy={-10} className="cursor-pointer">
                    {"Course Average: "+ courseAvg.toFixed(2)}
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