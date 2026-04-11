"use client";
import { usePageTransition } from "@/components/TransitionProvider";
import { account } from "../app/appwrite";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

interface LogoutButtonProps {
    buttonText?: string;
    className?: string;
}

const LogoutButton = ({
}: LogoutButtonProps) => {
    const { navigate } = usePageTransition();

    const logout = async () => {
        try {
            await account.deleteSession("current");
            navigate("/login");
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
                            <button
                                type="button"
                                className="flex max-md:size-8 cursor-pointer items-center justify-center md:h-7 md:w-7 lg:h-8 lg:w-8"
                                aria-label="Account menu"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="white" className="max-md:size-full transition-colors duration-200 hover:fill-neutral-400 hover:scale-105 md:min-w-[2rem] md:h-auto lg:min-w-[2rem] lg:w-[1.5vw]">
                                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/>
                                </svg>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="bg-neutral-900 border-none md:w-2/5 w-2/3 pt-10">
                            <DialogTitle className="text-white text-center">
                            </DialogTitle>
                            <Link href="/me">
                                <button
                                    type="button"
                                    className="bg-neutral-800 text-white py-2 rounded-sm hover:bg-neutral-700 w-full block cursor-pointer hover:scale-103 transition-all"
                                >
                                    Edit My Data
                                </button>
                            </Link>
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
