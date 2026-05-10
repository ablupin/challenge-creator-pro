import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEMPLATES, BrochureTemplate } from '@/data/templates';
import { ChallengeType } from '@/types/challenge';
import { cn } from '@/lib/utils';

interface TemplatePickerProps {
  onSelect: (templateId: string) => void;
  onBack: () => void;
  challengeType: ChallengeType;
}

function TemplateThumbnail({ template, isSelected, onClick }: {
  template: BrochureTemplate;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isDark = template.colors.bg === '#0D0D0D';

  const sampleItems = ['Grilled Chicken', 'Quinoa Bowl', 'Green Smoothie'];

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200',
        isSelected
          ? 'border-primary ring-2 ring-primary ring-offset-2 shadow-lg'
          : 'border-border hover:border-primary/50 hover:shadow-md'
      )}
      style={{ background: template.colors.bg }}
    >
      {/* Header band */}
      <div
        className="relative h-16 flex items-center justify-center overflow-hidden"
        style={{
          background: template.style.headerStyle === 'gradient'
            ? `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})`
            : template.colors.primary,
        }}
      >
        {/* Pattern overlay */}
        {template.style.pattern === 'dots' && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '8px 8px',
            }}
          />
        )}
        {template.style.pattern === 'diagonal' && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, white, white 1px, transparent 1px, transparent 8px)',
            }}
          />
        )}
        {template.style.pattern === 'geometric' && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, white, white 1px, transparent 1px, transparent 12px), repeating-linear-gradient(90deg, white, white 1px, transparent 1px, transparent 12px)',
            }}
          />
        )}
        <div className="relative z-10 text-center px-2">
          <p
            className="text-white text-xs font-bold tracking-wide leading-tight"
            style={{ fontFamily: template.font.heading }}
          >
            7-DAY CHALLENGE
          </p>
          <div
            className="mt-0.5 h-0.5 w-8 mx-auto opacity-70"
            style={{ background: template.colors.accent }}
          />
        </div>

        {/* Selected check */}
        {isSelected && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <Check className="w-3 h-3 text-primary" />
          </div>
        )}
      </div>

      {/* Mini cards */}
      <div className="p-2 space-y-1.5">
        {sampleItems.map((item, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1',
              template.style.rounded,
            )}
            style={{
              background: template.colors.cardBg,
              border: template.style.cardStyle === 'outlined'
                ? `1px solid ${template.colors.primary}30`
                : 'none',
              boxShadow: template.style.cardStyle === 'elevated'
                ? '0 1px 3px rgba(0,0,0,0.1)'
                : template.style.cardStyle === 'glass'
                ? 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                : 'none',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: template.colors.accent || template.colors.primary }}
            />
            <span
              className="text-[9px] truncate font-medium"
              style={{ color: template.colors.text, fontFamily: template.font.body }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* Name & tagline */}
      <div
        className="px-2 pb-2 pt-0"
        style={{ borderTop: `1px solid ${template.colors.primary}15` }}
      >
        <p
          className="text-xs font-bold truncate"
          style={{ color: template.colors.primary, fontFamily: template.font.heading }}
        >
          {template.name}
        </p>
        <p
          className="text-[9px] truncate"
          style={{ color: template.colors.mutedText }}
        >
          {template.tagline}
        </p>
      </div>
    </motion.div>
  );
}

export function TemplatePicker({ onSelect, onBack, challengeType }: TemplatePickerProps) {
  const [selected, setSelected] = useState<string>('blaze');

  const handleContinue = () => {
    onSelect(selected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
          Choose Your Style
        </h2>
        <p className="text-muted-foreground text-lg">
          Pick a visual theme for your {challengeType === 'food' ? 'food' : 'fitness'} challenge brochure.
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {TEMPLATES.map((template) => (
          <TemplateThumbnail
            key={template.id}
            template={template}
            isSelected={selected === template.id}
            onClick={() => setSelected(template.id)}
          />
        ))}
      </div>

      {/* Selected preview text */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">
          Selected:{' '}
          <span className="font-semibold text-foreground">
            {TEMPLATES.find(t => t.id === selected)?.name} — {TEMPLATES.find(t => t.id === selected)?.tagline}
          </span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={handleContinue} className="gap-2 min-w-[200px]">
          Continue with this style
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
