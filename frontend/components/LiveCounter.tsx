"use client";

export default function LiveCounter() {
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-md p-3 px-5 flex items-center justify-center gap-3 fixed top-10  w-fit left-1/2 transform -translate-x-1/2 md:translate-x-0 md:right-10 z-10">
                <div className="relative w-3 h-3">
                        <div className="absolute inset-0 rounded-full bg-red-500"></div>
                        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                </div>
                <p className="text-white text-subtitle">Live Contributions: 0</p>
        </div>
    );
}