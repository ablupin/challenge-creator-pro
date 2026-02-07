import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Upload, X, Utensils } from 'lucide-react';
import { compressImage } from '@/lib/image-compression';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FoodChallengeInput } from '@/types/challenge';

interface FoodChallengeFormProps {
  onSubmit: (input: FoodChallengeInput) => void;
  onBack: () => void;
}

export function FoodChallengeForm({ onSubmit, onBack }: FoodChallengeFormProps) {
  const [numberOfDays, setNumberOfDays] = useState(7);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [dietTheme, setDietTheme] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.slice(0, 10 - photos.length);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawDataUrl = e.target?.result as string;
        try {
          const compressed = await compressImage(rawDataUrl);
          setPhotosPreviews(prev => [...prev, compressed]);
        } catch {
          // Fallback to uncompressed if compression fails
          setPhotosPreviews(prev => [...prev, rawDataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    setPhotos(prev => [...prev, ...validFiles]);
  }, [photos.length]);

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotosPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dietTheme.trim()) return;
    
    onSubmit({
      numberOfDays,
      mealsPerDay,
      dietTheme: dietTheme.trim(),
      photos,
      photoPreviews: photosPreviews,
    });
  };

  const isValid = dietTheme.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl mx-auto px-4"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-food flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Food Challenge</h2>
            <p className="text-muted-foreground">Set up your meal plan challenge</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="days" className="text-base font-semibold">Number of Days</Label>
            <Input
              id="days"
              type="number"
              min={1}
              max={30}
              value={numberOfDays}
              onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
              className="h-12 text-lg"
            />
            <p className="text-sm text-muted-foreground">Duration of the challenge (1-30 days)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meals" className="text-base font-semibold">Meals Per Day</Label>
            <Input
              id="meals"
              type="number"
              min={1}
              max={6}
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(parseInt(e.target.value) || 1)}
              className="h-12 text-lg"
            />
            <p className="text-sm text-muted-foreground">Number of meals each day (1-6)</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme" className="text-base font-semibold">Diet Theme</Label>
          <Textarea
            id="theme"
            placeholder="e.g., High protein for muscle building, Vegan weight loss, Keto friendly, Mediterranean style..."
            value={dietTheme}
            onChange={(e) => setDietTheme(e.target.value)}
            className="min-h-[100px] text-base resize-none"
          />
          <p className="text-sm text-muted-foreground">Describe the type of diet or goal</p>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Influencer Photos (Optional)</Label>
          <p className="text-sm text-muted-foreground">Upload 2-10 photos of the influencer for the brochure</p>
          
          <div className="flex flex-wrap gap-3">
            {photosPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {photos.length < 10 && (
              <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <Button type="button" variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={!isValid}
            className="gap-2 bg-gradient-food hover:opacity-90 text-white"
          >
            Generate with AI
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
