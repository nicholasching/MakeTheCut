"use client";

import Image from "next/image";

import HorizontalBarChart from "@/components/HorizontalBarChart";

import GridBackground from "@/components/GridBackground";

import HomeButton from "@/components/HomeButton";

import LogoutButton from "@/components/LogoutButton";

import Footer from "@/components/Footer";

export default function Home() {
  /*
  const router = useRouter();
  useEffect(() => {
    async function initiatePage() {
        try {
            let loggedInUser = await account.get();
        }
        catch (error) {
            router.push('/login');
        }
    }
    initiatePage();
  }, []);
  */

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