import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WizardStep, ChallengeType } from '@/types/challenge';
import { motion } from 'framer-motion';

interface StepProgressProps {
  currentStep: WizardStep;
  challengeType: ChallengeType | null;
}

const steps: { key: WizardStep; label: string }[] = [
  { key: 'select-type', label: 'Type' },
  { key: 'input-form', label: 'Details' },
  { key: 'ai-draft', label: 'Generate' },
  { key: 'edit-plan', label: 'Edit' },
  { key: 'approval', label: 'Approve' },
  { key: 'brochure-preview', label: 'Preview' },
  { key: 'export', label: 'Export' },
];

export function StepProgress({ currentStep, challengeType }: StepProgressProps) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? 'hsl(var(--primary))'
                      : isCurrent
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted))',
                  }}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                    isCompleted || isCurrent
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium hidden sm:block',
                    isCurrent ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={cn(
                      'h-1 rounded-full transition-colors',
                      index < currentIndex ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
