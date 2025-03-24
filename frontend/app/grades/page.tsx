"use client";

import { useState } from "react";
import { addLog } from "../../actions/logActions";
import { useRouter } from "next/navigation";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import Combobox from "@/components/Combobox";

export default function Home() {
    const router = useRouter();
    const [math1za3, setMath1za3] = useState<string>("");
    const [math1zb3, setMath1zb3] = useState<string>("");
    const [math1zc3, setMath1zc3] = useState<string>("");
    const [physics1d03, setPhysics1d03] = useState<string>("");
    const [physics1e03, setPhysics1e03] = useState<string>("");
    const [chemistry1e03, setChemistry1e03] = useState<string>("");
    const [engineering1p13, setEngineering1p13] = useState<string>("");
    const [elec1, setElec1] = useState<string>("");
    const [elec2, setElec2] = useState<string>("");
    
    // Add state for selected elective courses
    const [selectedElective1, setSelectedElective1] = useState<string>("");
    const [selectedElective2, setSelectedElective2] = useState<string>("");
    
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Handle change for regular input fields
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Only allow numbers and limit to 2 characters
        const numericValue = value.replace(/[^0-9]/g, '').slice(0, 2);
        
        switch (name) {
            case "math1za3":
                setMath1za3(numericValue);
                break;
            case "math1zb3":
                setMath1zb3(numericValue);
                break;
            case "math1zc3":
                setMath1zc3(numericValue);
                break;
            case "physics1d03":
                setPhysics1d03(numericValue);
                break;
            case "physics1e03":
                setPhysics1e03(numericValue);
                break;
            case "chemistry1e03":
                setChemistry1e03(numericValue);
                break;
            case "engineering1p13":
                setEngineering1p13(numericValue);
                break;
            case "elec1":
                setElec1(numericValue);
                break;
            case "elec2":
                setElec2(numericValue);
                break;
        }
    };

    // Handle change for elective 1 combobox
    const handleElective1Change = (value: string) => {
        setSelectedElective1(value);
        console.log("Selected Elective 1:", value);
    };

    // Handle change for elective 2 combobox
    const handleElective2Change = (value: string) => {
        setSelectedElective2(value);
        console.log("Selected Elective 2:", value);
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            // Create grades object to send to logActions
            const gradesData = {
                math1za3,
                math1zb3,
                math1zc3,
                physics1d03,
                physics1e03,
                chemistry1e03,
                engineering1p13,
                elec1,
                elec2,
                // Add the selected elective course codes
                elective1Course: selectedElective1,
                elective2Course: selectedElective2
            };

            console.log("Submitting grades with electives:", gradesData);

            // Call the addLog function with the grades data
            const response = await addLog(gradesData);
            
            console.log("Grades submitted successfully:", response);
            
            // Optional: Redirect to a success page or dashboard
            router.push('/dashboard'); // Adjust this path as needed
            
        } catch (err) {
            console.error("Error submitting grades:", err);
            setError("Failed to submit grades. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GridBackground className="pt-20">
            <HomeButton />
            <div className="w-3/4 md:w-1/3 lg:w-1/4 flex flex-col gap-4 mx-auto text-center">
                <h1 className="text-xl text-white">Enter GPA /12</h1>
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="math1za3" placeholder="Math 1ZA3" value={math1za3} onChange={handleInputChange} maxLength={2} />
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="math1zb3" placeholder="Math 1ZB3" value={math1zb3} onChange={handleInputChange} maxLength={2} />
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="math1zc3" placeholder="Math 1ZC3" value={math1zc3} onChange={handleInputChange} maxLength={2} />
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="physics1d03" placeholder="Physics 1D03" value={physics1d03} onChange={handleInputChange} maxLength={2} />
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="physics1e03" placeholder="Physics 1E03" value={physics1e03} onChange={handleInputChange} maxLength={2} />  
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="chemistry1e03" placeholder="Chemistry 1E03" value={chemistry1e03} onChange={handleInputChange} maxLength={2} />  
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="engineering1p13" placeholder="Engineering 1P13" value={engineering1p13} onChange={handleInputChange} maxLength={2} />  
                
                <div className="space-y-1">
                    <input 
                        className="text-subtext border-2 border-transparent p-2 rounded-t-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" 
                        type="text" 
                        inputMode="numeric" 
                        name="elec1" 
                        placeholder="Elective 1 Grade" 
                        value={elec1} 
                        onChange={handleInputChange} 
                        maxLength={2} 
                    />  
                    <Combobox 
                        value={selectedElective1} 
                        onChange={handleElective1Change}
                        placeholder="Select first elective" 
                    />
                </div>
                
                <div className="space-y-1">
                    <input 
                        className="text-subtext border-2 border-transparent p-2 rounded-t-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" 
                        type="text" 
                        inputMode="numeric" 
                        name="elec2" 
                        placeholder="Elective 2 Grade" 
                        value={elec2} 
                        onChange={handleInputChange} 
                        maxLength={2} 
                    />  
                    <Combobox 
                        value={selectedElective2} 
                        onChange={handleElective2Change}
                        placeholder="Select second elective" 
                    />
                </div>
                
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <button 
                    className="bg-white text-black p-2 rounded-sm border-none w-1/3 mx-auto hover:scale-105 transition-all duration-300 cursor-pointer mt-5"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
            </div>
        </GridBackground>
    );
}