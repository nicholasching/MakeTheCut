"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis, Label, ResponsiveContainer, Cell, Tooltip as ChartTooltip } from "recharts";
import { account, database } from "../app/appwrite";
import { CardDescription } from "@/components/ui/card";

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
} from "@/components/ui/chart";

// Course grade data structure
let courseData = [
  { course: "Math 1ZA3 (Calc 1)", average: 0 },
  { course: "Math 1ZB3 (Calc 2)", average: 0 },
  { course: "Math 1ZC3 (Lin Alg)", average: 0 },
  { course: "Physics 1D03", average: 0 },
  { course: "Physics 1E03", average: 0 },
  { course: "Chemistry 1E03", average: 0 },
  { course: "Engineering 1P13", average: 0 },
];

async function initPage() {
  try {
    // Fetch course averages from the database
    let document = await database.getDocument('MacStats', 'StatData', 'averages');
    
    // Access documents and update averages
    courseData[0].average = parseFloat(document.math1za3avg || "0");
    courseData[1].average = parseFloat(document.math1zb3avg || "0");
    courseData[2].average = parseFloat(document.math1zc3avg || "0");
    courseData[3].average = parseFloat(document.phys1d03avg || "0");
    courseData[4].average = parseFloat(document.phys1e03avg || "0");
    courseData[5].average = parseFloat(document.chem1e03avg || "0");
    courseData[6].average = parseFloat(document.eng1p13avg || "0");
    console.log("Course data fetched successfully:", courseData);
    
    return 1;
  }
  catch (error) {
    console.error("Error fetching course data:", error);
    return 0;
  }
}

// Create a custom tooltip component for course grades
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-800 p-2 rounded border border-neutral-700 text-sm">
        <p className="mb-1"><strong>{payload[0].payload.course}</strong></p>
        <p className="text-red-400">Average Grade: {payload[0].value.toFixed(1)}/12</p>
      </div>
    );
  }
  return null;
};

const chartConfig = {
  average: {
    label: "Grade Average",
    color: "#ef4444",
  },
} satisfies ChartConfig

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

export default function CourseGradeChart() {
  const [isMobile, setIsMobile] = useState(false);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      setKey(key + await initPage());

      // Fetch contribution count
      try {
        const contributions = await database.getDocument('MacStats', 'StatData', 'averages');
        setTotalContributions(contributions.streamCount);
      } catch (error) {
        console.error("Error fetching contribution count:", error);
      }
    };
    
    fetchData();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Red color gradient for bars
  const barColors = [
    "#1D2435", // Light red
    "#242D42",
    "#2B364F",
    "#323F5D",
    "#39486A", // Pure red
    "#405177",
    "#475B85" // Dark red
  ];
  
  // Function to get bar color based on course
  const getBarFill = (course: string) => {
    const index = courseData.findIndex(item => item.course === course);
    return barColors[index % barColors.length];
  };
  
  // Show loading animation when key is 0
  if (key === 0) {
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
    <Card className="bg-neutral-900 text-white w-full md:w-2/3 mx-auto border-none p-1 pt-10 pb-7 lg:pb-5 mb-20">
      <CardHeader className="text-neutral-500">
        <div className="flex flex-col justify-center items-center">
          <CardTitle className="text-subtitle flex items-center gap-3 mb-1">
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 rounded-full bg-red-500"></div>
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
            </div>
            Live Course Grade Averages
          </CardTitle>
          <CardDescription className="text-tiny flex md:flex-col items-center text-center font-semibold flex-col-reverse">
            <p>Current Contributions: {totalContributions}</p>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-[500px] md:h-[600px] pr-3 pl-3 md:pl-7">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              accessibilityLayer 
              data={courseData} 
              layout="vertical" 
              margin={isMobile ? 
              { top: 30, right: 20, left: 5, bottom: 20 } : 
              { top: 30, right: 30, left: 30, bottom: 20 }
              }
            >
              <CartesianGrid horizontal={false} stroke="#333" />
              <YAxis dataKey="course" type="category" tickLine={false} axisLine={false} className="text-[0.55rem] md:text-[0.7rem]"/>
              <XAxis type="number" tickLine={false} axisLine={true} domain={[0, 12]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} label={{value: 'Grade Point Average (out of 12)', position: "outsideBottom", dy: 20, style: { fill: '#737373', textAnchor: 'middle' }}}/>
              <ChartTooltip
                cursor={false}
                content={<CustomTooltip />}
              />
                <Bar 
                dataKey="average" 
                radius={[0, 4, 4, 0]} 
                isAnimationActive={true} 
                fill="#ef4444"
                fillOpacity={1}
                name="Average"
                stroke="none"
                barSize={45}
                >
                {courseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarFill(entry.course)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-center">
        <p className="text-tiny text-neutral-600 mx-auto">Projections will improve with the number of contributions. Share this site with other Engineering 1 students</p>
      </CardFooter>
    </Card>
  );
}