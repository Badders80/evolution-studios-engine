import { CreateJobPayload, CreateJobResponse, Job, ApiError } from '../types';

const ORCHESTRATOR_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:8080';

class OrchestratorClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createJob(payload: CreateJobPayload, userId: string): Promise<CreateJobResponse> {
    const response = await fetch(`${this.baseUrl}/v1/jobs/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        ...payload,
      }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to create job');
    }

    return response.json();
  }

  async getJob(jobId: string): Promise<Job> {
    const response = await fetch(`${this.baseUrl}/v1/jobs/${jobId}`);

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to fetch job');
    }

    return response.json();
  }

  async listJobs(userId: string): Promise<Job[]> {
    const response = await fetch(`${this.baseUrl}/v1/jobs?user_id=${userId}`);

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to fetch jobs');
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

export const orchestratorClient = new OrchestratorClient(ORCHESTRATOR_URL);
