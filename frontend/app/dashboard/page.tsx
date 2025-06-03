"use client";

import { useSectionTracking } from "@/hooks/useSectionTracking"
import LockedHorizontalBarChart from "@/components/LockedHorizontalBarChart";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import LogoutButton from "@/components/LogoutButton";
import Footer from "@/components/Footer";
import GradeDistributionChart from "@/components/GradeDistributionChart";
import StreamChoiceGraph from "@/components/StreamChoiceGraph";
import { ST } from "next/dist/shared/lib/utils";

function DashboardContent() {
  const sectionRef = useSectionTracking<HTMLDivElement>("Dashboard")
  return (
    <div className="flex flex-col min-h-screen" ref={sectionRef}>
      <GridBackground className="flex flex-1 p-5 pt-30 lg:p-30 overflow-y-scroll md:overflow-hidden">
          <HomeButton />
          <LogoutButton />
          <div className="flex flex-col w-full gap-30">
            <LockedHorizontalBarChart />
            <StreamChoiceGraph />
            <GradeDistributionChart />
          </div>
      </GridBackground>
      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}