"use client";

import { useSectionTracking } from "@/hooks/useSectionTracking"
import HorizontalBarChart24 from "@/components/HorizontalBarChart24";
import StreamChoiceGraph24 from "@/components/StreamChoiceGraph24";
import GradeDistributionChart24 from "@/components/GradeDistributionChart24";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import LogoutButton from "@/components/LogoutButton";
import Footer from "@/components/Footer";
import StreamChoiceGraph from "@/components/StreamChoiceGraph";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function StatisticsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 hover:bg-neutral-700 transition-colors"
      >
        <span className="text-lg font-semibold text-white">2024/2025 Stream Statistics</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-neutral-400 transition-transform duration-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-400 transition-transform duration-300" />
        )}
      </button>
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 py-8 space-y-6 bg-neutral-900/50">
          <HorizontalBarChart24 />
          <StreamChoiceGraph24 />
          <GradeDistributionChart24 />
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const sectionRef = useSectionTracking<HTMLDivElement>("Dashboard")
  return (
    <div className="flex flex-col min-h-screen" ref={sectionRef}>
      <GridBackground className="flex flex-1 p-5 pt-30 lg:p-30 overflow-y-scroll md:overflow-hidden">
          <HomeButton />
          <LogoutButton />
          <div className="flex flex-col w-full gap-30">
            <StreamChoiceGraph />
            <StatisticsDropdown />
          </div>
      </GridBackground>
      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}