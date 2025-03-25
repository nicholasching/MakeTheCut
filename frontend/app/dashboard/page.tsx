import Image from "next/image";

import HorizontalBarChart from "@/components/HorizontalBarChart";

import GridBackground from "@/components/GridBackground";

import HomeButton from "@/components/HomeButton";

import LogoutButton from "@/components/LogoutButton";

export default function Home() {
  return (
    <GridBackground className="lg:p-30 pt-20">
        <HomeButton />
        <LogoutButton />
        <HorizontalBarChart />
    </GridBackground>
  );
}