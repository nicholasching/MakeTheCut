"use client";

import { use, useState, useEffect } from "react";
import { addLog } from "../../actions/logActions";
import { useRouter } from "next/navigation";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import Combobox from "@/components/Combobox";
import ComboboxStreams from "@/components/ComboboxStream";
import LogoutButton from "@/components/LogoutButton";
import { Checkbox } from "@/components/ui/checkbox";
import {account, database, ID} from "../appwrite";

export default function Home() {
    const router = useRouter();
    const [math1za3, setMath1za3] = useState<string>("");
    const [math1zb3, setMath1zb3] = useState<string>("");
    const [math1zc3, setMath1zc3] = useState<string>("");
    const [phys1d03, setPhysics1d03] = useState<string>("");
    const [phys1e03, setPhysics1e03] = useState<string>("");
    const [chem1e03, setChemistry1e03] = useState<string>("");
    const [eng1p13, setEngineering1p13] = useState<string>("");

    const [selectedElective1, setSelectedElective1] = useState<string>("");
    const [selectedElective2, setSelectedElective2] = useState<string>("");
    const [elective1Value, setElective1Value] = useState<string>("");
    const [elective2Value, setElective2Value] = useState<string>("");

    const [stream1Choice, setStream1Choice] = useState<string>("");
    const [stream2Choice, setStream2Choice] = useState<string>("");
    const [stream3Choice, setStream3Choice] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [freechoice, setFreeChoice] = useState<boolean>(false);

    const [status, setStatus] = useState<string>("Submit");

    useEffect(() => {
        async function initiatePage() {
            try {
                let loggedInUser = await account.get();

                try {
                    const pastData = await database.getDocument('MacStats', 'UserData', loggedInUser.$id);
                    setStatus("Update");
                    setMath1za3(pastData.math1za3);
                    setMath1zb3(pastData.math1zb3);
                    setMath1zc3(pastData.math1zc3);
                    setPhysics1d03(pastData.phys1d03);
                    setPhysics1e03(pastData.phys1e03);
                    setChemistry1e03(pastData.chem1e03);
                    setEngineering1p13(pastData.eng1p13);
                    if (pastData.elec1 != "null") {
                        setElective1Value(pastData.elec1.split(',')[1]);
                        setSelectedElective1(pastData.elec1.split(',')[0]);
                    }
                    if (pastData.elec2 != "null") {
                        setElective2Value(pastData.elec2.split(',')[1]);
                        setSelectedElective2(pastData.elec2.split(',')[0]);
                    }
                    setStream1Choice(pastData.streams.split(',')[0]);
                    setStream2Choice(pastData.streams.split(',')[1]);
                    setStream3Choice(pastData.streams.split(',')[2]);
                    setFreeChoice(pastData.freechoice);
                }
                catch (error) {
                    console.error("No previous data:", error);
                }
            }
            catch (error) {
                router.push('/login');
            }
        }
        initiatePage();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
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
                setElective1Value(numericValue);
                break;
            case "elec2":
                setElective2Value(numericValue);
                break;
        }
    };

    const handleElective1Change = (value: string) => {
        setSelectedElective1(value);
        console.log("Selected Elective 1:", value);
    };

    const handleElective2Change = (value: string) => {
        setSelectedElective2(value);
        console.log("Selected Elective 2:", value);
    };

    const handleStream1Change = (value: string) => {
        setStream1Choice(value);
        console.log("Selected Stream 1:", value);
    };

    const handleStream2Change = (value: string) => {
        setStream2Choice(value);
        console.log("Selected Stream 2:", value);
    };

    const handleStream3Change = (value: string) => {
        setStream3Choice(value);
        console.log("Selected Stream 3:", value);
    };

    const handleFreeChoiceChange = (checked: boolean | string) => {
        const isChecked = checked === true;
        setFreeChoice(isChecked);
        console.log("Free choice selection:", isChecked);
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            // Validate input values
            const gradesToCheck = [
                { name: 'Math 1ZA3', value: math1za3 },
                { name: 'Math 1ZB3', value: math1zb3 },
                { name: 'Math 1ZC3', value: math1zc3 },
                { name: 'Physics 1D03', value: phys1d03 },
                { name: 'Physics 1E03', value: phys1e03 },
                { name: 'Chemistry 1E03', value: chem1e03 },
                { name: 'Engineering 1P13', value: eng1p13 },
                { name: 'Elective 1', value: elective1Value },
                { name: 'Elective 2', value: elective2Value }
            ];

            for (const grade of gradesToCheck) {
                if (grade.value) {
                    const numValue = parseInt(grade.value);
                    if (isNaN(numValue) || numValue < 0 || numValue > 12) {
                        setError(` ${grade.name} grade must be between 0 and 12.`);
                        setIsSubmitting(false);
                        return;
                    }
                }
            }

            let elec1 = selectedElective1 + "," + elective1Value;
            let elec2 = selectedElective2 + "," + elective2Value;
            let streams = stream1Choice + "," + stream2Choice + "," + stream3Choice;

            const gradesData = {
                math1za3,
                math1zb3,
                math1zc3,
                phys1d03,
                phys1e03,
                chem1e03,
                eng1p13,
                elec1,
                elec2,
                streams,
                freechoice
            };

            console.log("Submitting grades with electives and streams:", gradesData);
            await addLog(gradesData);
            router.push('/dashboard'); 
        } catch (err) {
            console.error("Error submitting data:", err);
            setError("Failed to submit data. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GridBackground className="pt-30 pb-20 overflow-y-scroll">
            <HomeButton />
            <LogoutButton />
            <h1 className="text-center text-subtext text-neutral-400 hover:text-white transition-all">Input your GPA for each class (out of 12) <br /> and your preferred streams (1-3):</h1>
            <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 flex flex-col mx-auto justify-center align-center gap-5 text-center  py-10 rounded-md">
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="math1za3" placeholder="Math 1ZA3" value={math1za3} onChange={handleInputChange} maxLength={2} />
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="math1zb3" placeholder="Math 1ZB3" value={math1zb3} onChange={handleInputChange} maxLength={2} />
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="math1zc3" placeholder="Math 1ZC3" value={math1zc3} onChange={handleInputChange} maxLength={2} />
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="physics1d03" placeholder="Physics 1D03" value={phys1d03} onChange={handleInputChange} maxLength={2} />
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="physics1e03" placeholder="Physics 1E03" value={phys1e03} onChange={handleInputChange} maxLength={2} />  
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="chemistry1e03" placeholder="Chemistry 1E03" value={chem1e03} onChange={handleInputChange} maxLength={2} />  
                <input className="text-subtext border-2 border-transparent p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="engineering1p13" placeholder="Engineering 1P13" value={eng1p13} onChange={handleInputChange} maxLength={2} />
                <div>
                    <input className="text-subtext border-2 border-transparent p-2 rounded-t-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="elec1" placeholder="Elective 1 Grade" value={elective1Value} onChange={handleInputChange} maxLength={2}/>  
                    <Combobox value={selectedElective1} onChange={handleElective1Change}placeholder="Select first elective"/>
                </div>
                <div>
                    <input className="text-subtext border-2 border-transparent p-2 rounded-t-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" inputMode="numeric" name="elec2" placeholder="Elective 2 Grade" value={elective2Value} onChange={handleInputChange} maxLength={2} />  
                    <Combobox value={selectedElective2} onChange={handleElective2Change}placeholder="Select second elective"/>
                </div>
                <ComboboxStreams value={stream1Choice} onChange={handleStream1Change}placeholder="First Stream Choice" />
                <ComboboxStreams value={stream2Choice} onChange={handleStream2Change}placeholder="Second Stream Choice" />
                <ComboboxStreams value={stream3Choice} onChange={handleStream3Change}placeholder="Third Stream Choice" />
                <div className="flex gap-2 mx-auto">
                    <Checkbox 
                        checked={freechoice}
                        onCheckedChange={handleFreeChoiceChange}
                    />
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I have free choice
                    </label>
                </div>
                {error && <p className="text-red-500 mt-2 text-xs">{error}</p>}
                <button className="text-subtext bg-white text-black w-1/3 p-2 rounded-sm border-none mx-auto hover:scale-105 transition-all duration-300 cursor-pointer mt-5"onClick={handleSubmit}disabled={isSubmitting}> {isSubmitting ? "Submitting..." : status}</button>
            </div>
        </GridBackground>
    );
}