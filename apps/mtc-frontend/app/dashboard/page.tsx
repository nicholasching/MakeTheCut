"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSectionTracking } from "@/hooks/useSectionTracking"
import HorizontalBarChart24 from "@/components/HorizontalBarChart24";
import StreamChoiceGraph24 from "@/components/StreamChoiceGraph24";
import GradeDistributionChart24 from "@/components/GradeDistributionChart24";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import LogoutButton from "@/components/LogoutButton";
import Footer from "@/components/Footer";
import StreamChoiceGraph from "@/components/StreamChoiceGraph";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { account } from "../appwrite";

function WelcomeSection({ userName }: { userName: string | null }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeOfDayGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = userName?.split(' ')[0] || "User";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 border border-purple-500/30 rounded-2xl p-8 mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-purple-400 animate-bounce" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {getTimeOfDayGreeting()}, {firstName}!
          </h1>
        </div>
        
        <p className="text-lg text-neutral-300">
          Welcome back! Check out the latest stream statistics and see how you compare.
        </p>
      </div>
    </div>
  );
}

function StatisticsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 backdrop-blur-sm border border-neutral-600/50 rounded-2xl overflow-hidden shadow-2xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-6 hover:bg-white/5 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
            2024/2025 Stream Statistics
          </span>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-6 h-6 text-neutral-400 group-hover:text-purple-400" />
        </div>
      </button>
      
      <div 
        className={`transition-all duration-700 ease-out overflow-hidden ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 pt-0 space-y-8 bg-gradient-to-b from-transparent to-neutral-900/20">
          <div className="transform transition-all duration-500 hover:scale-[1.01]">
            <HorizontalBarChart24 />
          </div>
          
          <div className="transform transition-all duration-500 delay-100 hover:scale-[1.01]">
            <StreamChoiceGraph24 />
          </div>
          
          <div className="transform transition-all duration-500 delay-200 hover:scale-[1.01]">
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
    <div className="w-full bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 backdrop-blur-sm border border-neutral-600/50 rounded-2xl overflow-hidden shadow-2xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-6 hover:bg-white/5 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
            Methodology & Data Sources
          </span>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-6 h-6 text-neutral-400 group-hover:text-blue-400" />
        </div>
      </button>
      
      <div 
        className={`transition-all duration-700 ease-out overflow-hidden ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 pt-0 space-y-6 bg-gradient-to-b from-transparent to-neutral-900/20">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Estimated Cutoffs Section */}
            <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-amber-400">Estimated Cutoffs</h3>
              </div>
              <div className="space-y-3 text-neutral-300 text-sm">
                <p>
                  <strong className="text-amber-300">How We Calculate:</strong> Using McMaster's exact allocation algorithm:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Apply historical seat distribution (%) from 4 years of official McMaster data</li>
                  <li>Calculate available seats based on current submission volume</li>
                  <li>Allocate students starting with free choice, then by descending GPA</li>
                  <li>The last admitted student's GPA becomes the stream cutoff</li>
                </ul>
                <p className="text-xs text-amber-200/80 italic">
                  * 2024/2025 data is locked - no further updates to estimates.
                </p>
              </div>
            </div>

            {/* Reported Cutoffs Section */}
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-green-400">Reported Cutoffs</h3>
              </div>
              <div className="space-y-3 text-neutral-300 text-sm">
                <p>
                  <strong className="text-green-300">How We Calculate:</strong> Based on real student admission reports:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Collect student reports of acceptances and rejections by stream</li>
                  <li>Set cutoff as the higher of: lowest accepted GPA or highest rejected GPA</li>
                  <li>Filter outliers: remove data points with inconsistencies, those where the (highest rejected GPA - lowest accepted GPA) &gt; 0.5/12 GPA</li>
                  <li>Average the lowest accepted GPA and highest rejected GPA to get the reported cutoff</li>
                </ul>
                <p className="text-xs text-green-200/80 italic">
                  * Updates live as students share their results.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-blue-400">Important Notes</h3>
            </div>
                                      <div className="grid md:grid-cols-2 gap-4 text-neutral-300 text-sm">
               <div>
                 <p className="font-medium text-blue-300 mb-2">Limitations:</p>
                 <ul className="list-disc list-inside space-y-1">
                    <li>Limited sample sizes may reduce accuracy</li>
                    <li>Possible fake submissions affect data quality</li>
                    <li>Seat counts based on historical data may vary</li>
                 </ul>
               </div>
               <div>
                 <p className="font-medium text-blue-300 mb-2">Update Schedule:</p>
                 <ul className="list-disc list-inside space-y-1">
                    <li>Stream Preferences: Updated in real-time</li>
                    <li>Reported Cutoffs: Updated as students report results</li>
                    <li>Estimated Cutoffs: Locked for 2024/25 cycle</li>
                    <li>Historical Data: Annual verification and archiving</li>
                 </ul>
               </div>
             </div>
            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
              <p className="text-xs text-blue-200 text-center">
                <strong>Disclaimer:</strong> This data is for informational purposes only. Always consult official university sources for final admission requirements and decisions.
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
      <GridBackground className="flex flex-1 p-5 pt-32 lg:p-12 lg:pt-32 overflow-y-scroll">
        <HomeButton />
        <LogoutButton />
        
        <div className="w-full max-w-7xl mx-auto">
          <WelcomeSection userName={userName} />
          
          <div className="flex flex-col gap-8">
            <div className="transform transition-all duration-500 hover:scale-[1.005]">
              <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600/30 rounded-2xl p-1 shadow-2xl">
                <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <h2 className="text-2xl font-bold text-white">Current Year Stream Preferences</h2>
                  </div>
                  <StreamChoiceGraph />
                </div>
              </div>
            </div>
            
            <div className="transform transition-all duration-500 delay-100 hover:scale-[1.005]">
              <StatisticsDropdown />
            </div>
            
            <div className="transform transition-all duration-500 delay-200 hover:scale-[1.005]">
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