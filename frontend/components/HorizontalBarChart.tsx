"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis, Label, ResponsiveContainer, Cell, Tooltip as ChartTooltip } from "recharts";
import { account, database } from "../app/appwrite";
import { CardDescription } from "@/components/ui/card";
import GradientPulse from "./GradientPulse";


import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

let cutoffs = {chem: 4, civil: 4, computer: 4, electrical: 4, engphys: 4, materials: 4, mechanical: 4, mechatronics: 4, software: 4};
var loggedInUser;
var user;
var userGPA = 4;

// Update the chartData structure to include the number of people
let chartData = [
  { stream: "Chemical", GPA: cutoffs.chem, people: 0 },
  { stream: "Civil", GPA: cutoffs.civil, people: 0 },
  { stream: "Computer", GPA: cutoffs.computer, people: 0 },
  { stream: "Electrical", GPA: cutoffs.electrical, people: 0 },
  { stream: "Engineering Physics", GPA: cutoffs.engphys, people: 0 },
  { stream: "Materials", GPA: cutoffs.materials, people: 0 },
  { stream: "Mechanical", GPA: cutoffs.mechanical, people: 0 },
  { stream: "Mechatronics", GPA: cutoffs.mechatronics, people: 0 },
  { stream: "Software", GPA: cutoffs.software, people: 0 },
]

async function initPage(router: any) {
  try {
    loggedInUser = await account.get();
    
    // Uncomment to enable verification
    /* 
    if (!loggedInUser.emailVerification){
      router.push('/authenticate');
    }
    */

    try{
      user = await database.getDocument('MacStats', 'UserData', loggedInUser.$id);
      userGPA = user.gpa;
      
      let documents = await database.listDocuments('MacStats', 'StatData');
      
      // Access documents by their $id and update people count
      documents.documents.forEach(doc => {
        if (doc.$id === 'chem') {
          cutoffs.chem = parseFloat(doc.streamCutoff);
          chartData[0].people = doc.firstChoiceCount || 0;
        }
        if (doc.$id === 'civ') {
          cutoffs.civil = parseFloat(doc.streamCutoff);
          chartData[1].people = doc.firstChoiceCount || 0;
        }
        if (doc.$id === 'comp') {
          cutoffs.computer = parseFloat(doc.streamCutoff);
          chartData[2].people = doc.firstChoiceCount || 0;
        }
        if (doc.$id === 'elec') {
          cutoffs.electrical = parseFloat(doc.streamCutoff);
          chartData[3].people = doc.firstChoiceCount || 0;
        }
        if (doc.$id === 'engphys') {
          cutoffs.engphys = parseFloat(doc.streamCutoff);
          chartData[4].people = doc.firstChoiceCount || 0;
        }
        if (doc.$id === 'mat') {
          cutoffs.materials = parseFloat(doc.streamCutoff);
          chartData[5].people = doc.firstChoiceCount || 0;
        }
        if (doc.$id === 'mech') {
          cutoffs.mechanical = parseFloat(doc.streamCutoff);
          chartData[6].people = doc.firstChoiceCount || 0;
        }
        if (doc.$id === 'tron') {
          cutoffs.mechatronics = parseFloat(doc.streamCutoff);
          chartData[7].people = doc.firstChoiceCount || 0;
        }
        if (doc.$id === 'soft') {
          cutoffs.software = parseFloat(doc.streamCutoff);
          chartData[8].people = doc.firstChoiceCount || 0;
        }
      });
      
      // Update chart data with new GPA values
      chartData = [
        { stream: "Chemical", GPA: cutoffs.chem, people: chartData[0].people },
        { stream: "Civil", GPA: cutoffs.civil, people: chartData[1].people },
        { stream: "Computer", GPA: cutoffs.computer, people: chartData[2].people },
        { stream: "Electrical", GPA: cutoffs.electrical, people: chartData[3].people },
        { stream: "Engineering Physics", GPA: cutoffs.engphys, people: chartData[4].people },
        { stream: "Materials", GPA: cutoffs.materials, people: chartData[5].people },
        { stream: "Mechanical", GPA: cutoffs.mechanical, people: chartData[6].people },
        { stream: "Mechatronics", GPA: cutoffs.mechatronics, people: chartData[7].people },
        { stream: "Software", GPA: cutoffs.software, people: chartData[8].people },
      ]

      return 1
    }
    catch (error) {
      router.push('/grades');
    }
  }
  catch (error) {
    router.push('/login');
  }

  return 0
}

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
    color: "#f4ab33",
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

export default function HorizontalBarChart() {
  const [isMobile, setIsMobile] = useState(false);
  const [key, setKey] = useState(0);
  const router = useRouter();
  
  useEffect(() => {
    const fetchData = async () => {
      setKey(key + await initPage(router));
    };
    
    fetchData();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const barColors = ["#CC7400", "#E07F00", "#F58B00", "#FF950A", "#FF9E1F", "#FFA833", "#FFB147", "#FFB95C", "#FFC170"];
  
  // Function to get bar color based on stream name
  const getBarFill = (stream: string) => {
    const index = chartData.findIndex(item => item.stream === stream);
    return barColors[index % barColors.length];
  };
  
  // Show loading animation when key is 0
  if (key === 0) {
    return (
      <Card className="bg-neutral-900 text-white w-full md:w-2/3 mx-auto border-none p-5 pt-10 relative overflow-hidden">
        <CardHeader className="text-neutral-500">
          <CardTitle className="text-subtitle ">Loading Stream Data...</CardTitle>

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
          Live Estimated Stream Cutoffs
        </CardTitle>
        <CardDescription className="text-teenytiny">Data will become more accurate with more users</CardDescription>
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
              <YAxis dataKey="stream" type="category" tickLine={false} axisLine={false} className="text-[0.55rem] md:text-[0.7rem]"/>
              <XAxis type="number" tickLine={false} axisLine={true} domain={[0, 12]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} label={{value: 'GPA Cutoffs', position: "outsideBottom", dy: 20, style: { fill: '#474747', textAnchor: 'middle' }}}/>
              <ReferenceLine x={userGPA} stroke="white" strokeDasharray="4 4">
                <Label position="top" fill="white" fontSize={14} dy={-10} onClick={() => router.push('/grades')} className="cursor-pointer hover:fill-[#CC7400] transition-all underline">
                  You ✎
                </Label>
              </ReferenceLine>
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
  )
}