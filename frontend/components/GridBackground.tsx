import React, { ReactNode, forwardRef } from 'react';

interface GridBackgroundProps {
    children?: ReactNode;
    className?: string;
}

const GridBackground = forwardRef<HTMLElement, GridBackgroundProps>(({ children, className = '' }, ref) => {
    return (
        <main ref={ref} className={`relative h-screen overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 
          bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] 
          bg-[size:8vw_8vw] md:bg-[size:4vw_4vw] ${className}`}>
            {children}
        </main>
    );
});

GridBackground.displayName = 'GridBackground';

export default GridBackground;