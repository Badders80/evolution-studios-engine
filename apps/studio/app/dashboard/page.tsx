'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { JobCard } from '@/components/site/JobCard';
import { orchestratorClient } from '@/lib/api/orchestrator';
import { calculateJobAnalytics } from '@/lib/utils/analytics';
import { Job, JobStatus } from '@/lib/types';
import { Plus, Filter, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const TEST_USER_ID = '4a6e4cb7-9fa4-4333-85b4-1ac440119167';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | JobStatus>('ALL');

  // Fetch jobs with polling for real-time updates
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const fetchedJobs = await orchestratorClient.listJobs(TEST_USER_ID);
        setJobs(fetchedJobs);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
    const intervalId = setInterval(loadJobs, 5000); // Poll every 5 seconds
    return () => clearInterval(intervalId);
  }, []);

  // Filter jobs based on search and status
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesStatus = filterStatus === 'ALL' || job.status === filterStatus;
      const matchesSearch = searchTerm === '' || 
                            job.source_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.job_id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [jobs, searchTerm, filterStatus]);

  // Calculate analytics
  const analytics = useMemo(() => calculateJobAnalytics(jobs), [jobs]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Container className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light text-[#ededed] mb-2">Dashboard</h1>
            <p className="text-[#64748b]">Monitor your content processing pipeline</p>
          </div>
          
          <Link
            href="/jobs/new"
            className="flex items-center gap-2 px-6 py-3 bg-[#d4a964] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#e5ba75] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create New Job
          </Link>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" className="text-center">
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-8 w-8 text-[#d4a964]" />
              <p className="text-sm text-[#64748b] font-medium">Total Jobs</p>
              <p className="text-3xl font-bold text-[#ededed]">{analytics.totalJobs}</p>
            </div>
          </Card>

          <Card variant="elevated" className="text-center">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8 text-[#4ade80]" />
              <p className="text-sm text-[#64748b] font-medium">Completed</p>
              <p className="text-3xl font-bold text-[#4ade80]">{analytics.completed}</p>
            </div>
          </Card>

          <Card variant="elevated" className="text-center">
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-8 w-8 text-[#fbbf24]" />
              <p className="text-sm text-[#64748b] font-medium">Processing</p>
              <p className="text-3xl font-bold text-[#fbbf24]">{analytics.processing}</p>
            </div>
          </Card>

          <Card variant="elevated" className="text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#d4a964]/20 flex items-center justify-center">
                <span className="text-lg font-bold text-[#d4a964]">⚡</span>
              </div>
              <p className="text-sm text-[#64748b] font-medium">Avg Time</p>
              <p className="text-3xl font-bold text-[#ededed]">{analytics.avgProcessingTime}</p>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by URL or Job ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#64748b]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'ALL' | JobStatus)}
              className="bg-[#1a1a1a] text-[#ededed] border border-[#2a2a2a] rounded-lg px-4 py-2 focus:outline-none focus:border-[#d4a964] transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETE">Complete</option>
              <option value="COMPLETED">Completed</option>
              <option value="REFINING">Refining</option>
              <option value="ENRICHING">Enriching</option>
              <option value="TRANSCRIBING">Transcribing</option>
              <option value="SCRAPING">Scraping</option>
              <option value="NEW">New</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Job List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#d4a964] border-r-transparent"></div>
            <p className="mt-4 text-[#64748b]">Loading jobs...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <JobCard key={job.job_id} job={job} />
            ))}
          </div>
        ) : (
          <Card variant="elevated" className="text-center py-12">
            <p className="text-[#64748b] mb-4">
              {searchTerm || filterStatus !== 'ALL'
                ? 'No jobs match your filters'
                : 'No jobs yet'}
            </p>
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4a964]/10 text-[#d4a964] rounded-lg font-medium hover:bg-[#d4a964]/20 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Your First Job
            </Link>
          </Card>
        )}

        {/* Stats Footer */}
        {!loading && jobs.length > 0 && (
          <div className="mt-8 text-center text-sm text-[#64748b]">
            Showing {filteredJobs.length} of {jobs.length} jobs
            {analytics.successRate !== '0%' && (
              <span className="ml-2">• Success Rate: <span className="text-[#4ade80] font-semibold">{analytics.successRate}</span></span>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
