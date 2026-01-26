import { jsPDF } from 'jspdf';
import { Challenge, FoodDay, FitnessDay, FoodChallenge, FitnessChallenge } from '@/types/challenge';
import { BrochureImages } from '@/types/brochure';
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

const FOOD_COLORS: PDFColors = {
  primary: [234, 88, 12],
  secondary: [251, 146, 60],
  accent: [254, 215, 170],
  text: [30, 30, 30],
  muted: [100, 100, 100],
  cardBg: [255, 247, 237],
  white: [255, 255, 255],
};

const FITNESS_COLORS: PDFColors = {
  primary: [37, 99, 235],
  secondary: [96, 165, 250],
  accent: [191, 219, 254],
  text: [30, 30, 30],
  muted: [100, 100, 100],
  cardBg: [239, 246, 255],
  white: [255, 255, 255],
};

// Tile dimensions (in mm for A4)
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 10;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const TILE_GAP = 5;

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

// Add hero/banner image with 16:9 aspect ratio preservation (for influencer photos)
function addHeroBanner(doc: jsPDF, imageData: string | undefined, x: number, y: number, w: number, h: number): boolean {
  if (!imageData || imageData === '') return false;
  try {
    // AI generates 16:9 aspect ratio images for banners
    // Fit to container while maintaining aspect ratio
    const sourceAspect = 16 / 9;
    const targetAspect = w / h;
    
    let drawW = w;
    let drawH = h;
    let drawX = x;
    let drawY = y;
    
    if (sourceAspect > targetAspect) {
      // Source is wider - fit to width, center vertically
      drawH = w / sourceAspect;
      drawY = y + (h - drawH) / 2;
    } else {
      // Source is taller - fit to height, center horizontally
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

// Add content tile image with 1:1 (square) aspect ratio preservation (for food/exercise photos)
function addContentTile(doc: jsPDF, imageData: string | undefined, x: number, y: number, w: number, h: number): boolean {
  if (!imageData || imageData === '') return false;
  try {
    // AI generates 1:1 square images for content tiles
    // Fit to container while maintaining aspect ratio
    const sourceAspect = 1;
    const targetAspect = w / h;
    
    let drawW = w;
    let drawH = h;
    let drawX = x;
    let drawY = y;
    
    if (sourceAspect > targetAspect) {
      // Source is wider - fit to width, center vertically
      drawH = w / sourceAspect;
      drawY = y + (h - drawH) / 2;
    } else {
      // Source is taller - fit to height, center horizontally
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

// Legacy function for backward compatibility
function addImageCover(doc: jsPDF, imageData: string | undefined, x: number, y: number, w: number, h: number): boolean {
  return addContentTile(doc, imageData, x, y, w, h);
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
  heroImage?: string
) {
  const isFood = challenge.type === 'food';
  const numberOfDays = isFood
    ? (challenge as FoodChallenge).input.numberOfDays
    : (challenge as FitnessChallenge).input.numberOfDays;
  const theme = isFood
    ? (challenge as FoodChallenge).input.dietTheme
    : (challenge as FitnessChallenge).input.workoutTheme;
  const title = isFood ? 'Food Challenge' : 'Fitness Challenge';

  // Hero image tile (full page background)
  if (heroImage) {
    addImageSafe(doc, heroImage, 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    // Dark overlay for text readability - use semi-transparent rect
    doc.setFillColor(30, 30, 30);
    doc.rect(0, PAGE_HEIGHT / 2 - 60, PAGE_WIDTH, 140, 'F');
  } else {
    // Gradient background fallback
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.triangle(PAGE_WIDTH, 0, PAGE_WIDTH, PAGE_HEIGHT * 0.5, 0, 0, 'F');
  }

  // Title tile
  const titleTileY = PAGE_HEIGHT / 2 - 40;
  const titleTileH = 80;
  
  // Title background
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(MARGIN, titleTileY, CONTENT_WIDTH, titleTileH, 8, 8, 'F');

  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.text(`${numberOfDays}-Day`, PAGE_WIDTH / 2, titleTileY + 30, { align: 'center' });
  doc.text(title, PAGE_WIDTH / 2, titleTileY + 52, { align: 'center' });

  // Theme badge tile
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const themeY = titleTileY + titleTileH + 15;
  
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  const themeWidth = doc.getTextWidth(theme.toUpperCase()) + 30;
  doc.roundedRect((PAGE_WIDTH - themeWidth) / 2, themeY - 8, themeWidth, 20, 10, 10, 'F');
  doc.text(theme.toUpperCase(), PAGE_WIDTH / 2, themeY + 5, { align: 'center' });

  // Footer tile
  doc.setFontSize(10);
  doc.text('Your transformation starts here', PAGE_WIDTH / 2, PAGE_HEIGHT - 20, { align: 'center' });
}

// ============ DAY PAGE WITH TILES ============
function generateDayPage(
  doc: jsPDF,
  day: FoodDay | FitnessDay,
  dayIndex: number,
  challenge: Challenge,
  colors: PDFColors,
  heroImage?: string,
  dayContentImages?: string[] // Images specific to THIS day
) {
  const isFood = challenge.type === 'food';

  // Header tile with influencer accent image
  const headerH = 35;
  drawTileBackground(doc, 0, 0, PAGE_WIDTH, headerH, colors.primary);
  
  // Add small influencer photo in header (right side) - always show
  if (heroImage) {
    const accentSize = 28;
    const accentX = PAGE_WIDTH - MARGIN - accentSize;
    const accentY = (headerH - accentSize) / 2 + 2;
    // Use hero banner function for proper 16:9 aspect ratio
    addHeroBanner(doc, heroImage, accentX, accentY, accentSize, accentSize);
    // Rounded border effect
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.roundedRect(accentX, accentY, accentSize, accentSize, 4, 4, 'S');
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`Day ${day.dayNumber}`, MARGIN + 5, 24);

  // Hero banner tile - SHOW ON EVERY PAGE with proper aspect ratio
  let yPos = headerH + TILE_GAP;
  
  if (heroImage) {
    const heroTileH = 50; // Slightly smaller to fit more content
    // Use hero banner function for proper 16:9 aspect ratio
    addHeroBanner(doc, heroImage, MARGIN, yPos, CONTENT_WIDTH, heroTileH);
    drawTileBorder(doc, MARGIN, yPos, CONTENT_WIDTH, heroTileH, colors.secondary);
    yPos += heroTileH + TILE_GAP;
  }

  if (isFood) {
    generateFoodDayContent(doc, day as FoodDay, yPos, colors, dayContentImages);
  } else {
    generateFitnessDayContent(doc, day as FitnessDay, yPos, colors, dayContentImages);
  }

  // Footer tile
  drawTileBackground(doc, 0, PAGE_HEIGHT - 15, PAGE_WIDTH, 15, [245, 245, 245]);
  doc.setFontSize(7);
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text('Not medical or nutritional advice. Consult a physician before starting.', PAGE_WIDTH / 2, PAGE_HEIGHT - 5, { align: 'center' });
}

function generateFoodDayContent(
  doc: jsPDF,
  day: FoodDay,
  startY: number,
  colors: PDFColors,
  dayImages?: string[] // Images specific to this day's meals
) {
  let yPos = startY;
  const tileWidth = (CONTENT_WIDTH - TILE_GAP) / 2;
  const mealTileH = 45;

  for (let i = 0; i < day.meals.length; i++) {
    const meal = day.meals[i];
    
    if (yPos + mealTileH > PAGE_HEIGHT - 25) break;

    // Meal info tile (left side)
    const leftX = MARGIN;
    drawTileBackground(doc, leftX, yPos, tileWidth, mealTileH, colors.cardBg);
    
    // Accent bar
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(leftX, yPos, 4, mealTileH, 'F');
    
    // Meal name
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(meal.name, leftX + 10, yPos + 14);
    
    // Ingredients
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    const ingredientsText = meal.ingredients.join(' • ');
    const lines = doc.splitTextToSize(ingredientsText, tileWidth - 15);
    doc.text(lines.slice(0, 3), leftX + 10, yPos + 24);

    // Food image tile (right side) - use THIS meal's specific image
    const rightX = MARGIN + tileWidth + TILE_GAP;
    const foodImage = dayImages?.[i]; // Direct index - image i corresponds to meal i
    
    if (foodImage) {
      addContentTile(doc, foodImage, rightX, yPos, tileWidth, mealTileH);
    } else {
      // Placeholder tile
      drawTileBackground(doc, rightX, yPos, tileWidth, mealTileH, colors.accent);
      doc.setFontSize(10);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text('🍽️', rightX + tileWidth / 2, yPos + mealTileH / 2 + 3, { align: 'center' });
    }
    drawTileBorder(doc, rightX, yPos, tileWidth, mealTileH, colors.secondary);

    yPos += mealTileH + TILE_GAP;
  }
}

function generateFitnessDayContent(
  doc: jsPDF,
  day: FitnessDay,
  startY: number,
  colors: PDFColors,
  dayImages?: string[] // Images specific to this day's exercises
) {
  let yPos = startY;

  if (day.isRestDay) {
    // Rest day tile
    const restTileH = 80;
    drawTileBackground(doc, MARGIN, yPos, CONTENT_WIDTH, restTileH, colors.cardBg);
    
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('🧘 Rest Day', PAGE_WIDTH / 2, yPos + 35, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text('Take time to recover and recharge!', PAGE_WIDTH / 2, yPos + 55, { align: 'center' });
    return;
  }

  const tileWidth = (CONTENT_WIDTH - TILE_GAP) / 2;
  const exerciseTileH = 35;

  for (let i = 0; i < day.exercises.length; i++) {
    const exercise = day.exercises[i];
    
    if (yPos + exerciseTileH > PAGE_HEIGHT - 25) break;

    // Exercise info tile (left)
    const leftX = MARGIN;
    drawTileBackground(doc, leftX, yPos, tileWidth, exerciseTileH, colors.cardBg);
    
    // Accent bar
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(leftX, yPos, 4, exerciseTileH, 'F');
    
    // Exercise name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(exercise.name, leftX + 10, yPos + 15);
    
    // Sets x Reps badge
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    const badgeText = `${exercise.sets} × ${exercise.reps}`;
    const badgeW = doc.getTextWidth(badgeText) + 12;
    doc.roundedRect(leftX + 10, yPos + 20, badgeW, 12, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, leftX + 16, yPos + 28);

    // Exercise image tile (right) - use THIS exercise's specific image
    const rightX = MARGIN + tileWidth + TILE_GAP;
    const exerciseImage = dayImages?.[i]; // Direct index
    
    if (exerciseImage) {
      addContentTile(doc, exerciseImage, rightX, yPos, tileWidth, exerciseTileH);
    } else {
      // Placeholder
      drawTileBackground(doc, rightX, yPos, tileWidth, exerciseTileH, colors.accent);
      doc.setFontSize(10);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text('💪', rightX + tileWidth / 2, yPos + exerciseTileH / 2 + 3, { align: 'center' });
    }
    drawTileBorder(doc, rightX, yPos, tileWidth, exerciseTileH, colors.secondary);

    yPos += exerciseTileH + TILE_GAP;
  }
}

export async function generateTileBasedPDF(
  challenge: Challenge,
  brochureImages: BrochureImages
): Promise<void> {
  const isFood = challenge.type === 'food';
  const colors = isFood ? FOOD_COLORS : FITNESS_COLORS;
  const numberOfDays = isFood
    ? (challenge as FoodChallenge).input.numberOfDays
    : (challenge as FitnessChallenge).input.numberOfDays;

  // Pre-fetch all images and convert URLs to base64 for PDF embedding
  console.log('Fetching images for PDF generation...');
  const fetchedImages = await prefetchAllImages(
    brochureImages.heroImages,
    brochureImages.dayImages
  );

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Title page - use first hero image
  generateTitlePage(doc, challenge, colors, fetchedImages.heroImages[0]);

  // Day pages - each day gets its OWN hero image and content images
  const plan = challenge.plan as (FoodDay | FitnessDay)[];
  
  for (let i = 0; i < plan.length; i++) {
    doc.addPage();
    // Each day gets its own unique hero image (cycling through available ones)
    const heroImage = fetchedImages.heroImages[i] || fetchedImages.heroImages[i % Math.max(fetchedImages.heroImages.length, 1)];
    // Each day gets its specific content images (dayImages[i] = images for day i)
    const dayContentImages = fetchedImages.dayImages[i] || [];
    generateDayPage(doc, plan[i], i, challenge, colors, heroImage, dayContentImages);
  }

  // Save
  const filename = `${isFood ? 'food' : 'fitness'}-challenge-${numberOfDays}day-brochure.pdf`;
  doc.save(filename);
}
