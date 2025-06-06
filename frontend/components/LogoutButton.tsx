"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { account, database } from "../app/appwrite";
import { Models } from "appwrite";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

interface LogoutButtonProps {
    buttonText?: string;
    className?: string;
}

const LogoutButton = ({ 
}: LogoutButtonProps) => {
    const router = useRouter();
    const [userGraduated, setuserGraduated] = useState<boolean>(true);

    useEffect(() => {
        const checkUserInUserData = async () => {
            try {
                const loggedInUser = await account.get();
                try {
                    await database.getDocument('MacStats', 'UserData24', loggedInUser.$id);
                    setuserGraduated(true);
                    try {
                        await database.getDocument('MacStats', 'StreamData24', loggedInUser.$id);
                    } catch (error) {
                        console.log("User document doesn't exist in 2024 StreamData collection");
                        if (window.location.pathname === '/dashboard') {
                            router.push('/stream');
                            console.log("Redirecting to stream page");
                        }
                    }
                } catch (error) {
                    // User document doesn't exist in 2024 UserData collection
                    setuserGraduated(false);
                    try {
                        await database.getDocument('MacStats', 'UserData', loggedInUser.$id);
                    } catch (error) {
                        console.log("User document doesn't exist in 2024 UserData collection");
                        if (window.location.pathname === '/dashboard') {
                            router.push('/streams');
                            console.log("Redirecting to streams page");
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking user authentication:", error);
            }
        };

        checkUserInUserData();
    }, []);

    const logout = async () => {
        try {
            await account.deleteSession("current");
            // Optionally redirect after logout
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed", error);
        }
    };


    return (
        <AnimatePresence>
            {(
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="absolute top-10 right-10">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="w-7">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="white" className="transition-colors duration-200 hover:fill-neutral-400 hover:scale-105 cursor-pointer w-[1.25vw] min-w-[1rem]">
                                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/>
                                </svg>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="bg-neutral-900 border-none md:w-1/5 w-2/3 pt-10">
                            <DialogTitle className="text-white text-center">
                            </DialogTitle>
                            {!userGraduated ? (
                                <Link href="/streams"><button className="bg-neutral-800 text-white py-2 rounded-sm hover:bg-neutral-700 w-full block cursor-pointer hover:scale-103 transition-all">Edit Stream</button></Link>
                            ) : (
                                <>
                                    <div className="bg-[#e64640] text-white py-2 rounded-sm w-full block text-center">
                                        <div>
                                            <span className="text-white font-bold">Grades Locked</span>
                                        </div>
                                        <div>
                                            Congratulations, you are no longer in Eng 1!
                                        </div>
                                    </div>
                                    <Link href="/stream"><button className="bg-neutral-800 text-white py-2 rounded-sm hover:bg-neutral-700 w-full block cursor-pointer hover:scale-103 transition-all">Edit Stream Admission</button></Link>
                                </>
                            )}
                            <Link href="/"><button className="bg-neutral-800 text-white py-2 rounded-sm hover:bg-neutral-700 w-full block cursor-pointer hover:scale-103 transition-all">Home</button></Link>
                            <button onClick={logout} className="bg-[#e64640] text-white py-2 rounded-sm hover:bg-red-700 w-full block cursor-pointer hover:scale-103 transition-all mt-5">Logout</button>
                        </DialogContent>
                    </Dialog>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LogoutButton;