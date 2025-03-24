"use client";
import { useState, useEffect, useMemo } from "react";

export const engineeringMajors = [
    "Mechanical",
    "Computer",
    "Software",
    "Mechatronics",
    "Electrical",
    "Chemical",
    "Civil",
    "Materials",
];

interface TextCycleProps {
  words: string[];
  interval?: number;
  fadeTime?: number;
  underlineDelay?: number;
  initialDelay?: number;
}

export default function TextCycle({ 
  words, 
  interval = 4000, 
  fadeTime = 500,
  underlineDelay = 200,
  initialDelay = 2000
}: TextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showUnderline, setShowUnderline] = useState(false); // Start with underline hidden
  
  // Find the longest word to determine the container width
  const longestWord = useMemo(() => {
    return words.reduce((longest, current) => 
      current.length > longest.length ? current : longest
    , "");
  }, [words]);
  
  useEffect(() => {
    // First show the underline on initial load
    const firstUnderlineTimeout = setTimeout(() => {
      setShowUnderline(true);
    }, underlineDelay);
    
    // Then start the regular cycle after initial delay
    const initialTimeout = setTimeout(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setShowUnderline(false);
        
        setTimeout(() => {
          setCurrentIndex((prevIndex) => 
            (prevIndex + 1) % words.length
          );
          setIsVisible(true);
          
          setTimeout(() => {
            setShowUnderline(true);
          }, underlineDelay);
        }, 300);
        
      }, fadeTime);
      
      // Setup regular interval only after the first animation completes
      const cycleInterval = setInterval(() => {
        setIsVisible(false);
        
        setTimeout(() => {
          setShowUnderline(false);
          
          setTimeout(() => {
            setCurrentIndex((prevIndex) => 
              (prevIndex + 1) % words.length
            );
            setIsVisible(true);
            
            setTimeout(() => {
              setShowUnderline(true);
            }, underlineDelay);
          }, 300);
          
        }, fadeTime);
        
      }, interval);
      
      return () => clearInterval(cycleInterval);
    }, initialDelay);
    
    return () => {
      clearTimeout(firstUnderlineTimeout);
      clearTimeout(initialTimeout);
    };
  }, [words, interval, fadeTime, underlineDelay, initialDelay]);
  
  return (
    <span 
      className="inline-block font-bold"
      style={{ 
        width: `${longestWord.length}ch`,
        position: 'relative'
      }}
    >
      <span 
        className={`absolute left-0 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {words[currentIndex]}
        {/* Animated underline */}
        <span 
          className={`absolute left-0 bottom-0 h-[2px] bg-red-500 transition-all duration-1000 ease-out`}
          style={{ 
            width: showUnderline ? '100%' : '0%',
            transformOrigin: 'left',
            opacity: showUnderline ? 1 : 0
          }}
        ></span>
      </span>
      <span className="invisible">{longestWord}</span>
    </span>
  );
}