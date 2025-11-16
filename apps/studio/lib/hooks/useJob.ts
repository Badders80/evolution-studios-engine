import useSWR from 'swr';
import { orchestratorClient } from '../api/orchestrator';
import { Job } from '../types';

export function useJob(jobId: string | null, refreshInterval = 5000) {
  const fetcher = async (key: string) => {
    const id = key.split('/').pop();
    if (!id) throw new Error('Invalid job ID');
    return orchestratorClient.getJob(id);
  };

  const { data, error, isLoading, mutate } = useSWR<Job>(
    jobId ? `/jobs/${jobId}` : null,
    fetcher,
    {
      refreshInterval: (data) => {
        // Stop polling if job is completed or failed
        if (!data) return refreshInterval;
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          return 0;
        }
        return refreshInterval;
      },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    job: data,
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
