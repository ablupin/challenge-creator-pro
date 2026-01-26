import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Utensils, Dumbbell, ExternalLink, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Challenge, FoodDay, FitnessDay, FoodChallenge, FitnessChallenge } from '@/types/challenge';
import { generateChallengePDF } from '@/lib/pdf-generator';

interface BrochurePreviewProps {
  challenge: Challenge;
  onExport: () => void;
  onStartNew: () => void;
}

export function BrochurePreview({ challenge, onExport, onStartNew }: BrochurePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const isFood = challenge.type === 'food';
  const Icon = isFood ? Utensils : Dumbbell;
  const gradient = isFood ? 'bg-gradient-food' : 'bg-gradient-fitness';
  const title = isFood ? 'Food Challenge' : 'Fitness Challenge';

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    
    try {
      generateChallengePDF(challenge);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`w-20 h-20 rounded-2xl ${gradient} flex items-center justify-center mx-auto mb-6 shadow-lg`}
        >
          <Icon className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
          Your {title} is Ready! 🎉
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Review your brochure preview below, then export it as a Canva-editable file.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Brochure Preview
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Title Page */}
          <Card className="aspect-[3/4] overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`h-full ${gradient} flex flex-col items-center justify-center p-4 text-white`}>
              <Icon className="w-8 h-8 mb-2" />
              <p className="text-xs font-semibold text-center uppercase tracking-wider">
                {isFood 
                  ? `${(challenge as FoodChallenge).input.numberOfDays}-Day` 
                  : `${(challenge as FitnessChallenge).input.numberOfDays}-Day`}
              </p>
              <p className="text-sm font-bold text-center mt-1">{title}</p>
            </div>
          </Card>

          {/* Day Pages */}
          {(challenge.plan as (FoodDay | FitnessDay)[]).map((day, index) => (
            <Card key={index} className="aspect-[3/4] overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className={`${gradient} py-2 px-3`}>
                <CardTitle className="text-white text-sm">Day {day.dayNumber}</CardTitle>
              </CardHeader>
              <CardContent className="p-2 text-xs">
                {isFood ? (
                  <div className="space-y-1">
                    {(day as FoodDay).meals.slice(0, 3).map((meal, i) => (
                      <p key={i} className="truncate text-muted-foreground">{meal.name}</p>
                    ))}
                    {(day as FoodDay).meals.length > 3 && (
                      <p className="text-muted-foreground">+{(day as FoodDay).meals.length - 3} more</p>
                    )}
                  </div>
                ) : (day as FitnessDay).isRestDay ? (
                  <p className="text-muted-foreground italic">Rest Day</p>
                ) : (
                  <div className="space-y-1">
                    {(day as FitnessDay).exercises.slice(0, 3).map((ex, i) => (
                      <p key={i} className="truncate text-muted-foreground">{ex.name}</p>
                    ))}
                    {(day as FitnessDay).exercises.length > 3 && (
                      <p className="text-muted-foreground">+{(day as FitnessDay).exercises.length - 3} more</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-card to-muted/30 border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Export to Canva</h3>
              <p className="text-muted-foreground">
                Your brochure will be exported as a Canva-compatible file with editable text, replaceable images, and customizable branding.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                onClick={onExport}
                className={`gap-2 ${gradient} hover:opacity-90 text-white min-w-[180px]`}
              >
                <ExternalLink className="w-4 h-4" />
                Open in Canva
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 min-w-[180px]"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8">
        <Button variant="ghost" onClick={onStartNew} className="gap-2">
          Create Another Challenge
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <p className="mt-6 text-sm text-muted-foreground text-center">
        ⚠️ This is not medical or nutritional advice. Consult a physician before starting any program.
      </p>
    </motion.div>
  );
}
