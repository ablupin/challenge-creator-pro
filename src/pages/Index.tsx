import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { StepProgress } from '@/components/StepProgress';
import { ChallengeTypeSelector } from '@/components/ChallengeTypeSelector';
import { FoodChallengeForm } from '@/components/FoodChallengeForm';
import { FitnessChallengeForm } from '@/components/FitnessChallengeForm';
import { AIGeneratingView } from '@/components/AIGeneratingView';
import { MealPlanEditor } from '@/components/MealPlanEditor';
import { WorkoutPlanEditor } from '@/components/WorkoutPlanEditor';
import { BrochurePreview } from '@/components/BrochurePreview';
import { ChallengeType, WizardStep, FoodChallengeInput, FitnessChallengeInput, FoodDay, FitnessDay, Challenge } from '@/types/challenge';

const Index = () => {
  const [step, setStep] = useState<WizardStep>('select-type');
  const [challengeType, setChallengeType] = useState<ChallengeType | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectType = (type: ChallengeType) => {
    setChallengeType(type);
    setStep('input-form');
  };

  const generatePlan = useCallback(async (input: FoodChallengeInput | FitnessChallengeInput, type: ChallengeType) => {
    setStep('ai-draft');
    setIsGenerating(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          type === 'food'
            ? { type: 'food', ...(input as FoodChallengeInput) }
            : { type: 'fitness', ...(input as FitnessChallengeInput) }
        ),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate');
      }

      const data = await response.json();

      if (type === 'food') {
        const plan: FoodDay[] = data.days.map((day: any) => ({
          dayNumber: day.dayNumber,
          meals: day.meals.map((meal: any, i: number) => ({
            id: `meal-${day.dayNumber}-${i}`,
            name: meal.name,
            ingredients: meal.ingredients,
          })),
        }));
        setChallenge({ type: 'food', input: input as FoodChallengeInput, plan, approved: false });
      } else {
        const plan: FitnessDay[] = data.days.map((day: any) => ({
          dayNumber: day.dayNumber,
          isRestDay: day.isRestDay || false,
          exercises: (day.exercises || []).map((ex: any, i: number) => ({
            id: `ex-${day.dayNumber}-${i}`,
            name: ex.name,
            sets: ex.sets,
            reps: String(ex.reps),
          })),
        }));
        setChallenge({ type: 'fitness', input: input as FitnessChallengeInput, plan, approved: false });
      }
      setStep('edit-plan');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate plan');
      setStep('input-form');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const regenerateMeal = useCallback(async (dayIndex: number, mealIndex: number) => {
    if (!challenge || challenge.type !== 'food') return;
    setIsGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-challenge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'food',
            regenerateType: 'meal',
            dietTheme: challenge.input.dietTheme,
            mealsPerDay: challenge.input.mealsPerDay,
            numberOfDays: challenge.input.numberOfDays,
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to regenerate meal');
      const data = await response.json();
      const newPlan = [...challenge.plan];
      newPlan[dayIndex] = {
        ...newPlan[dayIndex],
        meals: newPlan[dayIndex].meals.map((m, i) =>
          i === mealIndex
            ? { id: m.id, name: data.meal.name, ingredients: data.meal.ingredients }
            : m
        ),
      };
      setChallenge({ ...challenge, plan: newPlan });
      toast.success('Meal regenerated!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate');
    } finally {
      setIsGenerating(false);
    }
  }, [challenge]);

  const regenerateDay = useCallback(async (dayIndex: number) => {
    if (!challenge || challenge.type !== 'food') return;
    setIsGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-challenge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'food',
            regenerateType: 'day',
            dietTheme: challenge.input.dietTheme,
            mealsPerDay: challenge.input.mealsPerDay,
            numberOfDays: challenge.input.numberOfDays,
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to regenerate day');
      const data = await response.json();
      const newPlan = [...challenge.plan];
      newPlan[dayIndex] = {
        ...newPlan[dayIndex],
        meals: data.meals.map((meal: any, i: number) => ({
          id: `meal-${newPlan[dayIndex].dayNumber}-${i}`,
          name: meal.name,
          ingredients: meal.ingredients,
        })),
      };
      setChallenge({ ...challenge, plan: newPlan });
      toast.success('Day regenerated!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate');
    } finally {
      setIsGenerating(false);
    }
  }, [challenge]);

  const regenerateFitnessDay = useCallback(async (dayIndex: number) => {
    if (!challenge || challenge.type !== 'fitness') return;
    setIsGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-challenge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'fitness',
            regenerateType: 'day',
            workoutTheme: challenge.input.workoutTheme,
            exercisesPerWorkout: challenge.input.exercisesPerWorkout,
            numberOfDays: challenge.input.numberOfDays,
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to regenerate workout');
      const data = await response.json();
      const newPlan = [...challenge.plan];
      newPlan[dayIndex] = {
        ...newPlan[dayIndex],
        isRestDay: false,
        exercises: data.exercises.map((ex: any, i: number) => ({
          id: `ex-${newPlan[dayIndex].dayNumber}-${i}`,
          name: ex.name,
          sets: ex.sets,
          reps: String(ex.reps),
        })),
      };
      setChallenge({ ...challenge, plan: newPlan });
      toast.success('Workout regenerated!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate');
    } finally {
      setIsGenerating(false);
    }
  }, [challenge]);

  const handleApprove = () => {
    if (challenge) {
      setChallenge({ ...challenge, approved: true });
      setStep('brochure-preview');
    }
  };

  const handleExport = () => {
    toast.success('Opening Canva editor...', { description: 'Your brochure template is being prepared.' });
  };

  const handleStartNew = () => {
    setStep('select-type');
    setChallengeType(null);
    setChallenge(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <h1 className="font-display text-xl font-bold text-gradient-hero">ChallengeForge</h1>
        </div>
      </header>

      <main className="container py-8">
        {step !== 'select-type' && (
          <div className="mb-12">
            <StepProgress currentStep={step} challengeType={challengeType} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'select-type' && <ChallengeTypeSelector key="select" onSelect={handleSelectType} />}
          
          {step === 'input-form' && challengeType === 'food' && (
            <FoodChallengeForm key="food-form" onSubmit={(i) => generatePlan(i, 'food')} onBack={() => setStep('select-type')} />
          )}
          
          {step === 'input-form' && challengeType === 'fitness' && (
            <FitnessChallengeForm key="fitness-form" onSubmit={(i) => generatePlan(i, 'fitness')} onBack={() => setStep('select-type')} />
          )}
          
          {step === 'ai-draft' && challengeType && <AIGeneratingView key="generating" challengeType={challengeType} />}
          
          {step === 'edit-plan' && challenge?.type === 'food' && (
            <MealPlanEditor
              key="meal-editor"
              plan={challenge.plan}
              onUpdatePlan={(p) => setChallenge({ ...challenge, plan: p })}
              onRegenerateMeal={(dayIndex, mealIndex) => regenerateMeal(dayIndex, mealIndex)}
              onRegenerateDay={(dayIndex) => regenerateDay(dayIndex)}
              onRegenerateAll={() => generatePlan(challenge.input, 'food')}
              onBack={() => setStep('input-form')}
              onApprove={handleApprove}
              isRegenerating={isGenerating}
            />
          )}
          
          {step === 'edit-plan' && challenge?.type === 'fitness' && (
            <WorkoutPlanEditor
              key="workout-editor"
              plan={challenge.plan}
              onUpdatePlan={(p) => setChallenge({ ...challenge, plan: p })}
              onRegenerateDay={(dayIndex) => regenerateFitnessDay(dayIndex)}
              onRegenerateAll={() => generatePlan(challenge.input, 'fitness')}
              onToggleRestDay={(i) => {
                const newPlan = [...challenge.plan];
                newPlan[i] = { ...newPlan[i], isRestDay: !newPlan[i].isRestDay, exercises: newPlan[i].isRestDay ? [] : newPlan[i].exercises };
                setChallenge({ ...challenge, plan: newPlan });
              }}
              onBack={() => setStep('input-form')}
              onApprove={handleApprove}
              isRegenerating={isGenerating}
            />
          )}
          
          {step === 'brochure-preview' && challenge && (
            <BrochurePreview key="preview" challenge={challenge} onExport={handleExport} onStartNew={handleStartNew} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
