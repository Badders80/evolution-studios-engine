'use client';

import { use } from 'react';
import { useJob } from '@/lib/hooks/useJob';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { JobStatusTimeline } from '@/components/site/JobStatusTimeline';
import { TranscriptViewer } from '@/components/site/TranscriptViewer';
import { ArrowLeft, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  const { job, isLoading, isError, refresh } = useJob(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] py-12">
        <Container>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#d4a964] animate-spin" />
          </div>
        </Container>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] py-12">
        <Container>
          <Card variant="elevated" padding="lg">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-[#ededed] mb-4">Job Not Found</h2>
              <p className="text-[#64748b] mb-6">
                The job you&apos;re looking for doesn&apos;t exist or has been deleted.
              </p>
              <Link href="/jobs/new">
                <Button variant="primary">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Create New Job
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  const isProcessing = !['COMPLETED', 'FAILED'].includes(job.status);

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <Link href="/jobs/new">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to New Job
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#ededed] mb-2">Job Details</h1>
              <p className="text-[#64748b] font-mono text-sm">ID: {job.job_id}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {isProcessing && (
                <Button variant="ghost" size="sm" onClick={() => refresh()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              )}
              <Badge 
                variant={
                  job.status === 'COMPLETED' ? 'success' :
                  job.status === 'FAILED' ? 'error' :
                  'info'
                }
                size="lg"
              >
                {job.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <Card variant="elevated" padding="lg" className="mb-8">
          <h2 className="text-xl font-bold text-[#ededed] mb-6">Processing Pipeline</h2>
          <JobStatusTimeline 
            currentStatus={job.status} 
            error={typeof job.error_details?.message === 'string' ? job.error_details.message : undefined}
          />
        </Card>

        {/* Job Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Source Information */}
          <Card variant="default" padding="lg">
            <h3 className="text-lg font-semibold text-[#ededed] mb-4">Source Information</h3>
            <div className="space-y-3">
              {job.source_url && (
                <div>
                  <label className="text-sm text-[#64748b]">Source URL</label>
                  <a 
                    href={job.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#d4a964] hover:underline mt-1"
                  >
                    <span className="truncate">{job.source_url}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              )}
              
              {job.trainer_logo_url && (
                <div>
                  <label className="text-sm text-[#64748b]">Trainer Logo</label>
                  <Image
                    src={job.trainer_logo_url}
                    alt="Trainer Logo"
                    width={64}
                    height={64}
                    className="mt-2 h-16 w-16 rounded-lg object-cover border border-[#2a2a2a]"
                  />
                </div>
              )}

              {job.system_prompt_used && (
                <div>
                  <label className="text-sm text-[#64748b]">Custom Directive</label>
                  <p className="text-sm text-[#ededed] mt-1 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                    {job.system_prompt_used}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Media Files */}
          <Card variant="default" padding="lg">
            <h3 className="text-lg font-semibold text-[#ededed] mb-4">Media Files</h3>
            <div className="space-y-3">
              {job.raw_mp4_path ? (
                <div>
                  <label className="text-sm text-[#64748b]">Video</label>
                  <video 
                    src={job.raw_mp4_path} 
                    controls 
                    className="mt-2 w-full rounded-lg border border-[#2a2a2a]"
                  />
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-[#2a2a2a] rounded-lg">
                  <p className="text-sm text-[#64748b]">Video not yet available</p>
                </div>
              )}

              {job.raw_mp3_path && (
                <div>
                  <label className="text-sm text-[#64748b]">Audio</label>
                  <audio 
                    src={job.raw_mp3_path} 
                    controls 
                    className="mt-2 w-full"
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Transcripts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#ededed] mb-4">Transcripts</h2>
          <TranscriptViewer
            rawTranscript={job.raw_transcript}
            enrichedTranscript={job.enriched_transcript}
            refinedTranscript={job.refined_text}
          />
        </div>

        {/* Metadata */}
        <Card variant="default" padding="lg">
          <h3 className="text-lg font-semibold text-[#ededed] mb-4">Metadata</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="text-[#64748b]">Created</label>
              <p className="text-[#ededed] mt-1">
                {new Date(job.created_at).toLocaleString()}
              </p>
            </div>
            {job.updated_at && (
              <div>
                <label className="text-[#64748b]">Updated</label>
                <p className="text-[#ededed] mt-1">
                  {new Date(job.updated_at).toLocaleString()}
                </p>
              </div>
            )}
            {job.completed_at && (
              <div>
                <label className="text-[#64748b]">Completed</label>
                <p className="text-[#ededed] mt-1">
                  {new Date(job.completed_at).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <label className="text-[#64748b]">User ID</label>
              <p className="text-[#ededed] mt-1 font-mono text-xs truncate">
                {job.user_id}
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
