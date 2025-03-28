"use client";
import { useState, useEffect } from "react";

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
  className?: string;
}

export default function TextCycle({ 
  words, 
  interval = 4000, 
  fadeTime = 500,
  underlineDelay = 200,
  initialDelay = 2000,
  className = ""
}: TextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showUnderline, setShowUnderline] = useState(false);
  
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
  
  // Get max width by measuring all words
  const placeholderText = words.reduce((a, b) => 
    a.length > b.length ? a : b
  );
  
  return (
    <span className={`inline font-semibold font-inherit relative ${className}`}>
      <span className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {words[currentIndex]}
        {/* Animated underline */}
        <span 
          className={`absolute left-0 bottom-0 md:bottom-3 h-0.5 transform bg-red-500 transition-all duration-1000 ease-out -z-10 ${
            showUnderline ? 'w-full opacity-100' : 'w-0 opacity-0'
          }`}
        ></span>
      </span>
      {/* Placeholder to maintain width */}
      <span className="invisible absolute">{placeholderText}</span>
    </span>
  );
}
