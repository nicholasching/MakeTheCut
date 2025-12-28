"use client";

import GridBackground from "@/components/GridBackground";
import TextCycle, { engineeringMajors } from "@/components/TextCycle";
import Link from "next/link";
import GradientPulse from "@/components/GradientPulse";
import Footer from "@/components/Footer";
import ScrollButton from "@/components/ScrollButton";
import LiveCounter from "@/components/LiveCounter";
import { useSectionTracking } from "@/hooks/useSectionTracking";

interface HomeContentProps {
    initialCount: number;
}

export default function HomeContent({ initialCount }: HomeContentProps) {
    const sectionRef = useSectionTracking("Home");

    return (
        <section ref={sectionRef}>
            <div className="flex flex-col min-h-screen">
                <GridBackground className="flex-1 flex flex-col pt-50 md:p-24 lg:p-36 text-center md:text-left">
                    <GradientPulse />
                    <div className="flex-1">
                        <h1 className="text-title leading-none mb-5 font-light w-full md:w-2/3">
                            What's the <br className="block md:hidden" />cutoff to get into <br className="block sm:hidden" />
                            <TextCycle words={engineeringMajors} /><br /> engineering?
                        </h1>
                        <div className="flex justify-center md:justify-normal gap-5 flex-col-reverse md:flex-row mt-20">
                            <ScrollButton />
                            <Link href="/login">
                                <button className="bg-red-500 py-2 w-30 md:w-40 rounded-sm hover:scale-105 transition-transform duration-200 cursor-pointer">
                                    Login
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="text-white mb-50 md:mb-0">
                        <div className="w-3/4 mx-auto md:w-1/2 md:mx-0 mb-15 md:mb-0">
                            <h2 className="mt-[50svh] text-subtitle font-semibold">Why did we make this?</h2>
                            <p className="text-subtext">Choosing your engineering stream at McMaster can be stressful, especially when you don't know your chances. MakeTheCut helps first-year students make informed decisions by crowdsourcing GPA and stream preference data. The more students contribute, the more accurate the insights become.</p>
                        </div>
                        <div className="w-3/4 mx-auto md:w-1/2 md:mx-0 ">
                            <h2 className="mt-[5svh] text-subtitle font-semibold">How do we make predictions?</h2>
                            <p className="text-subtext"> We analyze submitted GPA and stream preferences, factoring in <a href="https://www.eng.mcmaster.ca/about-us/fast-facts/" className="underline text-red-500">seat availability</a> to provide a realistic estimate of cutoff ranges. This approach gives students a clearer understanding of where they stand, helping them make more informed decisions. By combining intuitive design, real-time data storage, and simple yet effective data analysis, MakeTheCut removes the guesswork from stream selection at McMaster Engineering.</p>
                        </div>
                    </div>
                    <LiveCounter initialCount={initialCount} className="" />
                </GridBackground>
                <Footer />
            </div>
        </section>
    );
}
