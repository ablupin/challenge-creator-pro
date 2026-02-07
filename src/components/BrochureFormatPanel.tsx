import { useState } from 'react';
import { Palette, Layout, Type, Tag, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { BrochureFormatConfig, DEFAULT_FOOD_FORMAT, DEFAULT_FITNESS_FORMAT } from '@/types/brochure';

function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

interface ColorPickerRowProps {
  label: string;
  value: [number, number, number];
  onChange: (value: [number, number, number]) => void;
}

function ColorPickerRow({ label, value, onChange }: ColorPickerRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <input
        type="color"
        value={rgbToHex(value)}
        onChange={(e) => onChange(hexToRgb(e.target.value))}
        className="w-10 h-8 rounded border border-border cursor-pointer bg-transparent"
      />
    </div>
  );
}

interface BrochureFormatPanelProps {
  config: BrochureFormatConfig;
  onChange: (config: BrochureFormatConfig) => void;
  challengeType: 'food' | 'fitness';
}

export function BrochureFormatPanel({ config, onChange, challengeType }: BrochureFormatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaults = challengeType === 'food' ? DEFAULT_FOOD_FORMAT : DEFAULT_FITNESS_FORMAT;

  const updateColors = (key: keyof BrochureFormatConfig['colors'], value: [number, number, number]) => {
    onChange({ ...config, colors: { ...config.colors, [key]: value } });
  };

  const updateLayout = <K extends keyof BrochureFormatConfig['layout']>(key: K, value: BrochureFormatConfig['layout'][K]) => {
    onChange({ ...config, layout: { ...config.layout, [key]: value } });
  };

  const updateTypography = (key: keyof BrochureFormatConfig['typography'], value: number) => {
    onChange({ ...config, typography: { ...config.typography, [key]: value } });
  };

  const updateBranding = <K extends keyof BrochureFormatConfig['branding']>(key: K, value: BrochureFormatConfig['branding'][K]) => {
    onChange({ ...config, branding: { ...config.branding, [key]: value } });
  };

  return (
    <Card className="border-border/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Customize Design</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {isOpen && (
        <CardContent className="pt-0 pb-4 px-4">
          <div className="flex justify-end mb-3">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={() => onChange(defaults)}>
              <RotateCcw className="w-3 h-3" />
              Reset defaults
            </Button>
          </div>

          <Accordion type="multiple" defaultValue={['colors']} className="w-full">
            {/* Colors */}
            <AccordionItem value="colors">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2"><Palette className="w-4 h-4" /> Colors</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-1">
                  <ColorPickerRow label="Primary" value={config.colors.primary} onChange={(v) => updateColors('primary', v)} />
                  <ColorPickerRow label="Secondary" value={config.colors.secondary} onChange={(v) => updateColors('secondary', v)} />
                  <ColorPickerRow label="Accent" value={config.colors.accent} onChange={(v) => updateColors('accent', v)} />
                  <ColorPickerRow label="Card Background" value={config.colors.cardBg} onChange={(v) => updateColors('cardBg', v)} />
                  <ColorPickerRow label="Text" value={config.colors.text} onChange={(v) => updateColors('text', v)} />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Layout */}
            <AccordionItem value="layout">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2"><Layout className="w-4 h-4" /> Layout</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-5 pt-1">
                  {/* Page Format */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Page Format</Label>
                    <RadioGroup
                      value={config.layout.pageFormat}
                      onValueChange={(v) => updateLayout('pageFormat', v as 'a4' | 'letter')}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="a4" id="fmt-a4" />
                        <Label htmlFor="fmt-a4" className="text-sm cursor-pointer">A4</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="letter" id="fmt-letter" />
                        <Label htmlFor="fmt-letter" className="text-sm cursor-pointer">US Letter</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Margins */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Margins</Label>
                    <RadioGroup
                      value={config.layout.margin}
                      onValueChange={(v) => updateLayout('margin', v as 'small' | 'medium' | 'large')}
                      className="flex gap-4"
                    >
                      {(['small', 'medium', 'large'] as const).map((m) => (
                        <div key={m} className="flex items-center gap-2">
                          <RadioGroupItem value={m} id={`margin-${m}`} />
                          <Label htmlFor={`margin-${m}`} className="text-sm cursor-pointer capitalize">{m}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Image Ratio */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs text-muted-foreground">Image-to-Text Ratio</Label>
                      <span className="text-xs text-muted-foreground">{Math.round(config.layout.imageRatio * 100)}% / {Math.round((1 - config.layout.imageRatio) * 100)}%</span>
                    </div>
                    <Slider
                      value={[config.layout.imageRatio]}
                      onValueChange={([v]) => updateLayout('imageRatio', v)}
                      min={0.3}
                      max={0.7}
                      step={0.05}
                    />
                  </div>

                  {/* Hero Banner */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Hero Banner Height</Label>
                    <RadioGroup
                      value={config.layout.heroBannerHeight}
                      onValueChange={(v) => updateLayout('heroBannerHeight', v as 'hidden' | 'small' | 'medium' | 'large')}
                      className="flex flex-wrap gap-3"
                    >
                      {(['hidden', 'small', 'medium', 'large'] as const).map((h) => (
                        <div key={h} className="flex items-center gap-2">
                          <RadioGroupItem value={h} id={`hero-${h}`} />
                          <Label htmlFor={`hero-${h}`} className="text-sm cursor-pointer capitalize">{h}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Typography */}
            <AccordionItem value="typography">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2"><Type className="w-4 h-4" /> Typography</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-5 pt-1">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs text-muted-foreground">Title Size</Label>
                      <span className="text-xs text-muted-foreground">{config.typography.titleSize}pt</span>
                    </div>
                    <Slider
                      value={[config.typography.titleSize]}
                      onValueChange={([v]) => updateTypography('titleSize', v)}
                      min={32}
                      max={56}
                      step={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs text-muted-foreground">Header Size</Label>
                      <span className="text-xs text-muted-foreground">{config.typography.headerSize}pt</span>
                    </div>
                    <Slider
                      value={[config.typography.headerSize]}
                      onValueChange={([v]) => updateTypography('headerSize', v)}
                      min={16}
                      max={28}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs text-muted-foreground">Body Size</Label>
                      <span className="text-xs text-muted-foreground">{config.typography.bodySize}pt</span>
                    </div>
                    <Slider
                      value={[config.typography.bodySize]}
                      onValueChange={([v]) => updateTypography('bodySize', v)}
                      min={8}
                      max={14}
                      step={0.5}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Branding */}
            <AccordionItem value="branding">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2"><Tag className="w-4 h-4" /> Branding</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Challenge Title</Label>
                    <Input
                      value={config.branding.customTitle}
                      onChange={(e) => updateBranding('customTitle', e.target.value)}
                      placeholder="e.g. Food Challenge"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Tagline</Label>
                    <Input
                      value={config.branding.tagline}
                      onChange={(e) => updateBranding('tagline', e.target.value)}
                      placeholder="e.g. Your transformation starts here"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Show disclaimer footer</Label>
                    <Switch
                      checked={config.branding.showDisclaimer}
                      onCheckedChange={(v) => updateBranding('showDisclaimer', v)}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
}
