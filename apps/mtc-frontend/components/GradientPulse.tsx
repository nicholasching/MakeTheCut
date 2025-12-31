"use client";

import React, { useEffect, useState, useRef } from 'react';

interface GradientPulseProps {
  className?: string;
}

const GradientPulse: React.FC<GradientPulseProps> = ({ className = '' }) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const lastScrollY = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Calculate how much we've scrolled since last check (positive for down, negative for up)
      const scrollChange = currentScrollY - lastScrollY.current;
      
      // Update the offset (increased range and multiplier for more leftward movement)
      setScrollOffset(prev => {
        const newOffset = Math.max(-1000, Math.min(0, prev - scrollChange * 0.7));
        return newOffset;
      });
      
      // Remember current scroll position for next time
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div 
      style={{ 
      transform: `translate(calc(50% + ${scrollOffset}px), 50%)`,
      transition: 'transform 0.1s ease-out'
      }}
      className={`
      absolute
      w-[200vw]
      h-[200vw]
      md:w-[125vw]
      md:h-[125vw]
      lg:w-[75vw]
      lg:h-[75vw]
      bg-gradient-to-br 
      from-blue-800 
      via-orange-700 
      to-orange-900 
      blur-3xl
      bottom-[75svh] 
      right-0 
      animate-[pulse_7s_ease-in-out_infinite]
      opacity-25 
      rounded-full
      ${className}
      `}
    />
  );
};

export default GradientPulse;