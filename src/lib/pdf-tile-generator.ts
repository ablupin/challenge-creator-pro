import { jsPDF } from 'jspdf';
import { Challenge, FoodDay, FitnessDay, FoodChallenge, FitnessChallenge } from '@/types/challenge';
import { BrochureImages, BrochureFormatConfig, DEFAULT_FOOD_FORMAT, DEFAULT_FITNESS_FORMAT } from '@/types/brochure';
import { prefetchAllImages } from './image-utils';

interface PDFColors {
  primary: [number, number, number];
  secondary: [number, number, number];
  accent: [number, number, number];
  text: [number, number, number];
  muted: [number, number, number];
  cardBg: [number, number, number];
  white: [number, number, number];
}

function colorsFromConfig(cfg: BrochureFormatConfig): PDFColors {
  return {
    primary: cfg.colors.primary,
    secondary: cfg.colors.secondary,
    accent: cfg.colors.accent,
    text: cfg.colors.text,
    muted: [100, 100, 100],
    cardBg: cfg.colors.cardBg,
    white: [255, 255, 255],
  };
}

function marginMM(size: 'small' | 'medium' | 'large'): number {
  return size === 'small' ? 6 : size === 'large' ? 16 : 10;
}

function pageDimensions(format: 'a4' | 'letter'): { width: number; height: number } {
  return format === 'letter' ? { width: 216, height: 279 } : { width: 210, height: 297 };
}

function heroBannerMM(size: 'hidden' | 'small' | 'medium' | 'large'): number {
  const map = { hidden: 0, small: 35, medium: 50, large: 70 };
  return map[size];
}

function addImageSafe(doc: jsPDF, imageData: string | undefined, x: number, y: number, w: number, h: number): boolean {
  if (!imageData || imageData === '') return false;
  try {
    doc.addImage(imageData, 'JPEG', x, y, w, h);
    return true;
  } catch (e) {
    console.warn('Failed to add image:', e);
    return false;
  }
}

function addHeroBanner(doc: jsPDF, imageData: string | undefined, x: number, y: number, w: number, h: number): boolean {
  if (!imageData || imageData === '') return false;
  try {
    const sourceAspect = 16 / 9;
    const targetAspect = w / h;
    let drawW = w, drawH = h, drawX = x, drawY = y;

    if (sourceAspect > targetAspect) {
      drawH = w / sourceAspect;
      drawY = y + (h - drawH) / 2;
    } else {
      drawW = h * sourceAspect;
      drawX = x + (w - drawW) / 2;
    }

    doc.addImage(imageData, 'JPEG', drawX, drawY, drawW, drawH);
    return true;
  } catch (e) {
    console.warn('Failed to add hero banner:', e);
    return false;
  }
}

function addContentTile(doc: jsPDF, imageData: string | undefined, x: number, y: number, w: number, h: number): boolean {
  if (!imageData || imageData === '') return false;
  try {
    const sourceAspect = 1;
    const targetAspect = w / h;
    let drawW = w, drawH = h, drawX = x, drawY = y;

    if (sourceAspect > targetAspect) {
      drawH = w / sourceAspect;
      drawY = y + (h - drawH) / 2;
    } else {
      drawW = h * sourceAspect;
      drawX = x + (w - drawW) / 2;
    }

    doc.addImage(imageData, 'JPEG', drawX, drawY, drawW, drawH);
    return true;
  } catch (e) {
    console.warn('Failed to add content tile:', e);
    return false;
  }
}

function drawTileBackground(doc: jsPDF, x: number, y: number, w: number, h: number, color: [number, number, number], radius = 4) {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y, w, h, radius, radius, 'F');
}

function drawTileBorder(doc: jsPDF, x: number, y: number, w: number, h: number, color: [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 4, 4, 'S');
}

// ============ TITLE PAGE ============
function generateTitlePage(
  doc: jsPDF,
  challenge: Challenge,
  colors: PDFColors,
  cfg: BrochureFormatConfig,
  pageW: number,
  pageH: number,
  margin: number,
  contentW: number,
  heroImage?: string
) {
  const numberOfDays = challenge.type === 'food'
    ? (challenge as FoodChallenge).input.numberOfDays
    : (challenge as FitnessChallenge).input.numberOfDays;
  const theme = challenge.type === 'food'
    ? (challenge as FoodChallenge).input.dietTheme
    : (challenge as FitnessChallenge).input.workoutTheme;

  // Hero image or gradient fallback
  if (heroImage) {
    addImageSafe(doc, heroImage, 0, 0, pageW, pageH);
    doc.setFillColor(30, 30, 30);
    doc.rect(0, pageH / 2 - 60, pageW, 140, 'F');
  } else {
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageW, pageH, 'F');
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.triangle(pageW, 0, pageW, pageH * 0.5, 0, 0, 'F');
  }

  // Title tile
  const titleTileY = pageH / 2 - 40;
  const titleTileH = 80;

  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(margin, titleTileY, contentW, titleTileH, 8, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(cfg.typography.titleSize);
  doc.setFont('helvetica', 'bold');
  doc.text(`${numberOfDays}-Day`, pageW / 2, titleTileY + 30, { align: 'center' });
  doc.text(cfg.branding.customTitle, pageW / 2, titleTileY + 52, { align: 'center' });

  // Theme badge
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const themeY = titleTileY + titleTileH + 15;
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  const themeWidth = doc.getTextWidth(theme.toUpperCase()) + 30;
  doc.roundedRect((pageW - themeWidth) / 2, themeY - 8, themeWidth, 20, 10, 10, 'F');
  doc.text(theme.toUpperCase(), pageW / 2, themeY + 5, { align: 'center' });

  // Tagline
  if (cfg.branding.tagline) {
    doc.setFontSize(10);
    doc.text(cfg.branding.tagline, pageW / 2, pageH - 20, { align: 'center' });
  }
}

// ============ DAY PAGE WITH TILES ============
function generateDayPage(
  doc: jsPDF,
  day: FoodDay | FitnessDay,
  dayIndex: number,
  challenge: Challenge,
  colors: PDFColors,
  cfg: BrochureFormatConfig,
  pageW: number,
  pageH: number,
  margin: number,
  contentW: number,
  heroImage?: string,
  dayContentImages?: string[]
) {
  const isFood = challenge.type === 'food';
  const tileGap = 5;

  // Header tile
  const headerH = 35;
  drawTileBackground(doc, 0, 0, pageW, headerH, colors.primary);

  if (heroImage) {
    const accentSize = 28;
    const accentX = pageW - margin - accentSize;
    const accentY = (headerH - accentSize) / 2 + 2;
    addHeroBanner(doc, heroImage, accentX, accentY, accentSize, accentSize);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.roundedRect(accentX, accentY, accentSize, accentSize, 4, 4, 'S');
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(cfg.typography.headerSize);
  doc.setFont('helvetica', 'bold');
  doc.text(`Day ${day.dayNumber}`, margin + 5, 24);

  // Hero banner tile
  let yPos = headerH + tileGap;
  const bannerH = heroBannerMM(cfg.layout.heroBannerHeight);

  if (bannerH > 0 && heroImage) {
    addHeroBanner(doc, heroImage, margin, yPos, contentW, bannerH);
    drawTileBorder(doc, margin, yPos, contentW, bannerH, colors.secondary);
    yPos += bannerH + tileGap;
  }

  if (isFood) {
    generateFoodDayContent(doc, day as FoodDay, yPos, colors, cfg, pageW, pageH, margin, contentW, dayContentImages);
  } else {
    generateFitnessDayContent(doc, day as FitnessDay, yPos, colors, cfg, pageW, pageH, margin, contentW, dayContentImages);
  }

  // Disclaimer footer
  if (cfg.branding.showDisclaimer) {
    drawTileBackground(doc, 0, pageH - 15, pageW, 15, [245, 245, 245]);
    doc.setFontSize(7);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text('Not medical or nutritional advice. Consult a physician before starting.', pageW / 2, pageH - 5, { align: 'center' });
  }
}

function generateFoodDayContent(
  doc: jsPDF,
  day: FoodDay,
  startY: number,
  colors: PDFColors,
  cfg: BrochureFormatConfig,
  pageW: number,
  pageH: number,
  margin: number,
  contentW: number,
  dayImages?: string[]
) {
  let yPos = startY;
  const tileGap = 5;
  const textTileWidth = contentW * (1 - cfg.layout.imageRatio) - tileGap / 2;
  const imageTileWidth = contentW * cfg.layout.imageRatio - tileGap / 2;
  const mealTileH = 45;
  const bottomLimit = cfg.branding.showDisclaimer ? pageH - 25 : pageH - 10;

  for (let i = 0; i < day.meals.length; i++) {
    const meal = day.meals[i];
    if (yPos + mealTileH > bottomLimit) break;

    // Meal info tile (left)
    const leftX = margin;
    drawTileBackground(doc, leftX, yPos, textTileWidth, mealTileH, colors.cardBg);

    // Accent bar
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(leftX, yPos, 4, mealTileH, 'F');

    // Meal name
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(meal.name, leftX + 10, yPos + 14);

    // Ingredients
    doc.setFontSize(cfg.typography.bodySize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    const ingredientsText = meal.ingredients.join(' • ');
    const lines = doc.splitTextToSize(ingredientsText, textTileWidth - 15);
    doc.text(lines.slice(0, 3), leftX + 10, yPos + 24);

    // Food image tile (right)
    const rightX = margin + textTileWidth + tileGap;
    const foodImage = dayImages?.[i];

    if (foodImage) {
      addContentTile(doc, foodImage, rightX, yPos, imageTileWidth, mealTileH);
    } else {
      drawTileBackground(doc, rightX, yPos, imageTileWidth, mealTileH, colors.accent);
      doc.setFontSize(10);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text('🍽️', rightX + imageTileWidth / 2, yPos + mealTileH / 2 + 3, { align: 'center' });
    }
    drawTileBorder(doc, rightX, yPos, imageTileWidth, mealTileH, colors.secondary);

    yPos += mealTileH + tileGap;
  }
}

function generateFitnessDayContent(
  doc: jsPDF,
  day: FitnessDay,
  startY: number,
  colors: PDFColors,
  cfg: BrochureFormatConfig,
  pageW: number,
  pageH: number,
  margin: number,
  contentW: number,
  dayImages?: string[]
) {
  let yPos = startY;
  const tileGap = 5;
  const bottomLimit = cfg.branding.showDisclaimer ? pageH - 25 : pageH - 10;

  if (day.isRestDay) {
    const restTileH = 80;
    drawTileBackground(doc, margin, yPos, contentW, restTileH, colors.cardBg);

    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('🧘 Rest Day', pageW / 2, yPos + 35, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text('Take time to recover and recharge!', pageW / 2, yPos + 55, { align: 'center' });
    return;
  }

  const textTileWidth = contentW * (1 - cfg.layout.imageRatio) - tileGap / 2;
  const imageTileWidth = contentW * cfg.layout.imageRatio - tileGap / 2;
  const exerciseTileH = 35;

  for (let i = 0; i < day.exercises.length; i++) {
    const exercise = day.exercises[i];
    if (yPos + exerciseTileH > bottomLimit) break;

    // Exercise info tile (left)
    const leftX = margin;
    drawTileBackground(doc, leftX, yPos, textTileWidth, exerciseTileH, colors.cardBg);

    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(leftX, yPos, 4, exerciseTileH, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(exercise.name, leftX + 10, yPos + 15);

    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    const badgeText = `${exercise.sets} × ${exercise.reps}`;
    const badgeW = doc.getTextWidth(badgeText) + 12;
    doc.roundedRect(leftX + 10, yPos + 20, badgeW, 12, 3, 3, 'F');
    doc.setFontSize(cfg.typography.bodySize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, leftX + 16, yPos + 28);

    // Exercise image tile (right)
    const rightX = margin + textTileWidth + tileGap;
    const exerciseImage = dayImages?.[i];

    if (exerciseImage) {
      addContentTile(doc, exerciseImage, rightX, yPos, imageTileWidth, exerciseTileH);
    } else {
      drawTileBackground(doc, rightX, yPos, imageTileWidth, exerciseTileH, colors.accent);
      doc.setFontSize(10);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text('💪', rightX + imageTileWidth / 2, yPos + exerciseTileH / 2 + 3, { align: 'center' });
    }
    drawTileBorder(doc, rightX, yPos, imageTileWidth, exerciseTileH, colors.secondary);

    yPos += exerciseTileH + tileGap;
  }
}

export async function generateTileBasedPDF(
  challenge: Challenge,
  brochureImages: BrochureImages,
  formatConfig?: BrochureFormatConfig
): Promise<void> {
  const isFood = challenge.type === 'food';
  const cfg = formatConfig ?? (isFood ? DEFAULT_FOOD_FORMAT : DEFAULT_FITNESS_FORMAT);
  const colors = colorsFromConfig(cfg);
  const numberOfDays = isFood
    ? (challenge as FoodChallenge).input.numberOfDays
    : (challenge as FitnessChallenge).input.numberOfDays;

  const { width: pageW, height: pageH } = pageDimensions(cfg.layout.pageFormat);
  const margin = marginMM(cfg.layout.margin);
  const contentW = pageW - margin * 2;

  // Pre-fetch images
  console.log('Fetching images for PDF generation...');
  const fetchedImages = await prefetchAllImages(
    brochureImages.heroImages,
    brochureImages.dayImages
  );

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: cfg.layout.pageFormat === 'letter' ? 'letter' : 'a4',
  });

  // Title page
  generateTitlePage(doc, challenge, colors, cfg, pageW, pageH, margin, contentW, fetchedImages.heroImages[0]);

  // Day pages
  const plan = challenge.plan as (FoodDay | FitnessDay)[];

  for (let i = 0; i < plan.length; i++) {
    doc.addPage();
    const heroImage = fetchedImages.heroImages[i] || fetchedImages.heroImages[i % Math.max(fetchedImages.heroImages.length, 1)];
    const dayContentImages = fetchedImages.dayImages[i] || [];
    generateDayPage(doc, plan[i], i, challenge, colors, cfg, pageW, pageH, margin, contentW, heroImage, dayContentImages);
  }

  const filename = `${isFood ? 'food' : 'fitness'}-challenge-${numberOfDays}day-brochure.pdf`;
  doc.save(filename);
}
