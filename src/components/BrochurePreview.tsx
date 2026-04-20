import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Utensils, Dumbbell, Copy, Download, Loader2, Sparkles, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Challenge, FoodDay, FitnessDay, FoodChallenge, FitnessChallenge } from '@/types/challenge';
import { BrochureFormatConfig, DEFAULT_FOOD_FORMAT, DEFAULT_FITNESS_FORMAT } from '@/types/brochure';
import { generateTileBasedPDF } from '@/lib/pdf-tile-generator';
import { useBrochureImages } from '@/hooks/useBrochureImages';
import { BrochureFormatPanel } from '@/components/BrochureFormatPanel';

interface BrochurePreviewProps {
  challenge: Challenge;
  onExport: () => void;
  onStartNew: () => void;
}

export function BrochurePreview({ challenge, onExport, onStartNew }: BrochurePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { brochureImages, generateBrochureImages } = useBrochureImages();
  const [formatConfig, setFormatConfig] = useState<BrochureFormatConfig>(
    challenge.type === 'food' ? { ...DEFAULT_FOOD_FORMAT } : { ...DEFAULT_FITNESS_FORMAT }
  );
  const isFood = challenge.type === 'food';
  const Icon = isFood ? Utensils : Dumbbell;
  const gradient = isFood ? 'bg-gradient-food' : 'bg-gradient-fitness';
  const title = formatConfig.branding.customTitle || (isFood ? 'Food Challenge' : 'Fitness Challenge');
  const primaryStyle = {
    background: `rgb(${formatConfig.colors.primary.join(',')})`,
  };

  // Get influencer photos from challenge input (stored as photoPreviews - base64 strings)
  const influencerPhotos = isFood
    ? (challenge as FoodChallenge).input.photoPreviews || []
    : (challenge as FitnessChallenge).input.photoPreviews || [];

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
      toast.error('Failed to generate images. Downloading basic PDF...', {
        description: 'You can try again later'
      });
      
      // Fallback to basic PDF without AI images
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
          Review your brochure preview below. AI will generate stunning food photography and influencer images when you download.
        </p>
      </div>

      {/* AI Features Highlight */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${gradient}`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">AI-Enhanced Brochure</h4>
              <p className="text-muted-foreground text-sm">
                Your download includes AI-generated {isFood ? 'food photography and cooking scenes' : 'workout demonstrations'} featuring your uploaded influencer photos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Brochure Preview
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Title Page */}
          <Card className="aspect-[3/4] overflow-hidden hover:shadow-lg transition-shadow relative group">
            <div style={primaryStyle} className="h-full flex flex-col items-center justify-center p-4 text-white">
              <Icon className="w-8 h-8 mb-2" />
              <p className="text-xs font-semibold text-center uppercase tracking-wider">
                {isFood 
                  ? `${(challenge as FoodChallenge).input.numberOfDays}-Day` 
                  : `${(challenge as FitnessChallenge).input.numberOfDays}-Day`}
              </p>
              <p className="text-sm font-bold text-center mt-1">{title}</p>
            </div>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ImageIcon className="w-6 h-6 text-white" />
              <span className="text-white text-xs ml-1">AI Hero</span>
            </div>
          </Card>

          {/* Day Pages */}
          {(challenge.plan as (FoodDay | FitnessDay)[]).map((day, index) => (
            <Card key={index} className="aspect-[3/4] overflow-hidden hover:shadow-lg transition-shadow relative group">
              <CardHeader style={primaryStyle} className="py-2 px-3">
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
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="w-5 h-5 text-white" />
                <span className="text-white text-xs ml-1">+ AI Images</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

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

      <Card className="bg-gradient-to-br from-card to-muted/30 border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Export to Canva</h3>
              <p className="text-muted-foreground">
                Download your brochure as a polished AI-generated PDF, or copy a shareable link.
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

      <p className="mt-6 text-sm text-muted-foreground text-center">
        ⚠️ This is not medical or nutritional advice. Consult a physician before starting any program.
      </p>
    </motion.div>
  );
}
