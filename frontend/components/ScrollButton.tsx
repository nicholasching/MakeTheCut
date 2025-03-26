"use client";

import React, { useState } from 'react';
import { ArrowDown } from 'lucide-react';

export default function ScrollButton() {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    };

    return (
        <button 
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-white py-2 md:w-40 rounded-sm hover:scale-105 transition-transform duration-200 cursor-pointer text-black flex items-center justify-center w-30 mx-auto md:mx-0"
        >
            <div className="relative h-6 w-full flex items-center justify-center">
                <span 
                    className={`absolute transition-all duration-300 ease-in-out ${isHovered ? '-translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}
                >
                    Learn More
                </span>
                <ArrowDown 
                    className={`absolute transition-all duration-300 ease-in-out ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} 
                    size={20}
                />
            </div>
        </button>
    );
}