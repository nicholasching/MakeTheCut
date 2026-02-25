"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useInView, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import GridBackground from "@/components/GridBackground";
import GradientPulse from "@/components/GradientPulse";
import Footer from "@/components/Footer";

// ---------------------------------------------------------------------------
// Animated Counter
// ---------------------------------------------------------------------------
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 40, stiffness: 120 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionValue.set(target);
  }, [inView, motionValue, target]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => {
      setDisplay(
        v >= 1000
          ? Math.round(v).toLocaleString()
          : Math.round(v).toString()
      );
    });
    return unsubscribe;
  }, [spring]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section fade-in variants
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const impactStats = [
  { value: 1000, suffix: "+", label: "MakeTheCut Users" },
  { value: 100000, suffix: "+", label: "Total Visits Across All Sites" },
  { value: 400000, suffix: "+", label: "YouTube Views" },
  { value: 5000, suffix: "+", label: "MakeTheCut Users" },
];

const platformPillars = [
  {
    title: "Empowerment",
    points: [
      "Streamline club creation & reduce friction for getting involved",
      "Reward high-performing clubs and promote strong team culture",
      "Create meaningful learning opportunities for every member",
      "Push for recorded lectures, content shouldn't be held hostage",
      "Grow McMaster's list of elite design teams",
    ],
  },
  {
    title: "Transparency",
    points: [
      "Anonymous surveys to gauge club engagement & hold leadership accountable",
      "Direct communication lines so your concerns are actually heard",
      "Work with faculty to release data that affects you",
      "Publish itemized MES spending reports with VPF",
      "Make governance mechanisms visible, not opaque",
    ],
  },
  {
    title: "Efficiency",
    points: [
      "Terminate partnerships that drain resources without delivering value",
      "Optimize MES internal processes end-to-end",
      "Reinvest savings directly into students and clubs",
      "Make MES work for you, less friction, more impact",
    ],
  },
];

const projects = [
  {
    name: "MakeTheCut",
    url: "https://makethecut.ca",
    description:
      "I was frustrated that choosing a stream felt like throwing darts into the abyss, nobody knew the cutoffs. So I built it. MakeTheCut crowdsources GPA and stream preferences to predict specialization cutoffs more accurately than ever before.",
    metrics: ["1,000+ Users", "50K+ Visits"],
  },
  {
    name: "MakeTheSeat",
    url: "https://maketheseat.ca",
    description:
      "Real-time course availability tracker and timetable builder. Reverse-engineered McMaster's ERP system to automate retrieval of course availability and scheduling, giving students granular control over their timetable.",
    metrics: ["5K+ Users", "75K+ Visits", "10K+ Notifications Sent"],
  },
];

const experience = [
  {
    role: "Software Engineer & Security Researcher",
    org: "McMaster Engineering Society, Infrastructure Technology",
    period: "Jun 2025 – Present",
    points: [
      "Discovered critical server-side validation gaps permitting unauthenticated API access, bypassing booking limits, and vertical privilege escalation to gain admin access.",
      "Building a centralised Welcome Week portal to coordinate hundreds of reps for thousands of incoming students.",
    ],
  },
  {
    role: "Firmware Developer",
    org: "McMaster Formula Electric SAE",
    period: "Sep 2025 – Present",
    points: [
      "Engineered a C++ telemetry pipeline to stream CAN bus data to a remote server.",
      "Leveraged Grafana to visualise mission-critical telemetry in real-time for race-day analytics.",
    ],
  },
  {
    role: "Software Engineering Research Assistant",
    org: "McMaster University",
    period: "May 2025 – Aug 2025",
    points: [
      "Authored 2 research publications (under review) on applying LLMs to assess student reflections and automate feedback.",
      "Data analysis with NumPy, SciPy, Pandas; visualised learning trends with Seaborn and Matplotlib.",
    ],
  },
  {
    role: "Full Stack Developer Intern",
    org: "SkildLabs & Zeitdice",
    period: "Feb 2025 – May 2025",
    points: [
      "Improved SkildLabs' LMS Outline Creator: streamlined UX, authentication, and 35% faster outline creation.",
      "Reduced Zeitdice's historical snapshot load times by 50% via image prefetching and optimised RESTful API endpoints.",
    ],
  },
];

const bobaRanking = [
  { tier: "S", label: "God-tier", shops: ["HeyTea"], color: "bg-red-500" },
  { tier: "A", label: "Excellent", shops: ["CoCo", "OneZo"], color: "bg-orange-500" },
  { tier: "B", label: "Good", shops: ["The Alley"], color: "bg-yellow-500" },
  { tier: "C", label: "Mid", shops: ["Chatime", "Prestotea"], color: "bg-neutral-500" },
  { tier: "D", label: "Why?", shops: ["Gong Cha"], color: "bg-neutral-700" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ElectionsPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <div className="flex flex-col min-h-screen">
      <GridBackground className="flex-1 flex flex-col">

        {/* ---------------------------------------------------------------- */}
        {/* 1. HERO                                                          */}
        {/* ---------------------------------------------------------------- */}
        <section ref={heroRef} className="relative overflow-visible flex flex-col justify-center min-h-screen px-6 md:px-24 lg:px-36 text-center md:text-left pb-20 pt-20">
          <GradientPulse />
          {/* MES logo — embossed into hero background */}
          <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[10%] pointer-events-none select-none overflow-hidden">
            <Image
              src="/MES.png"
              alt=""
              width={275}
              height={275}
              className="opacity-[0.10]"
              style={{
                mixBlendMode: "screen",
                filter: "blur(3px)",
                transform: "translateX(10px)"
              }}
            />
          </div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl"
          >
            <motion.p
              variants={fadeUp}
              className="text-red-500 text-xs md:text-lg font-semibold tracking-widest uppercase mb-2"
            >
              McMaster Engineering Society · March 3-5, 2026 
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-light leading-tight mb-5"
              style={{ fontSize: "clamp(2.2rem, 5.5vw, 7rem)" }}
            >
              Will Nicholas Ching{" "}
              <span className="text-red-500 font-semibold">MakeTheCut</span>
              <br />
              for VP Internal?
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-neutral-400 max-w-2xl mb-7"
              style={{ fontSize: "clamp(0.85rem, 1.2vw, 1.35rem)" }}
            >
              Stop accepting the status quo. Start asking how we make things better. I've spent the last year building tools that thousands of McMaster students depend on, now I want to build the systems that make your entire engineering experience better.
            </motion.p>

            <motion.div variants={fadeUp} className="flex gap-4 flex-wrap justify-center md:justify-start">
              <a
                href="#platform"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-sm font-semibold transition-all duration-200 hover:scale-105 text-sm md:text-base"
              >
                See My Platform
              </a>
              <a
                href="https://macengsociety.ca/elections#:~:text=for%20everyone%20involved.-,NICHOLAS%20CHING,-COMPUTER%20ENGINEERING%2C%20LEVEL"
                target="_blank"
                className="bg-white/[0.05] hover:bg-white/[0.1] border border-neutral-600/60 text-white px-6 py-3 rounded-sm transition-all duration-200 hover:scale-105 text-sm md:text-base"
              >
                Explore All Platforms
              </a>
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="text-neutral-400 max-w-2xl mt-5"
              style={{ fontSize: "clamp(0.85rem, 1.2vw, 1.35rem)" }}
            >
              Voting will be done online via McMaster Email.
            </motion.p>
          </motion.div>

          {/* Scroll hint — fades out at 25% of hero height */}
          <motion.div
            style={{ opacity: scrollHintOpacity }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="flex flex-col items-center gap-2 text-neutral-400"
            >
              <span className="text-xs tracking-widest uppercase">Scroll For More</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-px h-8 bg-gradient-to-b from-neutral-400 to-transparent"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* 2. IMPACT NUMBERS                                                */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 md:px-24 lg:px-36 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeUp}
              className="text-red-500 text-sm md:text-lg font-semibold tracking-widest uppercase mb-3 text-center"
            >
              Impact by the numbers
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-center font-light mb-14"
              style={{ fontSize: "clamp(1.6rem, 3vw, 4rem)" }}
            >
              Building at scale before running for office.
            </motion.h2>

            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {impactStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-xl p-6 text-center hover:border-red-500/40 transition-colors duration-300"
                >
                  <p className="text-white font-bold mb-1" style={{ fontSize: "clamp(1.6rem, 2.5vw, 3rem)" }}>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-neutral-400 text-xs md:text-sm leading-snug">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* 3. PLATFORM PILLARS                                              */}
        {/* ---------------------------------------------------------------- */}
        <section id="platform" className="px-6 md:px-24 lg:px-36 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeUp}
              className="text-red-500 text-sm md:text-lg font-semibold tracking-widest uppercase mb-3 text-center"
            >
              My Platform
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-center font-light mb-4"
              style={{ fontSize: "clamp(1.6rem, 3vw, 4rem)" }}
            >
              Three pillars. One goal.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-neutral-400 text-center max-w-3xl mx-auto mb-14 text-sm md:text-base"
            >
              Engineering teaches us that when a system has too much friction, even the best can't overcome the activation energy required to start. I want to fix that.
            </motion.p>

            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {platformPillars.map((pillar) => (
                <motion.div
                  key={pillar.title}
                  variants={fadeUp}
                  className="bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-xl p-8 hover:border-red-500/40 hover:bg-white/[0.05] transition-all duration-300 group text-center"
                >
                  <h3 className="text-red-500 font-bold text-xl mb-6 group-hover:text-red-400 transition-colors">
                    {pillar.title}
                  </h3>
                  <ol className="space-y-3 text-left">
                    {pillar.points.map((point, idx) => (
                      <li key={point} className="flex gap-3 text-neutral-300 text-sm">
                        <span className="text-red-500 font-semibold tabular-nums flex-shrink-0 w-4 text-right">{idx + 1}.</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              ))}
            </motion.div>

            {/* Platform quote */}
            <motion.div
              variants={fadeUp}
              className="relative mt-14 max-w-3xl mx-auto bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-xl px-14 py-10 md:px-20 md:py-12"
            >
              <span
                className="absolute top-3 left-5 text-red-500 select-none leading-none"
                style={{ fontSize: "clamp(2.8rem, 5vw, 4rem)", fontFamily: "Georgia, serif" }}
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p
                className="text-neutral-200 font-light text-center leading-relaxed"
                style={{ fontSize: "clamp(0.9rem, 1.3vw, 1.3rem)" }}
              >
                My goal is simple: I want to make MES work for you, so you can spend less time fighting the system and more time building, creating, and showing the world what McMaster is capable of.
              </p>
              <span
                className="absolute bottom-[-3] right-5 text-red-500 select-none leading-none"
                style={{ fontSize: "clamp(2.8rem, 5vw, 4rem)", fontFamily: "Georgia, serif" }}
                aria-hidden="true"
              >
                &rdquo;
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* 4. PROJECTS                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 md:px-24 lg:px-36 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeUp}
              className="text-red-500 text-sm md:text-lg font-semibold tracking-widest uppercase mb-3 text-center"
            >
              Projects & Impact
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-center font-light mb-4"
              style={{ fontSize: "clamp(1.6rem, 3vw, 4rem)" }}
            >
              I don't just talk about fixing things.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-neutral-400 text-center max-w-3xl mx-auto mb-14 text-sm md:text-base"
            >
              Developing systems that serve thousands of students was not on my bingo card, but here we are.
            </motion.p>

            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {projects.map((project) => (
                <motion.div
                  key={project.name}
                  variants={fadeUp}
                  className="bg-white/[0.03] backdrop-blur-sm border border-red-500/40 hover:border-red-500 rounded-xl p-7 hover:bg-white/[0.05] transition-all duration-300 group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg text-red-500">
                      {project.name}
                    </h3>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-500 hover:text-red-500 text-xs border border-neutral-700 hover:border-red-500/50 px-2 py-1 rounded transition-all duration-200 flex-shrink-0 ml-4"
                    >
                      Visit ↗
                    </a>
                  </div>

                  <p className="text-neutral-400 text-sm mb-4 leading-relaxed flex-1">{project.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {project.metrics.map((m) => (
                      <span
                        key={m}
                        className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* 5. EXPERIENCE TIMELINE                                           */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 md:px-24 lg:px-36 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeUp}
              className="text-red-500 text-sm md:text-lg font-semibold tracking-widest uppercase mb-3 text-center"
            >
              Experience
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-center font-light mb-14"
              style={{ fontSize: "clamp(1.6rem, 3vw, 4rem)" }}
            >
              What I've shipped
            </motion.h2>

            <div className="max-w-3xl mx-auto">
              <motion.div variants={staggerContainer} className="space-y-6">
                {experience.map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                  >

                    <div className="bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-xl p-6 hover:border-red-500/30 hover:bg-white/[0.05] transition-all duration-300">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-base">{item.role}</h3>
                          <p className="text-red-500/80 text-sm">{item.org}</p>
                        </div>
                        <span className="text-neutral-500 text-xs whitespace-nowrap mt-1 md:mt-0 flex-shrink-0 ml-0 md:ml-4">
                          {item.period}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {item.points.map((pt) => (
                          <li key={pt} className="flex items-start gap-2 text-neutral-400 text-sm leading-relaxed">
                            <span className="text-red-500 flex-shrink-0 leading-relaxed">›</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* 6. ABOUT ME                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section id="about" className="px-6 md:px-24 lg:px-36 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeUp}
              className="text-red-500 text-sm md:text-lg font-semibold tracking-widest uppercase mb-3 text-center"
            >
              Beyond the resume
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-center font-light mb-14"
              style={{ fontSize: "clamp(1.6rem, 3vw, 4rem)" }}
            >
              Get to know me
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Bio card */}
              <motion.div
                variants={fadeUp}
                className="bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-xl p-8 hover:border-neutral-500/60 transition-all duration-300"
              >
                <h3 className="text-white font-semibold text-lg mb-4">The origin story</h3>
                <div className="space-y-3 text-neutral-400">
                  <p>
                    Engineering was never my original plan. I started out deep in marketing and filmmaking during the pandemic, I taught myself video editing and built a YouTube channel that hit over 400K views.
                  </p>
                  <p>
                    Eventually I joined student council, used filmmaking to promote events, then found First Tech Challenge robotics and discovered what it actually felt like to <em>build something from scratch</em>. That's what pulled me into engineering.
                  </p>
                  <p>
                    Our FTC team shared that passion with the community, running robotics workshops at local schools, hosting a summer camp, and winning 2 <a href="https://www.youtube.com/watch?v=75m2UH_XGmo" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors">provincial filmmaking awards</a> along the way.
                  </p>
                  <p>
                    Nowadays you'll find me skiing, biking, building at a hackathon, or studying at Hatch. "Studying" being a loose term, it turns out yapping is quite easy when there are good people around.
                  </p>
                </div>
              </motion.div>

              {/* Fun facts + achievements */}
              <div className="flex flex-col gap-6">
                <motion.div
                  variants={fadeUp}
                  className="bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-xl p-6 hover:border-neutral-500/60 transition-all duration-300"
                >
                  <h3 className="text-white font-semibold text-lg mb-4">Quick facts</h3>
                  <ul className="space-y-2">
                    {[
                      "4.0 GPA — Provost Honour List",
                      "3× Hackathon winner, attended Hack The North, UofTHacks, Deltahacks, Meta Toronto Hackathon, Ontario Engineering Competition",
                      "2× Provincial filmmaking award winner",
                      "Former YouTuber — 400K+ views",
                      "Smart home enthusiast & avid boba connoisseur",
                    ].map((fact, i) => (
                      <li key={i} className="flex gap-3 text-neutral-400 text-sm">
                        <span className="text-red-500 flex-shrink-0">›</span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Boba tier list */}
                <motion.div
                  variants={fadeUp}
                  className="bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-xl p-6 hover:border-neutral-500/60 transition-all duration-300"
                >
                  <h3 className="text-white font-semibold text-lg mb-1">Hot take: Boba Tier List</h3>
                  <p className="text-neutral-600 text-sm mb-4">Empirically determined. Non-negotiable.</p>
                  <div className="space-y-1.5">
                    {bobaRanking.map((row) => (
                      <div key={row.tier} className="flex items-center gap-3">
                        <div className={`${row.color} text-white text-xs font-bold w-8 h-7 rounded flex items-center justify-center flex-shrink-0`}>
                          {row.tier}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {row.shops.map((shop) => (
                            <span
                              key={shop}
                              className="text-xs bg-white/[0.04] border border-neutral-700/60 text-neutral-300 px-2.5 py-1 rounded-full"
                            >
                              {shop}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              className="mt-16 text-center"
            >
              <p className="text-neutral-400 mb-2 text-sm md:text-base">
                Getting involved should be easy. These 4, 5, 6, or maybe 7 years are the best time in your life to learn, fail, and grow.
              </p>
              <p className="text-red-500 font-semibold text-base mb-6">
                Let's make the most of it!
              </p>
              <div className="inline-flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-8 py-5 hover:bg-red-500/15 hover:border-red-500/50 transition-all duration-300">
                <span className="text-red-400 text-sm font-semibold tracking-wide">Nicholas Ching · VP Internal 2026</span>
                <span className="text-neutral-600">·</span>
                <a href="mailto:chingn@mcmaster.ca" className="text-neutral-400 hover:text-white text-sm transition-colors">
                  chingn@mcmaster.ca
                </a>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </GridBackground>

      <Footer />
    </div>
  );
}
