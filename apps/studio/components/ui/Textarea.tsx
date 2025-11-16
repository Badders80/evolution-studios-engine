import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#ededed] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#ededed] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#d4a964] focus:border-transparent transition-all resize-none ${
            error ? 'border-[#f87171]' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[#f87171]">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
