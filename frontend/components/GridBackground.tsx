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

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        targetPosRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    const handleMouseLeave = useCallback(() => {
        targetPosRef.current = null;
    }, []);

    useEffect(() => {
        const animate = () => {
            const target = targetPosRef.current;
            if (target === null) {
                setShimmerState(null);
            } else {
                setShimmerState((prev) => {
                    const prevPos = prev?.pos ?? target;
                    const dx = target.x - prevPos.x;
                    const dy = target.y - prevPos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Shimmer position lerp
                    const posLerp = prev === null
                        ? target
                        : (() => {
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
                    const prevBunch = prev?.smoothedBunchRatio ?? 0;
                    const shrinking = targetBunchRatio > prevBunch;
                    const lerpFactor = shrinking ? BUNCH_RATIO_LERP_SHRINK : BUNCH_RATIO_LERP_EXPAND;
                    const smoothedBunchRatio = prevBunch + (targetBunchRatio - prevBunch) * lerpFactor;

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
            className={`relative h-screen overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 
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
                        className="pointer-events-none absolute inset-0 animate-shimmer grid-highlight-mask"
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