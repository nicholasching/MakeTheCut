"use client";

import React, { useEffect, useRef, useState } from 'react';

const MarqueeText: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const message = "Due to server limitations, we can only support 10 sign-ups per hour. If you receive an error, please try again later.";
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Get the width of the viewport
    const viewportWidth = window.innerWidth;
    
    // Calculate how many copies of the message we need to fill twice the viewport width
    const spanElement = document.createElement('span');
    spanElement.className = "text-blue-300 font-semibold mx-15 inline-block";
    spanElement.textContent = message;
    document.body.appendChild(spanElement);
    const messageWidth = spanElement.getBoundingClientRect().width;
    document.body.removeChild(spanElement);
    
    // Calculate how many copies we need (at least 2x viewport width for seamless scrolling)
    const copiesNeeded = Math.ceil((viewportWidth * 2) / messageWidth) + 1;
    setContentWidth(messageWidth * copiesNeeded);
    
    // Set up window resize handler
    const handleResize = () => {
      const newViewportWidth = window.innerWidth;
      const newCopiesNeeded = Math.ceil((newViewportWidth * 2) / messageWidth) + 1;
      setContentWidth(messageWidth * newCopiesNeeded);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [message]);
  
  // Create array with sufficient copies of the message
  const copies = Math.ceil(contentWidth / 500) + 2; // 500 is an approximation of message width
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ 
        height: '1.25rem' // Adjust height as needed
      }}
    >
      <div 
        className="absolute whitespace-nowrap animate-marquee"
        style={{
          willChange: 'transform',
          minWidth: '200%', // Ensure content wraps around
        }}
      >
        {Array(copies).fill(0).map((_, index) => (
          <span key={index} className="text-blue-300 font-semibold mx-15 text-subtext inline-block">
            {message}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeText;