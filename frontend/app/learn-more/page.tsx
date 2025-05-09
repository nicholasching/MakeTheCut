import Image from "next/image";
import { useSectionTracking } from "@/hooks/useSectionTracking"

export default function Home() {
  const sectionRef = useSectionTracking<HTMLElement>("LearnMore")
  return (
    <main className="mt-25 mx-100" ref={sectionRef}>
        <h1 className="text-md leading-none mb-5 font-light">
            About MacStats
        </h1>
        <p className="text-sm">
            Choosing an engineering stream at McMaster can be a stressful experience. Since first-year engineering is general, students must compete for limited spots in their preferred specialization based on their GPA. Many students feel uncertain about whether their grades are competitive enough, and there's no easy way to see past cutoff trends. This website was created to help students get a clearer picture of the stream selection process by anonymously sharing their grades and preferences.
            <br />
            <br />
            By collecting data from students who voluntarily submit their GPA and stream rankings, we can estimate the approximate cutoff for each specialization. Since McMaster provides the number of seats available per stream, we can use this data to generate statistics like projected cutoffs and acceptance rates. The goal is to provide more transparency, helping students make informed decisions rather than stressing over unknowns.
            <br />
            <br />
            This project is completely anonymous and community-driven. The more students contribute, the more accurate the insights will be. Whether you're trying to gauge your chances or just curious about the trends, this tool aims to be a valuable resource for stream selection.
        </p>
    </main>
  );
}