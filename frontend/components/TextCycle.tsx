"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
  className = "",
}: TextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const queue = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
      return id;
    };

    const runWordTransition = () => {
      setIsVisible(false);
      queue(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsVisible(true);
      }, fadeTime);
    };

    timersRef.current = [];

    queue(() => {
      runWordTransition();
      intervalRef.current = setInterval(runWordTransition, interval);
    }, initialDelay);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [words, interval, fadeTime, initialDelay]);

  const placeholderText = words.reduce((a, b) =>
    a.length > b.length ? a : b
  );

  const fadeDuration = fadeTime / 1000;
  const underlineTransition = reduceMotion
    ? { duration: 0 }
    : {
        delay: underlineDelay / 1000,
        duration: 0.7,
        ease: "easeOut" as const,
      };

  return (
    <span className={`relative inline font-semibold font-inherit ${className}`}>
      <motion.span
        className="inline-block"
        initial={false}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: fadeDuration, ease: "easeInOut" }}
      >
        <span className="relative inline-block">
          {words[currentIndex]}
          <motion.span
            key={currentIndex}
            aria-hidden
            className="pointer-events-none absolute left-0 top-full mt-0.5 block h-0.5 w-full origin-left rounded-sm bg-red-500"
            style={{ transformOrigin: "0% 50%" }}
            initial={{ scaleX: reduceMotion ? 1 : 0.02 }}
            animate={{ scaleX: 1 }}
            transition={underlineTransition}
          />
        </span>
      </motion.span>
      <span className="invisible absolute">{placeholderText}</span>
    </span>
  );
}
