import { motion } from 'framer-motion';
import { Utensils, Dumbbell, ArrowRight } from 'lucide-react';
import { ChallengeType } from '@/types/challenge';
import { cn } from '@/lib/utils';

interface ChallengeTypeSelectorProps {
  onSelect: (type: ChallengeType) => void;
}

export function ChallengeTypeSelector({ onSelect }: ChallengeTypeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Create Your{' '}
          <span className="text-gradient-hero">Challenge</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Generate professional, Canva-editable challenge brochures with AI. Perfect for fitness influencers and social media managers.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <ChallengeCard
          type="food"
          title="Food Challenge"
          description="Create a complete meal plan with recipes, ingredients, and nutrition guidance"
          icon={Utensils}
          gradient="bg-gradient-food"
          delay={0.2}
          onSelect={() => onSelect('food')}
        />
        <ChallengeCard
          type="fitness"
          title="Fitness Challenge"
          description="Build a workout program with exercises, sets, reps, and rest days"
          icon={Dumbbell}
          gradient="bg-gradient-fitness"
          delay={0.3}
          onSelect={() => onSelect('fitness')}
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-sm text-muted-foreground text-center max-w-lg"
      >
        ⚠️ Disclaimer: This is not medical or nutritional advice. Consult a physician before starting any fitness or diet program.
      </motion.p>
    </div>
  );
}

interface ChallengeCardProps {
  type: ChallengeType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  delay: number;
  onSelect: () => void;
}

function ChallengeCard({
  title,
  description,
  icon: Icon,
  gradient,
  delay,
  onSelect,
}: ChallengeCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-8 text-left transition-shadow duration-300',
        'bg-card border border-border hover:shadow-xl hover:shadow-primary/10',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
          gradient
        )}
      />
      <div className="relative z-10">
        <div
          className={cn(
            'w-16 h-16 rounded-xl flex items-center justify-center mb-6',
            gradient
          )}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-display text-2xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <div className="flex items-center text-primary font-semibold">
          Get Started
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.button>
  );
}
