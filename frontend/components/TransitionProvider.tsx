"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";

const sCurve = [0.87, 0, 0.13, 1] as const;
const DURATION = 0.75;
// After each reveal, reset just offscreen then drift to idle.
const Y_RESET_START = "80%";
const Y_IDLE = "75%";
const RESET_DRIFT_DURATION = 2.5;
const READY_TIMEOUT_MS = 5000;

interface TransitionContextValue {
  navigate: (href: string) => void;
  setPageReadyState: (path: string, isReady: boolean) => void;
  clearPageReadyState: (path: string) => void;
}

const TransitionContext = createContext<TransitionContextValue>({
  navigate: () => {},
  setPageReadyState: () => {},
  clearPageReadyState: () => {},
});

function normalizePath(href: string) {
  const withoutHash = href.split("#")[0] ?? href;
  const withoutQuery = withoutHash.split("?")[0] ?? withoutHash;

  if (typeof window === "undefined") {
    return withoutQuery;
  }

  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return withoutQuery;
  }
}

export function usePageTransition() {
  const { navigate } = useContext(TransitionContext);
  return { navigate };
}

export function useTransitionPageReady(isReady: boolean) {
  const pathname = usePathname();
  const { setPageReadyState, clearPageReadyState } = useContext(TransitionContext);

  useLayoutEffect(() => {
    setPageReadyState(pathname, isReady);
    return () => clearPageReadyState(pathname);
  }, [pathname, isReady, setPageReadyState, clearPageReadyState]);
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const controls = useAnimationControls();

  const phaseRef = useRef<"idle" | "covering" | "covered" | "revealing">("idle");
  const pathnameRef = useRef(pathname);
  const [blocking, setBlocking] = useState(false);
  const prevPathRef = useRef(pathname);
  const pendingHrefRef = useRef<string | null>(null);
  const driftingRef = useRef(false);
  const activePathRef = useRef<string | null>(null);
  const readyPathRef = useRef<string | null>(null);
  const pageReadyKnownRef = useRef(false);
  const pageReadyRef = useRef(true);
  const readyTimeoutRef = useRef<number | null>(null);
  const tryAdvanceRef = useRef<() => void>(() => {});
  const startTransitionRef = useRef<(href: string) => void>(() => {});

  pathnameRef.current = pathname;

  const clearReadyTimeout = useCallback(() => {
    if (readyTimeoutRef.current === null || typeof window === "undefined") return;
    window.clearTimeout(readyTimeoutRef.current);
    readyTimeoutRef.current = null;
  }, []);

  const resetReadyGate = useCallback(() => {
    clearReadyTimeout();
    readyPathRef.current = null;
    pageReadyKnownRef.current = false;
    pageReadyRef.current = true;
  }, [clearReadyTimeout]);

  const pushCoveredNavigation = useCallback(
    (href: string) => {
      activePathRef.current = normalizePath(href);
      resetReadyGate();

      try {
        router.prefetch(href);
      } catch {
        // Prefetch is opportunistic and should never block navigation.
      }

      router.push(href);
    },
    [resetReadyGate, router]
  );

  const startReveal = useCallback(() => {
    if (phaseRef.current !== "covered") return;

    phaseRef.current = "revealing";
    clearReadyTimeout();

    controls
      .start({ y: "-100%", transition: { duration: DURATION, ease: sCurve } })
      .then(() => {
        controls.set({ y: Y_RESET_START });
        activePathRef.current = null;
        resetReadyGate();
        phaseRef.current = "idle";
        setBlocking(false);

        const queuedHrefAfterReveal = pendingHrefRef.current;
        pendingHrefRef.current = null;
        if (
          queuedHrefAfterReveal &&
          normalizePath(queuedHrefAfterReveal) !== pathnameRef.current
        ) {
          startTransitionRef.current(queuedHrefAfterReveal);
          return;
        }

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
  }, [clearReadyTimeout, controls, resetReadyGate]);

  const tryAdvanceTransition = useCallback(() => {
    if (phaseRef.current === "idle" || phaseRef.current === "revealing") {
      return;
    }

    if (phaseRef.current === "covered") {
      const queuedHref = pendingHrefRef.current;
      if (queuedHref) {
        const queuedPath = normalizePath(queuedHref);
        if (queuedPath !== pathnameRef.current) {
          pendingHrefRef.current = null;
          pushCoveredNavigation(queuedHref);
          return;
        }
        pendingHrefRef.current = null;
      }
    }

    const activePath = activePathRef.current;
    if (!activePath || pathnameRef.current !== activePath) return;
    if (phaseRef.current !== "covered") return;

    if (pageReadyKnownRef.current && !pageReadyRef.current) {
      if (readyTimeoutRef.current === null && typeof window !== "undefined") {
        readyTimeoutRef.current = window.setTimeout(() => {
          readyTimeoutRef.current = null;
          pageReadyKnownRef.current = false;
          pageReadyRef.current = true;
          tryAdvanceRef.current();
        }, READY_TIMEOUT_MS);
      }
      return;
    }

    clearReadyTimeout();
    startReveal();
  }, [clearReadyTimeout, pushCoveredNavigation, startReveal]);

  tryAdvanceRef.current = tryAdvanceTransition;

  const startTransitionTo = useCallback(
    (href: string) => {
      phaseRef.current = "covering";
      setBlocking(true);

      void controls
        .start({
          y: "0%",
          transition: { duration: DURATION, ease: sCurve },
        })
        .then(() => {
          if (phaseRef.current !== "covering") return;
          phaseRef.current = "covered";

          const queuedHref = pendingHrefRef.current;
          if (queuedHref) {
            pendingHrefRef.current = null;
            if (normalizePath(queuedHref) !== pathnameRef.current) {
              pushCoveredNavigation(queuedHref);
              tryAdvanceRef.current();
              return;
            }
          }

          // Only start routing once the wipe fully covers the current page.
          pushCoveredNavigation(href);
          tryAdvanceRef.current();
        });
    },
    [controls, pushCoveredNavigation]
  );

  startTransitionRef.current = startTransitionTo;

  const setPageReadyState = useCallback(
    (path: string, isReady: boolean) => {
      if (path !== pathnameRef.current) return;

      readyPathRef.current = path;
      pageReadyKnownRef.current = true;
      pageReadyRef.current = isReady;

      if (isReady) {
        clearReadyTimeout();
      }

      tryAdvanceRef.current();
    },
    [clearReadyTimeout]
  );

  const clearPageReadyState = useCallback(
    (path: string) => {
      if (readyPathRef.current !== path) return;
      resetReadyGate();
    },
    [resetReadyGate]
  );

  const navigate = useCallback(
    (href: string) => {
      const targetPath = normalizePath(href);
      if (targetPath === pathnameRef.current) return;

      if (driftingRef.current) {
        driftingRef.current = false;
        controls.stop();
      }

      if (phaseRef.current !== "idle") {
        pendingHrefRef.current = href;
        if (phaseRef.current === "covered") {
          tryAdvanceRef.current();
        }
        return;
      }

      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        router.push(href);
        return;
      }

      startTransitionRef.current(href);
    },
    [controls, router]
  );

  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    tryAdvanceTransition();
  }, [pathname, tryAdvanceTransition]);

  useEffect(() => {
    return () => clearReadyTimeout();
  }, [clearReadyTimeout]);

  // Intercept all internal <a> clicks in capture phase so we can finish
  // the cover animation before handing navigation off to Next.js.
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
    <TransitionContext.Provider
      value={{ navigate, setPageReadyState, clearPageReadyState }}
    >
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
