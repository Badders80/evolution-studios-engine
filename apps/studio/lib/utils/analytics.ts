import { Job } from '../types';

export interface JobAnalytics {
  totalJobs: number;
  completed: number;
  processing: number;
  failed: number;
  successRate: string;
  avgProcessingTime: string;
}

export function calculateJobAnalytics(jobs: Job[]): JobAnalytics {
  const totalJobs = jobs.length;
  const completed = jobs.filter(j => j.status === 'COMPLETE' || j.status === 'COMPLETED').length;
  const processing = jobs.filter(j => 
    ['NEW', 'PENDING', 'SCRAPING', 'TRANSCRIBING', 'ENRICHING', 'REFINING'].includes(j.status)
  ).length;
  const failed = jobs.filter(j => j.status === 'FAILED').length;
  
  const successRate = totalJobs > 0 
    ? `${Math.round((completed / totalJobs) * 100)}%`
    : '0%';
  
  // Calculate average processing time for completed jobs
  const completedWithTime = jobs.filter(j => 
    (j.status === 'COMPLETE' || j.status === 'COMPLETED') && j.processing_time_ms
  );
  
  const avgTimeMs = completedWithTime.length > 0
    ? completedWithTime.reduce((sum, j) => sum + (j.processing_time_ms || 0), 0) / completedWithTime.length
    : 0;
  
  const avgProcessingTime = avgTimeMs > 0
    ? `${(avgTimeMs / 1000).toFixed(1)}s`
    : 'N/A';
  
  return {
    totalJobs,
    completed,
    processing,
    failed,
    successRate,
    avgProcessingTime,
  };
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function formatProcessingTime(ms: number | null | undefined): string {
  if (!ms) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
