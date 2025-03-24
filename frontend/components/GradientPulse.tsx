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
                md:w-[150vw]
                md:h-[150vw]
                lg:w-[100vw]
                lg:h-[100vw]
                bg-gradient-to-br 
                from-blue-800 
                via-orange-700 
                to-orange-900 
                blur-3xl
                bottom-0 
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