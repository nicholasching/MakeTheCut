"use client";

import Image from "next/image";

import HorizontalBarChart from "@/components/HorizontalBarChart";

import GridBackground from "@/components/GridBackground";

import HomeButton from "@/components/HomeButton";

import LogoutButton from "@/components/LogoutButton";

import Footer from "@/components/Footer";

import LiveCounter from "@/components/LiveCounter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <GridBackground className="flex flex-1 p-5 pt-30 lg:p-30 overflow-y-scroll md:overflow-hidden">
          <HomeButton />
          <LogoutButton />
          <HorizontalBarChart />
      </GridBackground>
      <Footer />
    </div>
  );
}