"use client";

import { useState } from "react";

export default function Home() {
    const [class1, setClass1] = useState<string>("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClass1(e.target.value);
    };

    return (
        <div className="bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:8vw_8vw] md:bg-[size:4vw_4vw] h-[100vh] pt-[18vh] relative overflow-hidden">
            <div className="absolute w-[100vh] h-[70vh] bg-gradient-to-br from-yellow-500 via-red-100 to-orange-500 blur-[100px] top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-[pulse_9s_ease-in_infinite] rounded-full opacity-25"></div>
            <div className="absolute w-[100vh] h-[70vh] bg-gradient-to-br from-blue-500 via-pink-200 to-green-800 blur-[100px] top-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2 animate-[pulse_7s_ease-in-out_infinite] rounded-full opacity-25"></div>
            <div className="w-1/2 mx-auto flex flex-col gap-5 justify-center align-center text-center z-50 relative">
                <h1 className="text-xl">Enter GPA /12</h1>
                <input
                    className="border-2 border-gray-200 p-2 rounded-sm border-none outline-none bg-[#202020] w-1/3 mx-auto focus:w-3/8 transition-all duration-300 opactiy-50" 
                    type="class1"
                    placeholder="Math 1ZA3"
                    value={class1}
                    onChange={handleInputChange}
                />
                <input
                    className="border-2 border-gray-200 p-2 rounded-sm border-none outline-none bg-[#202020] w-1/3 mx-auto focus:w-3/8 transition-all duration-300 opactiy-50" 
                    type="class1"
                    placeholder="Math 1ZB3"
                    value={class1}
                    onChange={handleInputChange}
                />  
                <input
                    className="border-2 border-gray-200 p-2 rounded-sm border-none outline-none bg-[#202020] w-1/3 mx-auto focus:w-3/8 transition-all duration-300 opactiy-50" 
                    type="class1"
                    placeholder="Math 1ZC3"
                    value={class1}
                    onChange={handleInputChange}
                />  
                <input
                    className="border-2 border-gray-200 p-2 rounded-sm border-none outline-none bg-[#202020] w-1/3 mx-auto focus:w-3/8 transition-all duration-300 opactiy-50" 
                    type="class1"
                    placeholder="Physics 1D03"
                    value={class1}
                    onChange={handleInputChange}
                />
                <input
                    className="border-2 border-gray-200 p-2 rounded-sm border-none outline-none bg-[#202020] w-1/3 mx-auto focus:w-3/8 transition-all duration-300 opactiy-50" 
                    type="class1"
                    placeholder="Physics 1E03"
                    value={class1}
                    onChange={handleInputChange}
                />  
                <input
                    className="border-2 border-gray-200 p-2 rounded-sm border-none outline-none bg-[#202020] w-1/3 mx-auto focus:w-3/8 transition-all duration-300 opactiy-50" 
                    type="class1"
                    placeholder="Chemistry 1E03"
                    value={class1}
                    onChange={handleInputChange}
                />  

                <input
                    className="border-2 border-gray-200 p-2 rounded-sm border-none outline-none bg-[#202020] w-1/3 mx-auto focus:w-3/8 transition-all duration-300 opactiy-50" 
                    type="class1"
                    placeholder="Engineering 1P13"
                    value={class1}
                    onChange={handleInputChange}
                />
                <input
                    className="border-2 border-gray-200 p-2 rounded-sm border-none outline-none bg-[#202020] w-1/3 mx-auto focus:w-3/8 transition-all duration-300 opactiy-50" 
                    type="class1"
                    placeholder="Elective 1"
                    value={class1}
                    onChange={handleInputChange}
                />  
                <input
                    className="border-2 border-gray-200 p-2 rounded-sm border-none outline-none bg-[#202020] w-1/3 mx-auto focus:w-3/8 transition-all duration-300 opactiy-50" 
                    type="class1"
                    placeholder="Elective 2"
                    value={class1}
                    onChange={handleInputChange}
                />  
                <button className="bg-white text-black p-2 rounded-sm border-none outline-none w-1/3 mx-auto hover:scale-105 transition-all duration-300 cursor-pointer mt-10">
                    Submit
                </button>
            </div>
        </div>

    );
}