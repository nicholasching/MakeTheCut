"use client"

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis, Label, ResponsiveContainer, Cell, Tooltip as ChartTooltip } from "recharts";
import { account, database } from "../app/appwrite";
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

let chartData = [
  { stream: "Chemical", GPA: cutoffs.chem },
  { stream: "Civil", GPA: cutoffs.civil},
  { stream: "Computer", GPA: cutoffs.computer },
  { stream: "Electrical", GPA: cutoffs.electrical },
  { stream: "Engineering Physics", GPA: cutoffs.engphys },
  { stream: "Materials", GPA: cutoffs.materials },
  { stream: "Mechanical", GPA: cutoffs.mechanical },
  { stream: "Mechatronics", GPA: cutoffs.mechatronics },
  { stream: "Software", GPA: cutoffs.software },
]

async function initPage(router: any) {
  try {
    loggedInUser = await account.get();

    try{
      user = await database.getDocument('MacStats', 'UserData', loggedInUser.$id);
      userGPA = user.gpa;
      
      let documents = await database.listDocuments('MacStats', 'StatData');
      
      // Access documents by their $id
      documents.documents.forEach(doc => {
        if (doc.$id === 'chem') cutoffs.chem = parseFloat(doc.streamCutoff);
        if (doc.$id === 'civ') cutoffs.civil = parseFloat(doc.streamCutoff);
        if (doc.$id === 'comp') cutoffs.computer = parseFloat(doc.streamCutoff);
        if (doc.$id === 'elec') cutoffs.electrical = parseFloat(doc.streamCutoff);
        if (doc.$id === 'engphys') cutoffs.engphys = parseFloat(doc.streamCutoff);
        if (doc.$id === 'mat') cutoffs.materials = parseFloat(doc.streamCutoff);
        if (doc.$id === 'mech') cutoffs.mechanical = parseFloat(doc.streamCutoff);
        if (doc.$id === 'tron') cutoffs.mechatronics = parseFloat(doc.streamCutoff);
        if (doc.$id === 'soft') cutoffs.software = parseFloat(doc.streamCutoff);
      });
      
      chartData = [
        { stream: "Chemical", GPA: cutoffs.chem },
        { stream: "Civil", GPA: cutoffs.civil},
        { stream: "Computer", GPA: cutoffs.computer },
        { stream: "Electrical", GPA: cutoffs.electrical },
        { stream: "Engineering Physics", GPA: cutoffs.engphys },
        { stream: "Materials", GPA: cutoffs.materials },
        { stream: "Mechanical", GPA: cutoffs.mechanical },
        { stream: "Mechatronics", GPA: cutoffs.mechatronics },
        { stream: "Software", GPA: cutoffs.software },
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
      <div className="h-50 w-50 border-40 border-dotted border-spacing-4 border-neutral-200 rounded-full animate-spin"></div>
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
    <Card className="bg-neutral-900 text-white w-full md:w-2/3 mx-auto border-none p-1 pt-10 pb-0 lg:pb-5">
      <CardHeader className="text-neutral-500">
        <CardTitle className="text-subtitle flex items-center justify-center gap-3"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>Live Estimated Stream Cutoffs</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px] md:h-[600px] pr-3 pl-3 md:pl-7">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              accessibilityLayer 
              data={chartData} 
              layout="vertical" 
              margin={isMobile ? 
              { top: 30, right: 20, left: 5, bottom: 10 } : 
              { top: 30, right: 30, left: 30, bottom: 10 }
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
              content={<ChartTooltipContent hideLabel />}
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