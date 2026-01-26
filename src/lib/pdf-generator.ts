import { jsPDF } from 'jspdf';
import { Challenge, FoodDay, FitnessDay, FoodChallenge, FitnessChallenge } from '@/types/challenge';

interface PDFColors {
  primary: [number, number, number];
  secondary: [number, number, number];
  text: [number, number, number];
  muted: [number, number, number];
  cardBg: [number, number, number];
  white: [number, number, number];
}

const FOOD_COLORS: PDFColors = {
  primary: [234, 88, 12],      // orange-600
  secondary: [251, 146, 60],   // orange-400
  text: [30, 30, 30],
  muted: [100, 100, 100],
  cardBg: [255, 247, 237],     // orange-50
  white: [255, 255, 255],
};

const FITNESS_COLORS: PDFColors = {
  primary: [37, 99, 235],      // blue-600
  secondary: [96, 165, 250],   // blue-400
  text: [30, 30, 30],
  muted: [100, 100, 100],
  cardBg: [239, 246, 255],     // blue-50
  white: [255, 255, 255],
};

function drawRoundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  style: 'F' | 'S' | 'FD' = 'F'
) {
  doc.roundedRect(x, y, w, h, r, r, style);
}

function addCircularImage(
  doc: jsPDF,
  imageData: string,
  x: number,
  y: number,
  size: number
) {
  // Add the image with a circular clip mask
  const radius = size / 2;
  
  // Create circular clipping path
  doc.saveGraphicsState();
  
  // Draw circular clip path
  doc.circle(x + radius, y + radius, radius, 'F');
  
  // Unfortunately jsPDF doesn't support true clipping, so we add the image and then
  // overlay a "frame" to create the illusion of circular crop
  try {
    doc.addImage(imageData, 'JPEG', x, y, size, size);
  } catch (e) {
    // Fallback: draw a placeholder circle
    doc.setFillColor(200, 200, 200);
    doc.circle(x + radius, y + radius, radius, 'F');
  }
  
  doc.restoreGraphicsState();
}

function addImageWithFallback(
  doc: jsPDF,
  imageData: string | undefined,
  x: number,
  y: number,
  width: number,
  height: number
) {
  if (!imageData) return false;
  
  try {
    doc.addImage(imageData, 'JPEG', x, y, width, height);
    return true;
  } catch (e) {
    console.warn('Failed to add image to PDF:', e);
    return false;
  }
}

export function generateChallengePDF(challenge: Challenge): void {
  const isFood = challenge.type === 'food';
  const colors = isFood ? FOOD_COLORS : FITNESS_COLORS;
  const title = isFood ? 'Food Challenge' : 'Fitness Challenge';
  
  const numberOfDays = isFood
    ? (challenge as FoodChallenge).input.numberOfDays
    : (challenge as FitnessChallenge).input.numberOfDays;
  
  const theme = isFood
    ? (challenge as FoodChallenge).input.dietTheme
    : (challenge as FitnessChallenge).input.workoutTheme;
  
  const photoPreviews = isFood
    ? (challenge as FoodChallenge).input.photoPreviews || []
    : (challenge as FitnessChallenge).input.photoPreviews || [];
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // ============ TITLE PAGE ============
  // Gradient background (simulated with two rectangles)
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Decorative diagonal stripe
  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.triangle(pageWidth, 0, pageWidth, pageHeight * 0.4, 0, 0, 'F');
  
  // Add influencer photo on title page if available
  if (photoPreviews.length > 0) {
    const photoSize = 60;
    const photoX = (pageWidth - photoSize) / 2;
    const photoY = pageHeight / 2 - 80;
    
    // White circle background for photo
    doc.setFillColor(255, 255, 255);
    doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 3, 'F');
    
    addImageWithFallback(doc, photoPreviews[0], photoX, photoY, photoSize, photoSize);
  }
  
  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(52);
  doc.setFont('helvetica', 'bold');
  
  const titleY = photoPreviews.length > 0 ? pageHeight / 2 + 10 : pageHeight / 2 - 20;
  
  doc.text(`${numberOfDays}-Day`, pageWidth / 2, titleY, { align: 'center' });
  doc.text(title, pageWidth / 2, titleY + 22, { align: 'center' });
  
  // Theme subtitle with decorative line
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  
  const themeY = titleY + 50;
  const themeWidth = doc.getTextWidth(theme.toUpperCase()) + 20;
  
  // Decorative lines around theme
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line((pageWidth - themeWidth) / 2 - 20, themeY - 2, (pageWidth - themeWidth) / 2 - 5, themeY - 2);
  doc.line((pageWidth + themeWidth) / 2 + 5, themeY - 2, (pageWidth + themeWidth) / 2 + 20, themeY - 2);
  
  doc.text(theme.toUpperCase(), pageWidth / 2, themeY, { align: 'center' });
  
  // Footer tagline
  doc.setFontSize(10);
  doc.text('Your transformation starts here', pageWidth / 2, pageHeight - 25, { align: 'center' });

  // ============ DAY PAGES ============
  const plan = challenge.plan as (FoodDay | FitnessDay)[];
  
  for (let dayIndex = 0; dayIndex < plan.length; dayIndex++) {
    const day = plan[dayIndex];
    doc.addPage();
    
    // Header with accent color
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Day number
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`Day ${day.dayNumber}`, margin, 24);
    
    // Influencer photo in header corner (cycling through photos)
    if (photoPreviews.length > 0) {
      const photoIndex = dayIndex % photoPreviews.length;
      const photoSize = 25;
      const photoX = pageWidth - margin - photoSize;
      const photoY = 5;
      
      // White circle background
      doc.setFillColor(255, 255, 255);
      doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 1, 'F');
      
      addImageWithFallback(doc, photoPreviews[photoIndex], photoX, photoY, photoSize, photoSize);
    }
    
    let yPos = 50;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

    if (isFood) {
      const foodDay = day as FoodDay;
      
      for (const meal of foodDay.meals) {
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 30;
        }
        
        // Card background
        const cardHeight = 28;
        doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
        drawRoundedRect(doc, margin, yPos - 5, contentWidth, cardHeight, 4, 'F');
        
        // Accent bar on left
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.rect(margin, yPos - 5, 3, cardHeight, 'F');
        
        // Meal name
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(meal.name, margin + 8, yPos + 5);
        
        // Ingredients
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        
        const ingredientsText = meal.ingredients.join(' • ');
        const lines = doc.splitTextToSize(ingredientsText, contentWidth - 15);
        doc.text(lines.slice(0, 2), margin + 8, yPos + 14);
        
        yPos += cardHeight + 8;
      }
    } else {
      const fitnessDay = day as FitnessDay;
      
      if (fitnessDay.isRestDay) {
        // Rest day card
        const cardHeight = 50;
        doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
        drawRoundedRect(doc, margin, yPos - 5, contentWidth, cardHeight, 4, 'F');
        
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.text('Rest Day', margin + 15, yPos + 15);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        doc.text('Take time to recover and recharge! 💪', margin + 15, yPos + 30);
      } else {
        for (const exercise of fitnessDay.exercises) {
          if (yPos > pageHeight - 50) {
            doc.addPage();
            yPos = 30;
          }
          
          // Card background
          const cardHeight = 22;
          doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
          drawRoundedRect(doc, margin, yPos - 5, contentWidth, cardHeight, 4, 'F');
          
          // Accent bar
          doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          doc.rect(margin, yPos - 5, 3, cardHeight, 'F');
          
          // Exercise name
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          doc.text(exercise.name, margin + 8, yPos + 6);
          
          // Sets x Reps badge
          doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          const setsRepsText = `${exercise.sets} × ${exercise.reps}`;
          const badgeWidth = doc.getTextWidth(setsRepsText) + 10;
          const badgeX = pageWidth - margin - badgeWidth - 5;
          drawRoundedRect(doc, badgeX, yPos - 2, badgeWidth, 14, 3, 'F');
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text(setsRepsText, badgeX + 5, yPos + 7);
          
          yPos += cardHeight + 6;
        }
      }
    }

    // Footer disclaimer on every page
    doc.setFontSize(8);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(
      'Not medical or nutritional advice. Consult a physician before starting.',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save
  const filename = `${isFood ? 'food' : 'fitness'}-challenge-${numberOfDays}day.pdf`;
  doc.save(filename);
}
