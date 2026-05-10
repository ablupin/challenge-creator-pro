export type ChallengeType = 'food' | 'fitness';

export interface Meal {
  id: string;
  name: string;
  ingredients: string[];
}

export interface FoodDay {
  dayNumber: number;
  meals: Meal[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
}

export interface FitnessDay {
  dayNumber: number;
  isRestDay: boolean;
  exercises: Exercise[];
}

export interface FoodChallengeInput {
  numberOfDays: number;
  mealsPerDay: number;
  dietTheme: string;
  photos: File[];
  photoPreviews: string[];
  selectedTemplate?: string;
}

export interface FitnessChallengeInput {
  numberOfDays: number;
  workoutTheme: string;
  exercisesPerWorkout: number;
  photos: File[];
  photoPreviews: string[];
  selectedTemplate?: string;
}

export interface FoodChallenge {
  type: 'food';
  input: FoodChallengeInput;
  plan: FoodDay[];
  approved: boolean;
}

export interface FitnessChallenge {
  type: 'fitness';
  input: FitnessChallengeInput;
  plan: FitnessDay[];
  approved: boolean;
}

export type Challenge = FoodChallenge | FitnessChallenge;

export type WizardStep =
  | 'select-type'
  | 'select-template'
  | 'input-form'
  | 'ai-draft'
  | 'edit-plan'
  | 'brochure-preview';
