"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";

const sCurve = [0.87, 0, 0.13, 1] as const;
const DURATION = 0.75;
// After each reveal, reset just offscreen then drift to idle.
const Y_RESET_START = "80%";
const Y_IDLE = "70%";
const RESET_DRIFT_DURATION = 2.5;

interface TransitionContextValue {
  navigate: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextValue>({
  navigate: () => {},
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const controls = useAnimationControls();

  // Track animation phase without causing re-renders
  const phaseRef = useRef<"idle" | "covering" | "covered" | "revealing">("idle");
  const [blocking, setBlocking] = useState(false);
  const prevPathRef = useRef(pathname);
  const pendingHrefRef = useRef<string | null>(null);
  const driftingRef = useRef(false);

  // Step 1 of the wipe: cover the current page, then hand off to router.
  // If we're already animating, queue the latest target route.
  const navigate = useCallback(
    async (href: string) => {
      if (href === pathname) return;

      // If we're in idle drift, interrupt and begin the swipe immediately
      // from the current visual position instead of snapping to a preset y.
      if (driftingRef.current) {
        driftingRef.current = false;
        controls.stop();
      }

      if (phaseRef.current !== "idle") {
        pendingHrefRef.current = href;
        return;
      }

      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        router.push(href);
        return;
      }

      phaseRef.current = "covering";
      setBlocking(true);
      await controls.start({
        y: "0%",
        transition: { duration: DURATION, ease: sCurve },
      });
      phaseRef.current = "covered";
      // Navigate now — new page mounts behind the overlay
      router.push(href);
    },
    [controls, router, pathname]
  );

  // Step 2 of the wipe: when the new page has mounted (pathname changed),
  // either consume queued routes while covered, or reveal when settled.
  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    if (phaseRef.current !== "covered") return;

    const queuedHrefBeforeReveal = pendingHrefRef.current;
    if (queuedHrefBeforeReveal && queuedHrefBeforeReveal !== pathname) {
      pendingHrefRef.current = null;
      router.push(queuedHrefBeforeReveal);
      return;
    }

    phaseRef.current = "revealing";
    controls
      .start({ y: "-100%", transition: { duration: DURATION, ease: sCurve } })
      .then(() => {
        controls.set({ y: Y_RESET_START });
        phaseRef.current = "idle";
        setBlocking(false);

        // If a route was queued during reveal, run a fresh full transition.
        const queuedHrefAfterReveal = pendingHrefRef.current;
        pendingHrefRef.current = null;
        if (queuedHrefAfterReveal && queuedHrefAfterReveal !== pathname) {
          void navigate(queuedHrefAfterReveal);
          return;
        }

        // When nothing is queued, gently settle from reset to idle.
        driftingRef.current = true;
        void controls
          .start({
            y: Y_IDLE,
            transition: { duration: RESET_DRIFT_DURATION, ease: sCurve },
          })
          .finally(() => {
            driftingRef.current = false;
          });
      });
  }, [pathname, controls, router, navigate]);

  // Intercept all internal <a> clicks in capture phase so we run
  // the cover animation BEFORE Next.js navigates.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Leave external, mailto, tel, hash, and new-tab links alone
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        href.startsWith("//") ||
        anchor.target === "_blank"
      )
        return;

      // Let modifier-key combos (open in new tab, etc.) pass through
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();
      // stopPropagation in capture so Next.js Link's bubble handler
      // doesn't also navigate before our animation finishes.
      e.stopPropagation();
      navigate(href);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [navigate]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-[-20vh] h-[150vh] z-[9999] bg-gradient-to-br from-[#0a0908] to-[#2c1204]"
        style={{
          pointerEvents: blocking ? "auto" : "none",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 13.333%, black 80%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 13.333%, black 80%, transparent 100%)",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
        initial={{ y: Y_IDLE }}
        animate={controls}
      />
    </TransitionContext.Provider>
  );
}
