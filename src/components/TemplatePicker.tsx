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

function TemplateThumbnail({ template, isSelected, onClick, index }: {
  template: BrochureTemplate;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) {
  const foodItems = ['Grilled Salmon', 'Quinoa Bowl', 'Green Smoothie'];
  const fitnessItems = ['Squat 3×12', 'Deadlift 4×8', 'Plank 45s'];
  const sampleItems = foodItems;

  const isDark = ['lumiere', 'aurora', 'ember', 'cipher'].includes(template.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-2xl overflow-hidden transition-all duration-200 flex flex-col',
        isSelected
          ? 'ring-2 ring-offset-2 ring-primary shadow-xl'
          : 'hover:shadow-lg shadow-sm'
      )}
      style={{
        background: template.colors.bg,
        border: isSelected ? `2px solid ${template.colors.primary}` : `1px solid ${template.colors.primary}22`,
      }}
    >
      {/* Hero band — the money shot */}
      <div
        className="relative h-20 flex flex-col items-center justify-center overflow-hidden flex-shrink-0"
        style={{ background: template.colors.heroGradient }}
      >
        {/* Pattern overlay */}
        {template.style.pattern === 'geometric' && (
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(60deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 11px)',
            }}
          />
        )}
        {template.style.pattern === 'diagonal' && (
          <div className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.6), rgba(255,255,255,0.6) 1px, transparent 1px, transparent 10px)',
            }}
          />
        )}
        {template.style.pattern === 'dots' && (
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '8px 8px',
            }}
          />
        )}

        <div className="relative z-10 text-center px-3">
          <p
            className="text-white text-[10px] font-bold tracking-widest uppercase opacity-90"
            style={{ fontFamily: template.font.heading, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
          >
            7-Day
          </p>
          <p
            className="text-white text-xs font-bold mt-0.5"
            style={{ fontFamily: template.font.heading, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
          >
            Challenge
          </p>
          <div
            className="mt-1.5 h-px w-10 mx-auto"
            style={{ background: `linear-gradient(to right, transparent, ${template.colors.accent}, transparent)` }}
          />
        </div>

        {isSelected && (
          <div
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
            style={{ background: template.colors.accent }}
          >
            <Check className="w-3 h-3" style={{ color: template.colors.primary }} />
          </div>
        )}
      </div>

      {/* Mini content cards */}
      <div className="p-2 space-y-1 flex-1">
        {sampleItems.slice(0, 2).map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-2 py-1"
            style={{
              background: template.style.cardStyle === 'glass'
                ? `${template.colors.cardBg}cc`
                : template.colors.cardBg,
              borderRadius: template.style.rounded === 'rounded-none' ? '2px' : template.style.rounded === 'rounded-3xl' ? '10px' : '6px',
              border: template.style.cardStyle === 'outlined'
                ? `1px solid ${template.colors.primary}30`
                : `1px solid ${template.colors.primary}10`,
              boxShadow: template.style.cardStyle === 'elevated' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: template.colors.accent || template.colors.primary }}
            />
            <span
              className="text-[9px] font-medium truncate"
              style={{ color: template.colors.text, fontFamily: template.font.body }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* Name bar */}
      <div
        className="px-3 py-1.5 flex items-center justify-between"
        style={{ background: `${template.colors.primary}15`, borderTop: `1px solid ${template.colors.primary}20` }}
      >
        <div>
          <p
            className="text-[10px] font-bold leading-none"
            style={{ color: template.colors.primary, fontFamily: template.font.heading }}
          >
            {template.name}
          </p>
          <p
            className="text-[8px] mt-0.5 opacity-70"
            style={{ color: template.colors.text }}
          >
            {template.tagline}
          </p>
        </div>
        {isSelected && (
          <span
            className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: template.colors.primary, color: template.colors.bg || '#fff' }}
          >
            ✓
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function TemplatePicker({ onSelect, onBack, challengeType }: TemplatePickerProps) {
  const [selected, setSelected] = useState<string>('lumiere');
  const selectedTemplate = TEMPLATES.find(t => t.id === selected)!;

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

      {/* Template Grid — 2 col on mobile, 5 col on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {TEMPLATES.map((template, index) => (
          <TemplateThumbnail
            key={template.id}
            template={template}
            isSelected={selected === template.id}
            onClick={() => setSelected(template.id)}
            index={index}
          />
        ))}
      </div>

      {/* Selected preview strip */}
      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-3 mb-6 flex items-center gap-3"
        style={{ background: `${selectedTemplate.colors.primary}12`, border: `1px solid ${selectedTemplate.colors.primary}30` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex-shrink-0"
          style={{ background: selectedTemplate.colors.heroGradient }}
        />
        <div>
          <p className="text-sm font-semibold" style={{ color: selectedTemplate.colors.primary }}>
            {selectedTemplate.name} — {selectedTemplate.tagline}
          </p>
          <p className="text-xs text-muted-foreground">This style will be applied to your brochure and PDF export</p>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={() => onSelect(selected)}
          className="gap-2 min-w-[220px] text-base py-5"
          style={{ background: selectedTemplate.colors.primary, color: '#fff' }}
        >
          Continue with {selectedTemplate.name}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
