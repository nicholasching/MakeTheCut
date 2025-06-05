"use client";

import { useEffect, useState } from "react";
import { database } from "./../app/appwrite";

interface LiveCounterProps {
    className?: string;
}

export default function LiveCounter({ className = "" }: LiveCounterProps) {
        const [totalContributions, setTotalContributions] = useState<string>("Loading...");

        useEffect(() => {
                const getContributions = async () => {
                        const total = await database.getDocument('MacStats', 'StatData', 'total');
                        const total24 = await database.getDocument('MacStats', 'StatData24', 'total');
                        const contributions = total.streamCount + total24.streamCount;
                        setTotalContributions(contributions);
                }
                getContributions();
        }, []);

        return (
                <div className={`bg-white/10 backdrop-blur-lg rounded-md p-3 px-5 flex items-center justify-center gap-3 fixed top-10 w-fit left-1/2 transform -translate-x-1/2 md:translate-x-0 md:right-15 md:left-auto z-10 ${className}`}>
                                <div className="relative w-3 h-3">
                                                <div className="absolute inset-0 rounded-full bg-red-500"></div>
                                                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                                </div>
                                <p className="text-white text-subtitle">Lifetime Contributions: {totalContributions}</p>
                </div>
        );
}