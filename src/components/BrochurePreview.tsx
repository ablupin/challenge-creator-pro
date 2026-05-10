import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Utensils, Dumbbell, Copy, Download, Loader2, Sparkles, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Challenge, FoodDay, FitnessDay, FoodChallenge, FitnessChallenge } from '@/types/challenge';
import { BrochureFormatConfig, DEFAULT_FOOD_FORMAT, DEFAULT_FITNESS_FORMAT } from '@/types/brochure';
import { generateTileBasedPDF } from '@/lib/pdf-tile-generator';
import { useBrochureImages } from '@/hooks/useBrochureImages';
import { BrochureFormatPanel } from '@/components/BrochureFormatPanel';
import { getTemplate } from '@/data/templates';

interface BrochurePreviewProps {
  challenge: Challenge;
  onExport: () => void;
  onStartNew: () => void;
  onChangeStyle?: () => void;
}

export function BrochurePreview({ challenge, onExport, onStartNew, onChangeStyle }: BrochurePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { brochureImages, generateBrochureImages } = useBrochureImages();
  const [formatConfig, setFormatConfig] = useState<BrochureFormatConfig>(
    challenge.type === 'food' ? { ...DEFAULT_FOOD_FORMAT } : { ...DEFAULT_FITNESS_FORMAT }
  );

  const isFood = challenge.type === 'food';
  const Icon = isFood ? Utensils : Dumbbell;
  const gradient = isFood ? 'bg-gradient-food' : 'bg-gradient-fitness';

  const templateId = isFood
    ? (challenge as FoodChallenge).input.selectedTemplate || 'blaze'
    : (challenge as FitnessChallenge).input.selectedTemplate || 'blaze';

  const template = getTemplate(templateId);

  const influencerPhotos = isFood
    ? (challenge as FoodChallenge).input.photoPreviews || []
    : (challenge as FitnessChallenge).input.photoPreviews || [];

  const influencerPhoto = influencerPhotos[0] || null;

  const challengeTitle = isFood
    ? `${(challenge as FoodChallenge).input.numberOfDays}-Day ${(challenge as FoodChallenge).input.dietTheme} Food Challenge`
    : `${(challenge as FitnessChallenge).input.numberOfDays}-Day ${(challenge as FitnessChallenge).input.workoutTheme} Challenge`;

  const heroStyle: React.CSSProperties = template.style.headerStyle === 'gradient'
    ? { background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})` }
    : { background: template.colors.primary };

  const handleExport = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!", { description: "Share this link to let others view your challenge." });
    } catch {
      toast.info("Canva export coming soon!", { description: "For now, use the PDF download below." });
    }
  };

  const handleGenerateAndDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      toast.info('Generating AI images for your brochure...', {
        description: 'This may take 1-2 minutes',
        duration: 8000
      });

      const images = await generateBrochureImages(challenge, influencerPhotos);

      const validHeroCount = images.heroImages.filter(u => u).length;
      const validDayCount = images.dayImages.reduce((sum, day) => sum + day.filter(u => u).length, 0);

      if (validHeroCount === 0 && validDayCount === 0) {
        toast.warning('Could not generate images. Creating basic PDF...');
      } else {
        toast.success(`Generated ${validHeroCount} hero images and ${validDayCount} content images!`);
      }

      toast.info('Creating your PDF...', { duration: 3000 });
      await generateTileBasedPDF(challenge, images, formatConfig);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate images. Downloading basic PDF...');
      await generateTileBasedPDF(challenge, {
        heroImages: [],
        dayImages: [],
        isGenerating: false,
        progress: { current: 0, total: 0, stage: 'idle' }
      }, formatConfig);
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
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`w-20 h-20 rounded-2xl ${gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}
        >
          <Icon className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
          Your Brochure is Ready! 🎉
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Review your styled brochure below. Download as PDF when happy.
        </p>
      </div>

      {/* Template Info Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: heroStyle.background as string }}
          />
          <div>
            <p className="text-sm font-semibold">{template.name} — {template.tagline}</p>
            <p className="text-xs text-muted-foreground">Selected template</p>
          </div>
        </div>
        {onChangeStyle && (
          <Button variant="outline" size="sm" onClick={onChangeStyle} className="gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Change Style
          </Button>
        )}
      </div>

      {/* Live Brochure Preview */}
      <div
        className="rounded-2xl overflow-hidden border border-border shadow-xl mb-8"
        style={{ background: template.colors.bg, fontFamily: template.font.body }}
      >
        {/* Hero Section */}
        <div
          className="relative min-h-[180px] flex flex-col md:flex-row items-center justify-center gap-6 px-8 py-8 overflow-hidden"
          style={heroStyle}
        >
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: template.style.pattern === 'dots'
                ? 'radial-gradient(circle, white 1.5px, transparent 1.5px)'
                : template.style.pattern === 'diagonal'
                ? 'repeating-linear-gradient(45deg, white, white 1px, transparent 1px, transparent 12px)'
                : template.style.pattern === 'geometric'
                ? 'repeating-linear-gradient(0deg, white, white 1px, transparent 1px, transparent 16px), repeating-linear-gradient(90deg, white, white 1px, transparent 1px, transparent 16px)'
                : 'none',
              backgroundSize: template.style.pattern === 'dots' ? '16px 16px' : 'auto',
            }}
          />

          {/* Influencer photo */}
          {influencerPhoto && (
            <div className="relative z-10 flex-shrink-0">
              <img
                src={influencerPhoto}
                alt="Influencer"
                className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-white/40 shadow-xl"
              />
            </div>
          )}

          {/* Hero Text */}
          <div className="relative z-10 text-center md:text-left">
            <h1
              className="text-white text-2xl md:text-3xl font-bold leading-tight mb-2"
              style={{ fontFamily: template.font.heading }}
            >
              {challengeTitle}
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              Your transformation starts here
            </p>
            <div
              className="mt-3 h-1 w-16 rounded-full"
              style={{ background: template.colors.accent }}
            />
          </div>
        </div>

        {/* Day-by-day content */}
        <div className="p-4 md:p-6 space-y-4">
          {(challenge.plan as (FoodDay | FitnessDay)[]).map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="rounded-xl overflow-hidden"
              style={{
                border: `1px solid ${template.colors.primary}20`,
                background: template.colors.cardBg,
              }}
            >
              {/* Day header */}
              <div
                className="px-4 py-2 flex items-center gap-2"
                style={{ background: template.colors.secondary }}
              >
                <span
                  className="text-sm font-bold tracking-wide text-white"
                  style={{ fontFamily: template.font.heading }}
                >
                  DAY {day.dayNumber}
                </span>
                {isFood ? null : (day as FitnessDay).isRestDay ? (
                  <span className="text-xs text-white/70 ml-auto">Rest Day</span>
                ) : null}
              </div>

              {/* Day content */}
              <div className="p-3">
                {isFood ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(day as FoodDay).meals.map((meal, mealIndex) => (
                      <div
                        key={mealIndex}
                        className="flex gap-3 rounded-lg overflow-hidden"
                        style={{
                          background: template.colors.bg,
                          border: template.style.cardStyle === 'outlined' ? `1px solid ${template.colors.primary}30` : 'none',
                          boxShadow: template.style.cardStyle === 'elevated' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        }}
                      >
                        {/* Food image */}
                        <img
                          src={`https://source.unsplash.com/80x80/?food,${encodeURIComponent(meal.name.split(' ')[0])}`}
                          alt={meal.name}
                          className="w-16 h-16 object-cover flex-shrink-0"
                          style={{ borderRadius: template.style.rounded === 'rounded-3xl' ? '8px 0 0 8px' : '4px 0 0 4px' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="py-2 pr-2 flex-1 min-w-0">
                          <p
                            className="text-xs font-semibold truncate"
                            style={{ color: template.colors.text, fontFamily: template.font.heading }}
                          >
                            {meal.name}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {meal.ingredients.slice(0, 2).map((ing, i) => (
                              <span
                                key={i}
                                className="text-[9px] px-1 py-0.5 rounded"
                                style={{
                                  background: `${template.colors.accent}30`,
                                  color: template.colors.mutedText,
                                }}
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (day as FitnessDay).isRestDay ? (
                  <div className="text-center py-4">
                    <p
                      className="text-sm italic"
                      style={{ color: template.colors.mutedText }}
                    >
                      🧘 Rest & Recovery Day
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(day as FitnessDay).exercises.map((exercise, exIndex) => (
                      <div
                        key={exIndex}
                        className="flex gap-3 rounded-lg overflow-hidden"
                        style={{
                          background: template.colors.bg,
                          border: template.style.cardStyle === 'outlined' ? `1px solid ${template.colors.primary}30` : 'none',
                          boxShadow: template.style.cardStyle === 'elevated' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        }}
                      >
                        {/* Exercise image */}
                        <img
                          src={`https://source.unsplash.com/80x80/?fitness,exercise,${encodeURIComponent(exercise.name.split(' ')[0])}`}
                          alt={exercise.name}
                          className="w-16 h-16 object-cover flex-shrink-0"
                          style={{ borderRadius: '4px 0 0 4px' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="py-2 pr-2 flex-1 min-w-0">
                          <p
                            className="text-xs font-semibold truncate"
                            style={{ color: template.colors.text, fontFamily: template.font.heading }}
                          >
                            {exercise.name}
                          </p>
                          <p
                            className="text-[10px] mt-0.5"
                            style={{ color: template.colors.mutedText }}
                          >
                            {exercise.sets} sets × {exercise.reps}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 text-center text-xs"
          style={{ background: template.colors.primary, color: 'rgba(255,255,255,0.7)' }}
        >
          Generated with ChallengeForge • ⚠️ Consult a physician before starting any program
        </div>
      </div>

      {/* AI Features Highlight */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${gradient}`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">AI-Enhanced PDF</h4>
              <p className="text-muted-foreground text-sm">
                Your downloaded PDF includes AI-generated {isFood ? 'food photography' : 'workout images'} and your template styling.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Format Customization Panel */}
      <div className="mb-8">
        <BrochureFormatPanel
          config={formatConfig}
          onChange={setFormatConfig}
          challengeType={isFood ? 'food' : 'fitness'}
        />
      </div>

      {/* Download Progress */}
      {isDownloading && brochureImages.isGenerating && (
        <Card className="mb-6 border-primary/30">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {brochureImages.progress.stage === 'hero' && 'Creating influencer scenes...'}
                  {brochureImages.progress.stage === 'content' && `Generating ${isFood ? 'food photography' : 'exercise images'}...`}
                  {brochureImages.progress.stage === 'complete' && 'Building your PDF...'}
                </span>
                <span className="text-muted-foreground">
                  {brochureImages.progress.current}/{brochureImages.progress.total}
                </span>
              </div>
              <Progress
                value={(brochureImages.progress.current / brochureImages.progress.total) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export actions */}
      <Card className="bg-gradient-to-br from-card to-muted/30 border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Export Your Brochure</h3>
              <p className="text-muted-foreground">
                Download as a polished AI-generated PDF, or copy a shareable link.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                onClick={handleExport}
                className={`gap-2 ${gradient} hover:opacity-90 text-white min-w-[180px]`}
              >
                <Copy className="w-4 h-4" />
                Copy Share Link
              </Button>
              <Button
                variant="outline"
                className="gap-2 min-w-[180px]"
                onClick={handleGenerateAndDownloadPDF}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloading ? 'Generating...' : 'Download AI PDF'}
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
    </motion.div>
  );
}
