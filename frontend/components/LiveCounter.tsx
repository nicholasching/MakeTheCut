"use client";

import { useEffect, useState } from "react";
import { animate, motion, AnimatePresence } from "framer-motion";
import { database } from "./../app/appwrite";

interface LiveCounterProps {
    className?: string;
}

export default function LiveCounter({ className = "" }: LiveCounterProps) {
        const [totalContributions, setTotalContributions] = useState<number | null>(null);
        const [animatedCount, setAnimatedCount] = useState<number>(0);

        useEffect(() => {
                const getContributions = async () => {
                        const total = await database.getDocument('MacStats', 'StatData', 'total');
                        const total24 = await database.getDocument('MacStats', 'StatData24', 'total');
                        const contributions = total.streamCount * 8 + total24.streamCount * 10 + total24.reportCutoff;
                        setTotalContributions(contributions);
                }
                getContributions();
        }, []);

        useEffect(() => {
                if (totalContributions !== null) {
                        const controls = animate(0, totalContributions, {
                                duration: 2, // Increased duration for more dramatic effect
                                ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for a more dramatic easeOut
                                onUpdate(value) {
                                        setAnimatedCount(Math.round(value));
                                }
                        });
                        return () => controls.stop();
                }
        }, [totalContributions]);

        return (
                <div className={`bg-white/10 backdrop-blur-lg rounded-md p-3 px-5 flex items-center justify-center gap-3 fixed top-10 w-fit left-1/2 transform -translate-x-1/2 md:translate-x-0 md:right-15 md:left-auto z-10 ${className}`}>
                                <div className="relative w-3 h-3">
                                                <div className="absolute inset-0 rounded-full bg-red-500"></div>
                                                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                                </div>
                                <p className="text-white text-subtitle">
                                        Lifetime Data Points:{" "}
                                        <AnimatePresence mode="wait">
                                                {totalContributions === null ? (
                                                        <motion.span
                                                                key="loading"
                                                                exit={{ opacity: 0, y: -10 }}
                                                                transition={{ duration: 0.3 }}
                                                        >
                                                                Loading...
                                                        </motion.span>
                                                ) : (
                                                        <motion.span
                                                                key="count"
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                transition={{ duration: 0.3 }}
                                                        >
                                                                {animatedCount}
                                                        </motion.span>
                                                )}
                                        </AnimatePresence>
                                </p>
                </div>
        );
}