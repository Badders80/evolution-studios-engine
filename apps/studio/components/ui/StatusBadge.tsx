import { JobStatus } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: JobStatus;
}

const statusConfig: Record<JobStatus, { label: string; color: string; bg: string; animated?: boolean }> = {
  NEW: { label: 'New', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' },
  PENDING: { label: 'Pending', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
  SCRAPING: { label: 'Scraping', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', animated: true },
  TRANSCRIBING: { label: 'Transcribing', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', animated: true },
  ENRICHING: { label: 'Enriching', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', animated: true },
  REFINING: { label: 'Refining', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', animated: true },
  COMPLETE: { label: 'Complete', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)' },
  COMPLETED: { label: 'Completed', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)' },
  FAILED: { label: 'Failed', color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
      style={{
        color: config.color,
        backgroundColor: config.bg,
      }}
    >
      {config.animated && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
      {config.label}
    </span>
  );
}
