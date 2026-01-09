import React from 'react';
import { CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { key: 'uploading', label: 'Uploading', description: 'Securely uploading your file' },
  { key: 'parsing', label: 'Parsing', description: 'Extracting resume content' },
  { key: 'embedding', label: 'Analyzing', description: 'Creating AI embeddings' },
  { key: 'ready', label: 'Complete', description: 'Ready for matching' }
];

const stepOrder = ['uploading', 'parsing', 'embedding', 'ready'];

export default function ResumeProgress({ status, error }) {
  const currentIndex = stepOrder.indexOf(status);
  const isError = status === 'error';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isComplete = currentIndex > index || status === 'ready';
          const isCurrent = currentIndex === index && !isError;
          const isPending = currentIndex < index;
          
          return (
            <div
              key={step.key}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl transition-all duration-500",
                isComplete && "bg-emerald-50",
                isCurrent && "bg-slate-50",
                isPending && "opacity-50"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isComplete ? (
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="w-8 h-8 border-2 border-slate-200 rounded-full flex items-center justify-center">
                    <Circle className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-semibold",
                  isComplete && "text-emerald-700",
                  isCurrent && "text-slate-900",
                  isPending && "text-slate-400"
                )}>
                  {step.label}
                </p>
                <p className={cn(
                  "text-sm mt-0.5",
                  isComplete && "text-emerald-600",
                  isCurrent && "text-slate-500",
                  isPending && "text-slate-400"
                )}>
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="absolute left-8 mt-10 w-0.5 h-4 bg-slate-200" />
              )}
            </div>
          );
        })}
      </div>
      
      {isError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">Processing Failed</p>
            <p className="text-sm text-red-600 mt-1">{error || 'An unexpected error occurred'}</p>
          </div>
        </div>
      )}
    </div>
  );
}