"use client";

import Image from "next/image";
import { useSectionTracking } from "@/hooks/useSectionTracking"

import HorizontalBarChart from "@/components/HorizontalBarChart";

import GridBackground from "@/components/GridBackground";

import HomeButton from "@/components/HomeButton";

import LogoutButton from "@/components/LogoutButton";

import Footer from "@/components/Footer";

import HorizontalBarChartGrades from "@/components/HorizontalBarChartGrades";

import GradeDistributionChart from "@/components/GradeDistributionChart";

import LiveCounter from "@/components/LiveCounter";

export default function Home() {
  const sectionRef = useSectionTracking<HTMLDivElement>("Dashboard")
  return (
    <div className="flex flex-col min-h-screen" ref={sectionRef}>
      <GridBackground className="flex flex-1 p-5 pt-30 lg:p-30 overflow-y-scroll md:overflow-hidden">
          <HomeButton />
          <LogoutButton />
          <div className="flex flex-col w-full gap-30">
            <HorizontalBarChart />
            <GradeDistributionChart />
          </div>
      </GridBackground>
      <Footer />
    </div>
  );
}