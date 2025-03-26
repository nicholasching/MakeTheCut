"use client";

import React from 'react';

export default function ScrollButton() {
  const handleClick = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <button 
      onClick={handleClick}
      className="bg-white py-2 md:w-40 rounded-sm hover:scale-105 transition-transform duration-200 cursor-pointer text-black"
    >
      Learn More
    </button>
  );
}