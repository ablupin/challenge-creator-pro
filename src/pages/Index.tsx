import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useSearchParams } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { StepProgress } from '@/components/StepProgress';
import { ChallengeTypeSelector } from '@/components/ChallengeTypeSelector';
import { FoodChallengeForm } from '@/components/FoodChallengeForm';
import { FitnessChallengeForm } from '@/components/FitnessChallengeForm';
import { AIGeneratingView } from '@/components/AIGeneratingView';
import { MealPlanEditor } from '@/components/MealPlanEditor';
import { WorkoutPlanEditor } from '@/components/WorkoutPlanEditor';
import { BrochurePreview } from '@/components/BrochurePreview';
import { TemplatePicker } from '@/components/TemplatePicker';
import { ChallengeType, WizardStep, FoodChallengeInput, FitnessChallengeInput, FoodDay, FitnessDay, Challenge } from '@/types/challenge';
import { useInfluencers, useCreateChallenge } from '@/hooks/useDashboard';
import { AddInfluencerModal } from '@/components/dashboard/AddInfluencerModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Index = () => {
  const [step, setStep] = useState<WizardStep>('select-type');
  const [challengeType, setChallengeType] = useState<ChallengeType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('lumiere');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [influencerIdForSave, setInfluencerIdForSave] = useState<string | null>(null);
  const [addInfluencerOpen, setAddInfluencerOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const { influencers } = useInfluencers();
  const createChallenge = useCreateChallenge();

  useEffect(() => {
    const paramInfluencer = searchParams.get('influencer');
    if (paramInfluencer) {
      setInfluencerIdForSave(paramInfluencer);
    }
  }, [searchParams]);

  const handleSelectType = (type: ChallengeType) => {
    setChallengeType(type);
    setStep('select-template');
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep('input-form');
  };

  const generatePlan = useCallback(async (input: FoodChallengeInput | FitnessChallengeInput, type: ChallengeType) => {
    setStep('ai-draft');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-challenge', {
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
        '/api/generate-challenge',
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
        '/api/generate-challenge',
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
        '/api/generate-challenge',
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

  const saveChallengeRecord = useCallback(async (approvedChallenge: Challenge) => {
    if (!influencerIdForSave) return;
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + approvedChallenge.input.numberOfDays);

    const title =
      approvedChallenge.type === 'food'
        ? `${approvedChallenge.input.dietTheme} Challenge`
        : `${approvedChallenge.input.workoutTheme} Challenge`;

    try {
      await createChallenge.mutateAsync({
        influencer_id: influencerIdForSave,
        title,
        type: approvedChallenge.type,
        drop_date: today.toISOString().split('T')[0],
        expiry_date: expiryDate.toISOString().split('T')[0],
        status: 'active',
        plan_json: approvedChallenge.plan,
        pdf_url: null,
        notes: null,
      });
    } catch {
      // Non-blocking — don't interrupt the brochure flow
    }
  }, [influencerIdForSave, createChallenge]);

  const handleApprove = () => {
    if (challenge) {
      const approved = { ...challenge, approved: true };
      setChallenge(approved);
      setStep('brochure-preview');
      saveChallengeRecord(approved);
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
        <div className="container py-4 flex items-center">
          <h1 className="font-display text-xl font-bold text-gradient-hero">ChallengeForge</h1>
          <div className="ml-auto">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {step !== 'select-type' && (
          <div className="mb-12">
            <StepProgress currentStep={step} challengeType={challengeType} />
          </div>
        )}

        {step === 'select-type' && (
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground whitespace-nowrap">Creating for:</span>
              <Select
                value={influencerIdForSave ?? 'none'}
                onValueChange={(v) => {
                  if (v === 'add-new') {
                    setAddInfluencerOpen(true);
                  } else {
                    setInfluencerIdForSave(v === 'none' ? null : v);
                  }
                }}
              >
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Select influencer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No influencer</SelectItem>
                  {influencers.map((inf) => (
                    <SelectItem key={inf.id} value={inf.id}>
                      {inf.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="add-new">+ Add new influencer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'select-type' && <ChallengeTypeSelector key="select" onSelect={handleSelectType} />}

          {step === 'select-template' && challengeType && (
            <TemplatePicker
              key="template-picker"
              challengeType={challengeType}
              onSelect={handleSelectTemplate}
              onBack={() => setStep('select-type')}
            />
          )}

          {step === 'input-form' && challengeType === 'food' && (
            <FoodChallengeForm
              key="food-form"
              onSubmit={(i) => generatePlan({ ...i, selectedTemplate }, 'food')}
              onBack={() => setStep('select-template')}
            />
          )}

          {step === 'input-form' && challengeType === 'fitness' && (
            <FitnessChallengeForm
              key="fitness-form"
              onSubmit={(i) => generatePlan({ ...i, selectedTemplate }, 'fitness')}
              onBack={() => setStep('select-template')}
            />
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

      <AddInfluencerModal open={addInfluencerOpen} onClose={() => setAddInfluencerOpen(false)} />
    </div>
  );
};

export default Index;
