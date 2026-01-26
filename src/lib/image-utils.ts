/**
 * Utility functions for handling images in the PDF generator
 */

/**
 * Fetches an image from a URL and converts it to base64 data URL
 * Works for both external URLs and data URLs
 */
export async function fetchImageAsBase64(urlOrData: string): Promise<string | null> {
  if (!urlOrData || urlOrData === '') return null;
  
  // If already a data URL, return as-is
  if (urlOrData.startsWith('data:')) {
    return urlOrData;
  }
  
  try {
    const response = await fetch(urlOrData);
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${response.status}`);
      return null;
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Error fetching image:', error);
    return null;
  }
}

/**
 * Pre-fetches all images and converts them to base64 for PDF embedding
 */
export async function prefetchAllImages(
  heroImages: string[],
  dayImages: string[][]
): Promise<{ heroImages: string[]; dayImages: string[][] }> {
  console.log('Prefetching images for PDF...');
  
  // Fetch hero images in parallel
  const heroPromises = heroImages.map(url => fetchImageAsBase64(url));
  const fetchedHeroImages = await Promise.all(heroPromises);
  
  // Fetch day images in parallel
  const dayPromises = dayImages.map(async (dayMeals) => {
    const mealPromises = dayMeals.map(url => fetchImageAsBase64(url));
    return Promise.all(mealPromises);
  });
  const fetchedDayImages = await Promise.all(dayPromises);
  
  const validHeroCount = fetchedHeroImages.filter(img => img).length;
  const validDayCount = fetchedDayImages.reduce((sum, day) => sum + day.filter(img => img).length, 0);
  
  console.log(`Prefetched ${validHeroCount} hero images and ${validDayCount} content images`);
  
  return {
    heroImages: fetchedHeroImages.map(img => img || ''),
    dayImages: fetchedDayImages.map(day => day.map(img => img || ''))
  };
}
