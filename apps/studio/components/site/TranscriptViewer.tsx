'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TranscriptViewerProps {
  rawTranscript?: string;
  enrichedTranscript?: string;
  refinedTranscript?: string;
}

type TranscriptType = 'raw' | 'enriched' | 'refined';

export function TranscriptViewer({ rawTranscript, enrichedTranscript, refinedTranscript }: TranscriptViewerProps) {
  const [activeTab, setActiveTab] = useState<TranscriptType>('refined');
  const [copied, setCopied] = useState(false);

  const transcripts = {
    raw: rawTranscript,
    enriched: enrichedTranscript,
    refined: refinedTranscript,
  };

  const activeTranscript = transcripts[activeTab];

  const handleCopy = async () => {
    if (!activeTranscript) return;
    
    try {
      await navigator.clipboard.writeText(activeTranscript);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Clipboard copy failed', error);
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (!activeTranscript) return;

    const blob = new Blob([activeTranscript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${activeTab}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download started!');
  };

  const tabs: { type: TranscriptType; label: string; badge?: string }[] = [
    { type: 'raw', label: 'Raw Transcript', badge: 'Whisper' },
    { type: 'enriched', label: 'Enriched', badge: 'Layer 1' },
    { type: 'refined', label: 'Gold Standard', badge: 'Layer 2' },
  ];

  return (
    <Card variant="default" padding="none">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] px-6 py-4">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              disabled={!transcripts[tab.type]}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.type
                  ? 'bg-[#d4a964] text-[#0a0a0a]'
                  : 'bg-[#2a2a2a] text-[#64748b] hover:text-[#ededed]'
                }
                ${!transcripts[tab.type] ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {tab.label}
              {tab.badge && (
                <Badge variant="default" size="sm" className="ml-2">
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!activeTranscript}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!activeTranscript}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTranscript ? (
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-[#ededed] font-mono bg-[#0a0a0a] p-4 rounded-lg border border-[#2a2a2a]">
              {activeTranscript}
            </pre>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#64748b]">
              {activeTab === 'raw' && 'Waiting for transcription...'}
              {activeTab === 'enriched' && 'Waiting for enrichment...'}
              {activeTab === 'refined' && 'Waiting for refinement...'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
