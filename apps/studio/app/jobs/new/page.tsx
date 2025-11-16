import { UrlSubmissionForm } from '@/components/site/UrlSubmissionForm';
import { Sparkles } from 'lucide-react';

export default function NewJobPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#d4a964]/10 rounded-xl">
              <Sparkles className="h-8 w-8 text-[#d4a964]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#ededed] mb-4">
            Evolution Studios Engine
          </h1>
          <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
            Transform miStable trainer reports into Gold Standard content with AI-powered processing
          </p>
        </div>

        {/* Form */}
        <UrlSubmissionForm />

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#64748b]">
            Powered by Whisper AI, Brand Bible Compliance, and LLM Refinement
          </p>
        </div>
      </div>
    </div>
  );
}
