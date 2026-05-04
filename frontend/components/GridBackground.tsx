'use client';

import React, { ReactNode, forwardRef, useState, useCallback, useRef, useEffect } from 'react';

const LERP_MIN = 0.01; // Min factor when close (smooth settle)
const LERP_MAX = 0.10; // Max factor when far (quick jump)
const LERP_DISTANCE = 250; // Distance at which max lerp kicks in (px)
const SHIMMER_BASE_RADIUS = 500;
const SHIMMER_MIN_RADIUS = 100; // Shrinks to this when far
const SHIMMER_DISTANCE = 250; // Distance at which bunch-up is full (px)
const BUNCH_RATIO_LERP_SHRINK = 0.20; // Slower when shrinking (sticky – resists)
const BUNCH_RATIO_LERP_EXPAND = 0.10; // Faster when expanding (springy – snaps back)
const INTENSITY_CENTER_REST = 0.4;
const INTENSITY_CENTER_BUNCHED = 0.75;
const INTENSITY_MID_REST = 0.2;
const INTENSITY_MID_BUNCHED = 0.45;
/** Outside <main> but still lerping to last in-bounds target — stop React updates once close enough. */
const SETTLE_DIST_EPS = 0.75;
const SETTLE_BUNCH_EPS = 0.03;

// Strong s-curve: slow start, fast middle, slow end (like modal zoom-in)
function smootherstep(t: number): number {
    const x = Math.max(0, Math.min(1, t));
    return x * x * x * (x * (x * 6 - 15) + 10);
}

interface GridBackgroundProps {
    children?: ReactNode;
    className?: string;
}

type ShimmerState = {
    pos: { x: number; y: number };
    smoothedBunchRatio: number;
};

const GridBackground = forwardRef<HTMLElement, GridBackgroundProps>(({ children, className = '' }, ref) => {
    const [shimmerState, setShimmerState] = useState<ShimmerState | null>(null);
    const targetPosRef = useRef<{ x: number; y: number } | null>(null);
    const rafRef = useRef<number>(0);
    /** Last rendered shimmer position/bunch so re-entry after leave lerps from here instead of snapping. */
    const lastSmoothedPosRef = useRef<{ x: number; y: number } | null>(null);
    const lastSmoothedBunchRef = useRef(0);
    const pointerInsideRef = useRef(false);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        pointerInsideRef.current = true;
        const rect = e.currentTarget.getBoundingClientRect();
        targetPosRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    const handleMouseLeave = useCallback(() => {
        pointerInsideRef.current = false;
    }, []);

    useEffect(() => {
        const animate = () => {
            const target = targetPosRef.current;
            // target stays at last in-bounds mouse position after leave so lerping can finish there.
            if (target !== null) {
                setShimmerState((prev) => {
                    const prevPos = prev?.pos ?? lastSmoothedPosRef.current ?? target;
                    const dx = target.x - prevPos.x;
                    const dy = target.y - prevPos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Shimmer position lerp (same path for first hover and re-entry after leave)
                    const posLerp = (() => {
                        const t = Math.min(distance / LERP_DISTANCE, 1);
                        const eased = smootherstep(t);
                        const factor = LERP_MIN + (LERP_MAX - LERP_MIN) * eased;
                        return {
                            x: prevPos.x + dx * factor,
                            y: prevPos.y + dy * factor,
                        };
                    })();

                    // Smoothed bunch ratio – sticky when shrinking, springy when expanding
                    const targetBunchRatio = Math.min(distance / SHIMMER_DISTANCE, 1);
                    const prevBunch = prev?.smoothedBunchRatio ?? lastSmoothedBunchRef.current;
                    const shrinking = targetBunchRatio > prevBunch;
                    const lerpFactor = shrinking ? BUNCH_RATIO_LERP_SHRINK : BUNCH_RATIO_LERP_EXPAND;
                    const smoothedBunchRatio = prevBunch + (targetBunchRatio - prevBunch) * lerpFactor;

                    if (
                        !pointerInsideRef.current &&
                        prev &&
                        Math.hypot(target.x - posLerp.x, target.y - posLerp.y) < SETTLE_DIST_EPS &&
                        Math.abs(smoothedBunchRatio - targetBunchRatio) < SETTLE_BUNCH_EPS
                    ) {
                        return prev;
                    }

                    lastSmoothedPosRef.current = posLerp;
                    lastSmoothedBunchRef.current = smoothedBunchRatio;

                    return { pos: posLerp, smoothedBunchRatio };
                });
            }
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    return (
        <main
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative min-h-screen overflow-x-clip bg-gradient-to-r from-gray-900 to-gray-800 
          bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] 
          bg-[size:8vw_8vw] md:bg-[size:4vw_4vw] ${className}`}
        >
            {/* Grid-only shimmer - bunches up (shrink + intensify) when far, smooth/sticky radius */}
            {shimmerState && (() => {
                const { pos: shimmerPos, smoothedBunchRatio } = shimmerState;
                const radius =
                    SHIMMER_BASE_RADIUS -
                    smoothedBunchRatio * (SHIMMER_BASE_RADIUS - SHIMMER_MIN_RADIUS);
                const centerOpacity =
                    INTENSITY_CENTER_REST + smoothedBunchRatio * (INTENSITY_CENTER_BUNCHED - INTENSITY_CENTER_REST);
                const midOpacity =
                    INTENSITY_MID_REST + smoothedBunchRatio * (INTENSITY_MID_BUNCHED - INTENSITY_MID_REST);
                return (
                    <div
                        className="pointer-events-none absolute inset-0 -z-10 animate-shimmer grid-highlight-mask"
                        style={{
                            background: `
                                radial-gradient(
                                    ${radius}px circle at ${shimmerPos.x}px ${shimmerPos.y}px,
                                    rgba(255, 255, 255, ${centerOpacity}) 0%,
                                    rgba(255, 255, 255, ${midOpacity}) 40%,
                                    transparent 70%
                                )
                            `,
                        }}
                    />
                );
            })()}
            {children}
        </main>
    );
});

GridBackground.displayName = 'GridBackground';

export default GridBackground;