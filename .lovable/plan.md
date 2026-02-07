

## Fix: Connect Regenerate Day and Regenerate Meal Buttons to the API

### Problem

The "Regenerate Day" and "Regenerate Meal" buttons currently display a toast notification but never call the backend. The Edge Function already supports single-day and single-meal regeneration -- the frontend just needs to be wired up.

### Solution

Add two new handler functions in `Index.tsx` that call the `generate-challenge` Edge Function with the correct `regenerateType` parameter, then splice the AI-generated result back into the existing plan.

---

### Changes

**File: `src/pages/Index.tsx`**

1. Add a `regenerateMeal` async handler:
   - Calls the Edge Function with `{ type: 'food', regenerateType: 'meal', dietTheme, mealsPerDay }`
   - Receives a single `{ meal: { name, ingredients } }` response
   - Replaces the specific meal at `plan[dayIndex].meals[mealIndex]` with the new meal
   - Shows a success toast on completion and an error toast on failure
   - Wrapped in try/catch for proper error handling

2. Add a `regenerateDay` async handler for food challenges:
   - Calls the Edge Function with `{ type: 'food', regenerateType: 'day', dietTheme, mealsPerDay }`
   - Receives `{ meals: [...] }` response
   - Replaces all meals at `plan[dayIndex]` with the new meals
   - Shows a success toast on completion

3. Add a `regenerateFitnessDay` async handler for fitness challenges:
   - Calls the Edge Function with `{ type: 'fitness', regenerateType: 'day', workoutTheme, exercisesPerWorkout }`
   - Receives `{ exercises: [...] }` response
   - Replaces all exercises at `plan[dayIndex]` with the new exercises
   - Shows a success toast on completion

4. Replace the placeholder toast-only callbacks with the real handlers:
   - `onRegenerateMeal={(dayIndex, mealIndex) => regenerateMeal(dayIndex, mealIndex)}`
   - `onRegenerateDay={(dayIndex) => regenerateDay(dayIndex)}` (for food)
   - `onRegenerateDay={(dayIndex) => regenerateFitnessDay(dayIndex)}` (for fitness)

5. Use the existing `isGenerating` state to disable buttons during regeneration and show the spinner animation.

---

### Technical Details

Handler pattern (example for single meal):

```typescript
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
```

The same pattern applies for `regenerateDay` (food) and `regenerateFitnessDay`, just with different `regenerateType` values and response parsing.

---

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Add `regenerateMeal`, `regenerateDay`, and `regenerateFitnessDay` handlers; replace placeholder callbacks |

No backend changes needed -- the Edge Function already handles all three regeneration types.
