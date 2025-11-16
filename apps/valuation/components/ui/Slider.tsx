'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  className?: string;
}

export function Slider({ className = '', ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={`relative flex w-full touch-none select-none items-center ${className}`}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#2a2a2a]">
        <SliderPrimitive.Range className="absolute h-full bg-[#d4a964]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-[#d4a964] bg-white ring-offset-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a964] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
}
