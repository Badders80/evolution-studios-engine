'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { orchestratorClient } from '@/lib/api/orchestrator';
import { getCurrentUser } from '@/lib/supabase';
import { uploadVideo, uploadAudio } from '@/lib/storage';
import { Link2, Sparkles, Upload, FileVideo, FileAudio } from 'lucide-react';

type InputMode = 'url' | 'file';

export function UrlSubmissionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [formData, setFormData] = useState({
    sourceUrl: '',
    trainerLogoUrl: '',
    systemPrompt: '',
  });
  const [files, setFiles] = useState<{
    video: File | null;
    audio: File | null;
  }>({ video: null, audio: null });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    
    if (inputMode === 'url') {
      if (!formData.sourceUrl.trim()) {
        newErrors.sourceUrl = 'Source URL is required';
      } else if (!validateUrl(formData.sourceUrl)) {
        newErrors.sourceUrl = 'Please enter a valid URL';
      }
    } else {
      // File mode - require at least one file
      if (!files.video && !files.audio) {
        newErrors.files = 'Please upload at least a video (MP4) or audio (MP3) file';
      }
    }

    if (formData.trainerLogoUrl && !validateUrl(formData.trainerLogoUrl)) {
      newErrors.trainerLogoUrl = 'Please enter a valid URL';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user from Supabase
      let userId: string;
      
      try {
        const user = await getCurrentUser();
        userId = user?.id || '4a6e4cb7-9fa4-4333-85b4-1ac440119167'; // Fallback to test user
      } catch (error) {
        // Development fallback - use test user ID
        console.warn('Auth not configured, using test user ID', error);
        userId = '4a6e4cb7-9fa4-4333-85b4-1ac440119167';
      }

      // Create job via Orchestrator
      let response;
      
      if (inputMode === 'url') {
        response = await orchestratorClient.createJob(
          {
            source_url: formData.sourceUrl,
            trainer_logo_url: formData.trainerLogoUrl || undefined,
            system_prompt: formData.systemPrompt || undefined,
          },
          userId
        );
      } else {
        // File upload mode - Upload files to Supabase Storage
        toast.loading('Uploading files...', { id: 'upload' });
        
        try {
          let videoUrl: string | undefined;
          let audioUrl: string | undefined;
          
          // Upload video if provided
          if (files.video) {
            const videoResult = await uploadVideo(files.video, userId);
            videoUrl = videoResult.url;
            toast.loading('Video uploaded, uploading audio...', { id: 'upload' });
          }
          
          // Upload audio if provided
          if (files.audio) {
            const audioResult = await uploadAudio(files.audio, userId);
            audioUrl = audioResult.url;
          }
          
          toast.loading('Files uploaded, creating job...', { id: 'upload' });
          
          // Create job with file URLs
          response = await orchestratorClient.createJob(
            {
              source_url: videoUrl || audioUrl || '', // Use video URL as primary, fallback to audio
              raw_audio_url: audioUrl,
              trainer_logo_url: formData.trainerLogoUrl || undefined,
              system_prompt: formData.systemPrompt || undefined,
            },
            userId
          );
          
          toast.dismiss('upload');
        } catch (uploadError) {
          toast.dismiss('upload');
          throw uploadError;
        }
      }

      // Success feedback
      toast.success('Job created successfully!', {
        description: `Job ID: ${response.job_id}`,
        duration: 5000,
      });

      // Reset form
      setFormData({
        sourceUrl: '',
        trainerLogoUrl: '',
        systemPrompt: '',
      });
      setFiles({ video: null, audio: null });

      // Navigate to job detail page
      router.push(`/jobs/${response.job_id}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#d4a964]/10 rounded-lg">
            {inputMode === 'url' ? (
              <Link2 className="h-6 w-6 text-[#d4a964]" />
            ) : (
              <Upload className="h-6 w-6 text-[#d4a964]" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#ededed]">Submit New Job</h2>
            <p className="text-sm text-[#64748b]">
              {inputMode === 'url' ? 'Process from URL' : 'Upload media files'}
            </p>
          </div>
        </div>

        {/* Input Mode Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-[#0a0a0a] rounded-lg">
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'url'
                ? 'bg-[#d4a964] text-[#0a0a0a]'
                : 'text-[#64748b] hover:text-[#ededed]'
            }`}
          >
            <Link2 className="inline h-4 w-4 mr-2" />
            URL Input
          </button>
          <button
            type="button"
            onClick={() => setInputMode('file')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'file'
                ? 'bg-[#d4a964] text-[#0a0a0a]'
                : 'text-[#64748b] hover:text-[#ededed]'
            }`}
          >
            <Upload className="inline h-4 w-4 mr-2" />
            File Upload
          </button>
        </div>

        <div className="space-y-5">
          {inputMode === 'url' ? (
            <>
              <Input
                label="Source Report URL"
                type="url"
                placeholder="https://mistable.com/site/report/key/XXX/id/YYY"
                value={formData.sourceUrl}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                error={errors.sourceUrl}
                required
              />
            </>
          ) : (
            <>
              {/* Video File Upload */}
              <div>
                <label className="block text-sm font-medium text-[#ededed] mb-2">
                  Video File (MP4, MOV, AVI, etc.)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFiles({ ...files, video: e.target.files?.[0] || null })}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#d4a964]/50 transition-colors"
                  >
                    <FileVideo className="h-8 w-8 text-[#64748b]" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-[#ededed]">
                        {files.video ? files.video.name : 'Click to upload video'}
                      </p>
                      <p className="text-xs text-[#64748b] mt-1">
                        {files.video ? `${(files.video.size / 1024 / 1024).toFixed(2)} MB` : 'MP4, MOV, AVI, MKV • Max 500MB'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Audio File Upload */}
              <div>
                <label className="block text-sm font-medium text-[#ededed] mb-2">
                  Audio File (MP3, M4A, WAV, etc.) - Optional if video provided
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFiles({ ...files, audio: e.target.files?.[0] || null })}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#d4a964]/50 transition-colors"
                  >
                    <FileAudio className="h-8 w-8 text-[#64748b]" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-[#ededed]">
                        {files.audio ? files.audio.name : 'Click to upload audio'}
                      </p>
                      <p className="text-xs text-[#64748b] mt-1">
                        {files.audio ? `${(files.audio.size / 1024 / 1024).toFixed(2)} MB` : 'MP3, M4A, WAV, AAC • Max 100MB'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {errors.files && (
                <p className="text-sm text-[#f87171]">{errors.files}</p>
              )}
            </>
          )}

          <Input
            label="Trainer Logo URL (Optional)"
            type="url"
            placeholder="https://example.com/logo.png"
            value={formData.trainerLogoUrl}
            onChange={(e) => setFormData({ ...formData, trainerLogoUrl: e.target.value })}
            error={errors.trainerLogoUrl}
          />

          <Textarea
            label="Custom Directive (Optional)"
            placeholder="Enter any specific instructions for the AI processing..."
            rows={4}
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
          />
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="flex-1"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isSubmitting ? 'Creating Job...' : 'Create Job'}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => router.push('/dashboard')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#ededed] mb-2">What happens next?</h3>
        <ol className="text-sm text-[#64748b] space-y-1 list-decimal list-inside">
          {inputMode === 'url' ? (
            <>
              <li>Video and audio extraction from the report</li>
              <li>AI-powered transcription with Whisper</li>
              <li>Brand compliance enrichment (Layer 1)</li>
              <li>LLM refinement with Brand Bible (Layer 2)</li>
              <li>Gold Standard output ready for use</li>
            </>
          ) : (
            <>
              <li>Files uploaded to secure storage</li>
              <li>Audio extraction (if video provided)</li>
              <li>AI-powered transcription with Whisper</li>
              <li>Brand compliance enrichment (Layer 1)</li>
              <li>LLM refinement with Brand Bible (Layer 2)</li>
              <li>Gold Standard output ready for use</li>
            </>
          )}
        </ol>
      </div>
    </form>
  );
}
