import Image from "next/image";

import GridBackground from "@/components/GridBackground";

import TextCycle, { engineeringMajors } from "@/components/TextCycle";

import Link from "next/link";
import GradientPulse from "@/components/GradientPulse";

import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <GridBackground className="flex-1 flex flex-col pt-50 p-8 md:p-24 lg:p-36 text-center md:text-left">
        <GradientPulse />
        <div className="flex-1">
          <h1 className="text-title leading-none mb-5 font-light w-full md:w-2/3">
            What's the cutoff to get into <br className="block sm:hidden"/>
            <TextCycle words={engineeringMajors}/><br/> engineering
          </h1>
          <div className="flex justify-center md:justify-normal">
            <Link href="/login">
              <button className="bg-red-500 py-2 w-30 md:w-40 rounded-sm hover:scale-105 transition-transform duration-200 cursor-pointer mt-20 mb-100">
                Log In
              </button>
            </Link>
          </div>
        </div>
      </GridBackground>
      <Footer />
    </div>
  );
}

