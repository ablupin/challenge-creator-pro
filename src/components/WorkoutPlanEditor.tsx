import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, RefreshCw, Pencil, Check, X, Dumbbell, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FitnessDay, Exercise } from '@/types/challenge';
import { cn } from '@/lib/utils';

interface WorkoutPlanEditorProps {
  plan: FitnessDay[];
  onUpdatePlan: (plan: FitnessDay[]) => void;
  onRegenerateDay: (dayIndex: number) => void;
  onRegenerateAll: () => void;
  onToggleRestDay: (dayIndex: number) => void;
  onBack: () => void;
  onApprove: () => void;
  isRegenerating: boolean;
}

export function WorkoutPlanEditor({
  plan,
  onUpdatePlan,
  onRegenerateDay,
  onRegenerateAll,
  onToggleRestDay,
  onBack,
  onApprove,
  isRegenerating,
}: WorkoutPlanEditorProps) {
  const [editingExercise, setEditingExercise] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null);
  const [editedExercise, setEditedExercise] = useState<Exercise | null>(null);
  const [setsInput, setSetsInput] = useState('');

  const startEditing = (dayIndex: number, exerciseIndex: number) => {
    setEditingExercise({ dayIndex, exerciseIndex });
    const ex = plan[dayIndex].exercises[exerciseIndex];
    setEditedExercise({ ...ex });
    setSetsInput(String(ex.sets));
  };

  const saveEdit = () => {
    if (!editingExercise || !editedExercise) return;
    
    const newPlan = [...plan];
    newPlan[editingExercise.dayIndex].exercises[editingExercise.exerciseIndex] = editedExercise;
    onUpdatePlan(newPlan);
    setEditingExercise(null);
    setEditedExercise(null);
  };

  const cancelEdit = () => {
    setEditingExercise(null);
    setEditedExercise(null);
    setSetsInput('');
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
          <div className="w-12 h-12 rounded-xl bg-gradient-fitness flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Edit Workout Plan</h2>
            <p className="text-muted-foreground">Customize exercises, sets, and reps</p>
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
            <CardHeader className={cn(
              "border-b border-border",
              day.isRestDay ? "bg-muted/50" : "bg-fitness/5"
            )}>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  Day {day.dayNumber}
                  {day.isRestDay && (
                    <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                      <Moon className="w-4 h-4" /> Rest Day
                    </span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleRestDay(dayIndex)}
                    className={cn(
                      "gap-2",
                      day.isRestDay 
                        ? "text-fitness hover:text-fitness hover:bg-fitness/10"
                        : "text-muted-foreground"
                    )}
                  >
                    <Moon className="w-4 h-4" />
                    {day.isRestDay ? 'Make Workout Day' : 'Make Rest Day'}
                  </Button>
                  {!day.isRestDay && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRegenerateDay(dayIndex)}
                      disabled={isRegenerating}
                      className="gap-2 text-fitness hover:text-fitness hover:bg-fitness/10"
                    >
                      <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin")} />
                      Regenerate
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            {!day.isRestDay && (
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-4 font-semibold">Exercise</th>
                        <th className="text-center p-4 font-semibold w-24">Sets</th>
                        <th className="text-center p-4 font-semibold w-24">Reps</th>
                        <th className="text-center p-4 font-semibold w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.exercises.map((exercise, exerciseIndex) => {
                        const isEditing = editingExercise?.dayIndex === dayIndex && editingExercise?.exerciseIndex === exerciseIndex;
                        
                        return (
                          <tr 
                            key={exercise.id} 
                            className={cn(
                              "border-b border-border last:border-0",
                              isEditing && "bg-fitness/5"
                            )}
                          >
                            {isEditing && editedExercise ? (
                              <>
                                <td className="p-4">
                                  <Input
                                    value={editedExercise.name}
                                    onChange={(e) => setEditedExercise({ ...editedExercise, name: e.target.value })}
                                    className="h-9"
                                  />
                                </td>
                                <td className="p-4">
                                  <Input
                                    type="number"
                                    value={setsInput}
                                    onChange={(e) => setSetsInput(e.target.value)}
                                    onBlur={() => {
                                      const val = Math.max(1, parseInt(setsInput) || 1);
                                      setSetsInput(String(val));
                                      setEditedExercise({ ...editedExercise, sets: val });
                                    }}
                                    className="h-9 text-center"
                                  />
                                </td>
                                <td className="p-4">
                                  <Input
                                    value={editedExercise.reps}
                                    onChange={(e) => setEditedExercise({ ...editedExercise, reps: e.target.value })}
                                    className="h-9 text-center"
                                  />
                                </td>
                                <td className="p-4">
                                  <div className="flex justify-center gap-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit}>
                                      <Check className="w-4 h-4 text-fitness" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-4 font-medium">{exercise.name}</td>
                                <td className="p-4 text-center">{exercise.sets}</td>
                                <td className="p-4 text-center">{exercise.reps}</td>
                                <td className="p-4">
                                  <div className="flex justify-center gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => startEditing(dayIndex, exerciseIndex)}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
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
          className="gap-2 bg-gradient-fitness hover:opacity-90 text-white px-8"
        >
          Looks Good → Generate Brochure
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <p className="mt-6 text-sm text-muted-foreground text-center">
        ⚠️ Consult a physician before starting any fitness program.
      </p>
    </motion.div>
  );
}
