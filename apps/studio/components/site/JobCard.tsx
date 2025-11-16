'use client';

import Link from 'next/link';
import { Job } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTimeAgo, formatProcessingTime } from '@/lib/utils/analytics';
import { ExternalLink, Download, Eye, Clock } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  // Determine badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETE':
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'NEW':
      case 'PENDING':
        return 'default';
      default:
        return 'warning'; // Processing states
    }
  };

  // Extract horse name or use fallback
  const displayTitle = job.source_url?.includes('mistable.com')
    ? 'miStable Training Report'
    : 'Training Report';

  // Truncate URL for display
  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const isComplete = job.status === 'COMPLETE' || job.status === 'COMPLETED';
  const hasRefinedText = !!job.refined_text;

  return (
    <Card variant="elevated" className="hover:border-[#d4a964]/40 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Status and Info */}
        <div className="flex-1 space-y-3">
          {/* Status Badge and Time */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={getBadgeVariant(job.status)} size="md">
              {job.status}
            </Badge>
            
            {job.processing_time_ms && (
              <span className="flex items-center gap-1 text-sm text-[#64748b]">
                <Clock className="h-3 w-3" />
                {formatProcessingTime(job.processing_time_ms)}
              </span>
            )}
            
            <span className="text-sm text-[#64748b]">
              {formatTimeAgo(job.created_at)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-[#ededed]">
            {displayTitle}
          </h3>

          {/* Source URL */}
          {job.source_url && (
            <div className="flex items-center gap-2 text-sm text-[#64748b]">
              <ExternalLink className="h-3 w-3" />
              <span className="font-mono">{truncateUrl(job.source_url)}</span>
            </div>
          )}

          {/* Error Details */}
          {job.status === 'FAILED' && job.error_details && (
            <div className="text-sm text-[#f87171] bg-[#f87171]/10 px-3 py-2 rounded-lg">
              Error: {typeof job.error_details === 'string' ? job.error_details : JSON.stringify(job.error_details)}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-2">
          <Link
            href={`/jobs/${job.job_id}`}
            className="flex items-center gap-2 px-4 py-2 bg-[#d4a964]/10 text-[#d4a964] rounded-lg text-sm font-medium hover:bg-[#d4a964]/20 transition-colors"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Link>

          {isComplete && hasRefinedText && (
            <button
              onClick={() => {
                // Download refined text
                const blob = new Blob([job.refined_text!], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `job-${job.job_id}-refined.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-[#ededed] rounded-lg text-sm font-medium hover:bg-[#3a3a3a] transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
