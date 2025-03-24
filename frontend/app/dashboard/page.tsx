import Image from "next/image";

import HorizontalBarChart from "@/components/HorizontalBarChart";

import GridBackground from "@/components/GridBackground";

import HomeButton from "@/components/HomeButton";

export default function Home() {
  return (
    <GridBackground className="p-30 pt-20">
        <HomeButton />
        <HorizontalBarChart />
    </GridBackground>
  );
}