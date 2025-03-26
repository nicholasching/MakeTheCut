import React from 'react';

    interface GradientPulseProps {
        className?: string;
    }

    const GradientPulse: React.FC<GradientPulseProps> = ({ className = '' }) => {
        return (
            <div 
              className={`
                absolute
                w-[200vw]
                h-[200vw]
                md:w-[125vw]
                md:h-[125vw]
                lg:w-[75vw]
                lg:h-[75vw]
                bg-gradient-to-br 
                from-blue-800 
                via-orange-700 
                to-orange-900 
                blur-3xl
                bottom-[75svh] 
                right-0 
                translate-x-1/2 
                translate-y-1/2
                animate-[pulse_7s_ease-in-out_infinite]
                opacity-25 
                rounded-full
                ${className}
              `}
            />
        );
    };

    export default GradientPulse;