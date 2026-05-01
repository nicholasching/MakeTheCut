"use client";
import { useEffect, useState } from "react";
import { usePageTransition } from "@/components/TransitionProvider";
import { account } from "../app/appwrite";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ADMISSION } from "@/lib/appwriteDb";
import { getCohortAccess } from "@/lib/scheduleConfig";
import { getAccountCached, getUserDocCached } from "@/lib/appwriteCache";

const SPECTATOR_ADMIT_YEAR = 99;

interface LogoutButtonProps {
    buttonText?: string;
    className?: string;
}

const LogoutButton = ({
}: LogoutButtonProps) => {
    const { navigate } = usePageTransition();
    const [isDataLocked, setIsDataLocked] = useState(false);
    const [isSpectator, setIsSpectator] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function loadLockState() {
            try {
                const user = await getAccountCached();
                const doc = await getUserDocCached(user.$id);
                const admitYear = Number(doc.admitYear) || ADMISSION.current;
                const spectator = admitYear === SPECTATOR_ADMIT_YEAR;
                setIsSpectator(spectator);
                const access = getCohortAccess(admitYear);
                const editable =
                    access.canEditStreamPrefs ||
                    access.canEditSem1Grades ||
                    access.canEditAllGrades ||
                    access.canEditStreamResults;
                if (!cancelled) setIsDataLocked(spectator || !editable);
            } catch {
                if (!cancelled) {
                  setIsSpectator(false);
                  setIsDataLocked(false);
                }
            }
        }
        loadLockState();
        return () => {
            cancelled = true;
        };
    }, []);

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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="absolute top-10 right-5 sm:right-10">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                className="flex max-md:size-8 cursor-pointer items-center justify-center md:h-7 md:w-7 lg:h-8 lg:w-8"
                                aria-label="Account menu"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="white" className="max-sm:size-7 max-md:size-full transition-colors duration-200 hover:fill-neutral-400 hover:scale-105 md:min-w-[2rem] md:h-auto lg:min-w-[2rem] lg:w-[1.5vw]">
                                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/>
                                </svg>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="bg-neutral-900 border-none md:w-2/5 w-2/3 pt-10">
                            <DialogTitle className="text-white text-center">
                            </DialogTitle>
                            {isDataLocked ? (
                                <button
                                    type="button"
                                    disabled
                                    aria-disabled="true"
                                    className="text-white py-2 rounded-sm w-full block bg-[#e64640] opacity-90 cursor-not-allowed"
                                >
                                    Data is Now Locked
                                </button>
                            ) : (
                                <Link href="/me">
                                    <button
                                        type="button"
                                        className="text-white py-2 rounded-sm w-full block cursor-pointer hover:scale-103 transition-all bg-neutral-800 hover:bg-neutral-700"
                                    >
                                        Edit My Data
                                    </button>
                                </Link>
                            )}
                            <Link href="/contact">
                                <button
                                    type="button"
                                    className="bg-neutral-800 text-white py-2 rounded-sm hover:bg-neutral-700 w-full block cursor-pointer hover:scale-103 transition-all"
                                >
                                    Contact Us
                                </button>
                            </Link>
                            <button onClick={logout} className="bg-[#e64640] text-white py-2 rounded-sm hover:bg-red-700 w-full block cursor-pointer hover:scale-103 transition-all mt-5">Logout</button>
                        </DialogContent>
                    </Dialog>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LogoutButton;
