"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSectionTracking } from "@/hooks/useSectionTracking"
import HorizontalBarChart from "@/components/HorizontalBarChart";
import StreamChoiceGraph from "@/components/StreamChoiceGraph";
import GradeDistributionChart from "@/components/GradeDistributionChart";
import HorizontalBarChart24 from "@/components/HorizontalBarChart24";
import StreamChoiceGraph24 from "@/components/StreamChoiceGraph24";
import GradeDistributionChart24 from "@/components/GradeDistributionChart24";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import LogoutButton from "@/components/LogoutButton";
import Footer from "@/components/Footer";
import { ChevronDown, Calculator, ClipboardList, Info, AlertCircle } from "lucide-react";
import { account } from "../appwrite";

function StatisticsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-2xl overflow-hidden shadow-2xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-6 hover:bg-white/[0.04] transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          <span className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
            2024/2025 Stream Statistics
          </span>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown className="w-6 h-6 text-neutral-400 group-hover:text-blue-400" />
        </div>
      </button>

      <div
        className={`transition-all duration-700 ease-out overflow-hidden ${
          isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 pt-2 space-y-8">
          <div>
            <HorizontalBarChart24 />
          </div>
          
          <div>
            <StreamChoiceGraph24 />
          </div>
          
          <div>
            <GradeDistributionChart24 />
          </div>
        </div>
      </div>
    </div>
  );
}

function MethodologyDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-2xl overflow-hidden shadow-2xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-6 hover:bg-white/[0.04] transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
            Methodology & Data Sources
          </span>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown className="w-6 h-6 text-neutral-400 group-hover:text-blue-400" />
        </div>
      </button>

      <div
        className={`transition-all duration-700 ease-out overflow-hidden ${
          isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 pt-0 space-y-8">
          <p className="text-neutral-400 text-base leading-relaxed">
            MakeTheCut uses two separate pipelines: estimated cutoffs from simulated allocation and reported cutoffs from student admission outcomes.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Estimated Cutoffs */}
            <div className="bg-white/[0.04] border border-neutral-600/40 rounded-xl p-6 hover:border-blue-500/20 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-blue-500/15">
                  <Calculator className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Estimated Cutoffs</h3>
              </div>
              <p className="text-neutral-400 text-sm mb-4">
                Simulated allocation using McMaster&apos;s historical seat proportions and current preference submissions:
              </p>
              <ul className="space-y-2.5 text-neutral-300 text-sm">
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">1.</span>
                  Exclude submissions with zero GPA; apply historical stream seat shares (averaged over 4 years).
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">2.</span>
                  Assign free-choice students first, then non-free-choice by descending GPA, respecting preferences and capacity.
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">3.</span>
                  Cutoff = lowest non-free-choice GPA admitted. Underfilled streams use 4.0; fully free-choice-filled streams use 12.0.
                </li>
              </ul>
              <p className="mt-4 text-xs text-neutral-500 italic">
                2024/25 estimates are locked; no further updates.
              </p>
            </div>

            {/* Reported Cutoffs */}
            <div className="bg-white/[0.04] border border-neutral-600/40 rounded-xl p-6 hover:border-blue-500/20 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-blue-500/15">
                  <ClipboardList className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Reported Cutoffs</h3>
              </div>
              <p className="text-neutral-400 text-sm mb-4">
                Derived from student-reported admission and rejection outcomes by stream:
              </p>
              <ul className="space-y-2.5 text-neutral-300 text-sm">
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">1.</span>
                  Collect stream-in and stream-out reports linked to GPA; exclude free-choice and invalid/zero GPA entries.
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">2.</span>
                  Iteratively remove outlier pairs when the gap between lowest admitted and highest rejected exceeds 0.5 GPA.
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400/80 shrink-0">3.</span>
                  Cutoff = midpoint of lowest admitted and highest rejected, or a one-sided bound when only one side exists.
                </li>
              </ul>
              <p className="mt-4 text-xs text-neutral-500 italic">
                Updated as students share results.
              </p>
            </div>
          </div>

          {/* Notes & Disclaimer */}
          <div className="bg-white/[0.04] border border-neutral-600/40 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/15">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Limitations & Updates</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-neutral-300 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-neutral-200">Limitations</p>
                <ul className="space-y-1.5">
                  <li>• Limited sample sizes may reduce accuracy</li>
                  <li>• Possible fake submissions affect data quality</li>
                  <li>• Seat shares based on historical data may vary</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-neutral-200">Update cadence</p>
                <ul className="space-y-1.5">
                  <li>• Stream preferences: real-time</li>
                  <li>• Reported cutoffs: as students report</li>
                  <li>• Estimated cutoffs: locked for 2024/25</li>
                  <li>• Historical data: annual verification</li>
                </ul>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-600/30">
              <AlertCircle className="w-5 h-5 text-amber-400/90 shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-400">
                <strong className="text-neutral-300">Disclaimer:</strong> This data is for informational purposes only. Always consult official university sources for final admission requirements and decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const sectionRef = useSectionTracking<HTMLDivElement>("Dashboard");
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initiatePage() {
      try {
        const loggedInUser = await account.get();
        
        // Comment to disable verification
        if (!loggedInUser.emailVerification) {
          router.push('/authenticate');
          return;
        }

        setUserName(loggedInUser.name || "User");
        
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }
    
    initiatePage();
  }, [router]);

  if (isLoading) {
    return (
      <GridBackground className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-neutral-400 animate-pulse">Loading your dashboard...</p>
        </div>
      </GridBackground>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" ref={sectionRef}>
      <GridBackground className="flex flex-1 p-5 pt-32 lg:p-12 lg:pt-32">
        <HomeButton />
        <LogoutButton />
        
        <div className="w-full max-w-7xl mx-auto">          
          <div className="flex flex-col gap-8">
            <div className="z-10 flex flex-col gap-8">
              <HorizontalBarChart />
              <StreamChoiceGraph />
              <GradeDistributionChart />
            </div>
            
            <div>
              <StatisticsDropdown />
            </div>
            
            <div>
              <MethodologyDropdown />
            </div>
          </div>
        </div>
      </GridBackground>
      
      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}