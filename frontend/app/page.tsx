import Image from "next/image";

import GridBackground from "@/components/GridBackground";

import TextCycle, { engineeringMajors } from "@/components/TextCycle";

import Link from "next/link";
import GradientPulse from "@/components/GradientPulse";

import LogoutButton from "@/components/LogoutButton";

export default function Home() {
  return (
    <GridBackground className="pt-50 p-8 md:p-24 lg:p-36 text-center md:text-left overflow-y-scroll">
      <GradientPulse />
      <h1 className="text-title leading-none mb-5 font-light w-full md:w-2/3">What's the cutoff to get <br/> into <br className="block sm:hidden"/><TextCycle words={engineeringMajors}/><br/> engineering</h1>
      <div className="flex justify-center md:justify-normal">
        <Link href="/login">
          <button className="bg-red-500 py-2 w-30 md:w-40 rounded-sm hover:scale-105 transition-transoform duration-200 cursor-pointer mt-20">Log In</button>
        </Link>
      </div>
      <p className="mt-[40vh]">Hello</p>

    </GridBackground>
  );
}

