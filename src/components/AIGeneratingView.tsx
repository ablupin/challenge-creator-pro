import { motion } from 'framer-motion';
import { Sparkles, Utensils, Dumbbell } from 'lucide-react';
import { ChallengeType } from '@/types/challenge';

interface AIGeneratingViewProps {
  challengeType: ChallengeType;
}

export function AIGeneratingView({ challengeType }: AIGeneratingViewProps) {
  const Icon = challengeType === 'food' ? Utensils : Dumbbell;
  const gradient = challengeType === 'food' ? 'bg-gradient-food' : 'bg-gradient-fitness';
  const title = challengeType === 'food' ? 'meal plan' : 'workout program';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[50vh] px-4"
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`w-24 h-24 rounded-2xl ${gradient} flex items-center justify-center mb-8 shadow-lg`}
      >
        <Icon className="w-12 h-12 text-white" />
      </motion.div>

      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        <h2 className="font-display text-2xl md:text-3xl font-bold">
          Creating your {title}
        </h2>
        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
      </div>

      <p className="text-muted-foreground text-center max-w-md mb-8">
        Our AI is crafting a personalized {challengeType === 'food' ? 'meal plan with delicious recipes' : 'workout program with effective exercises'} just for you...
      </p>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-3 h-3 rounded-full bg-primary"
          />
        ))}
      </div>
    </motion.div>
  );
}
