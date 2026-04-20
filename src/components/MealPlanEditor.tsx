import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, RefreshCw, Pencil, Check, X, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FoodDay, Meal } from '@/types/challenge';
import { cn } from '@/lib/utils';

interface MealPlanEditorProps {
  plan: FoodDay[];
  onUpdatePlan: (plan: FoodDay[]) => void;
  onRegenerateMeal: (dayIndex: number, mealIndex: number) => void;
  onRegenerateDay: (dayIndex: number) => void;
  onRegenerateAll: () => void;
  onBack: () => void;
  onApprove: () => void;
  isRegenerating: boolean;
}

export function MealPlanEditor({
  plan,
  onUpdatePlan,
  onRegenerateMeal,
  onRegenerateDay,
  onRegenerateAll,
  onBack,
  onApprove,
  isRegenerating,
}: MealPlanEditorProps) {
  const [editingMeal, setEditingMeal] = useState<{ dayIndex: number; mealIndex: number } | null>(null);
  const [editedMeal, setEditedMeal] = useState<Meal | null>(null);

  const startEditing = (dayIndex: number, mealIndex: number) => {
    setEditingMeal({ dayIndex, mealIndex });
    setEditedMeal({ ...plan[dayIndex].meals[mealIndex] });
  };

  const saveEdit = () => {
    if (!editingMeal || !editedMeal) return;
    
    const newPlan = [...plan];
    newPlan[editingMeal.dayIndex].meals[editingMeal.mealIndex] = editedMeal;
    onUpdatePlan(newPlan);
    setEditingMeal(null);
    setEditedMeal(null);
  };

  const cancelEdit = () => {
    setEditingMeal(null);
    setEditedMeal(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-5xl mx-auto px-4"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-food flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Edit Meal Plan</h2>
            <p className="text-muted-foreground">Review and customize your meals</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onRegenerateAll}
          disabled={isRegenerating}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin")} />
          Regenerate All
        </Button>
      </div>

      <div className="space-y-6">
        {plan.map((day, dayIndex) => (
          <Card key={day.dayNumber} className="overflow-hidden">
            <CardHeader className="bg-food/5 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-xl">Day {day.dayNumber}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRegenerateDay(dayIndex)}
                  disabled={isRegenerating}
                  className="gap-2 text-food hover:text-food hover:bg-food/10"
                >
                  <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin")} />
                  Regenerate Day
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {day.meals.map((meal, mealIndex) => {
                  const isEditing = editingMeal?.dayIndex === dayIndex && editingMeal?.mealIndex === mealIndex;
                  
                  return (
                    <div
                      key={meal.id}
                      className={cn(
                        "p-4 rounded-lg border border-border bg-card transition-shadow",
                        isEditing && "ring-2 ring-food"
                      )}
                    >
                      {isEditing && editedMeal ? (
                        <div className="space-y-3">
                          <Input
                            value={editedMeal.name}
                            onChange={(e) => setEditedMeal({ ...editedMeal, name: e.target.value })}
                            placeholder="Meal name"
                            className="font-semibold"
                          />
                          <Input
                            value={editedMeal.ingredients.join(', ')}
                            onChange={(e) => setEditedMeal({
                              ...editedMeal,
                              ingredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            })}
                            placeholder="Ingredients (comma separated)"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveEdit} className="gap-1 bg-food hover:bg-food/90">
                              <Check className="w-4 h-4" /> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-lg">{meal.name}</h4>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => startEditing(dayIndex, mealIndex)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => onRegenerateMeal(dayIndex, mealIndex)}
                                disabled={isRegenerating}
                              >
                                <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin")} />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {meal.ingredients.join(', ')}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onApprove}
          className="gap-2 bg-gradient-food hover:opacity-90 text-white px-8"
        >
          Looks Good → Generate Brochure
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <p className="mt-6 text-sm text-muted-foreground text-center">
        ⚠️ This is not medical or nutritional advice. Consult a physician before starting any diet program.
      </p>
    </motion.div>
  );
}
