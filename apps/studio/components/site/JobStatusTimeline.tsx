'use client';

import { JobStatus } from '@/lib/types';
import { Check, Loader2, X, Circle } from 'lucide-react';

interface JobStatusTimelineProps {
  currentStatus: JobStatus;
  error?: string;
}

const statusSteps: { status: JobStatus; label: string }[] = [
  { status: 'PENDING', label: 'Pending' },
  { status: 'SCRAPING', label: 'Scraping' },
  { status: 'TRANSCRIBING', label: 'Transcribing' },
  { status: 'ENRICHING', label: 'Enriching' },
  { status: 'REFINING', label: 'Refining' },
  { status: 'COMPLETED', label: 'Completed' },
];

export function JobStatusTimeline({ currentStatus, error }: JobStatusTimelineProps) {
  const currentIndex = statusSteps.findIndex(step => step.status === currentStatus);
  const isFailed = currentStatus === 'FAILED';

  const getStepState = (index: number) => {
    if (isFailed && index === currentIndex) return 'failed';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {statusSteps.map((step, index) => {
          const state = getStepState(index);
          const isLast = index === statusSteps.length - 1;

          return (
            <div key={step.status} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${state === 'completed' ? 'bg-[#4ade80] border-[#4ade80]' : ''}
                    ${state === 'active' ? 'bg-[#60a5fa] border-[#60a5fa] animate-pulse' : ''}
                    ${state === 'failed' ? 'bg-[#f87171] border-[#f87171]' : ''}
                    ${state === 'pending' ? 'bg-[#2a2a2a] border-[#2a2a2a]' : ''}
                  `}
                >
                  {state === 'completed' && <Check className="h-5 w-5 text-[#0a0a0a]" />}
                  {state === 'active' && <Loader2 className="h-5 w-5 text-white animate-spin" />}
                  {state === 'failed' && <X className="h-5 w-5 text-white" />}
                  {state === 'pending' && <Circle className="h-4 w-4 text-[#64748b]" />}
                </div>
                
                {/* Label */}
                <span
                  className={`
                    mt-2 text-sm font-medium
                    ${state === 'completed' ? 'text-[#4ade80]' : ''}
                    ${state === 'active' ? 'text-[#60a5fa]' : ''}
                    ${state === 'failed' ? 'text-[#f87171]' : ''}
                    ${state === 'pending' ? 'text-[#64748b]' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 transition-all
                    ${index < currentIndex ? 'bg-[#4ade80]' : 'bg-[#2a2a2a]'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-[#f87171]/10 border border-[#f87171]/20 rounded-lg">
          <p className="text-sm text-[#f87171] font-medium">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
