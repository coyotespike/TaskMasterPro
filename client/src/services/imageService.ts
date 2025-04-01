import { ApiError } from "@/types";

interface ImageGenerationResponse {
  imageUrl: string;
  isMock?: boolean;
}

// Define category colors that will be used for fallback images
const CATEGORY_COLORS: Record<string, string> = {
  work: "6366f1", // Indigo
  study: "8b5cf6", // Violet
  personal: "ec4899", // Pink
  health: "10b981", // Emerald
  social: "f59e0b", // Amber
  home: "0ea5e9", // Sky
  default: "6366f1"  // Default to indigo
};

/**
 * Get a color code based on task description
 */
const getCategoryColor = (taskDescription: string): string => {
  const normalizedDescription = taskDescription.toLowerCase();
  
  // Try to categorize the task based on keywords
  if (normalizedDescription.includes("work") || 
      normalizedDescription.includes("meeting") || 
      normalizedDescription.includes("email") || 
      normalizedDescription.includes("project")) {
    return CATEGORY_COLORS.work;
  } else if (normalizedDescription.includes("study") || 
             normalizedDescription.includes("learn") || 
             normalizedDescription.includes("read") || 
             normalizedDescription.includes("homework")) {
    return CATEGORY_COLORS.study;
  } else if (normalizedDescription.includes("gym") || 
             normalizedDescription.includes("workout") || 
             normalizedDescription.includes("exercise") || 
             normalizedDescription.includes("health")) {
    return CATEGORY_COLORS.health;
  } else if (normalizedDescription.includes("friend") || 
             normalizedDescription.includes("party") || 
             normalizedDescription.includes("lunch") || 
             normalizedDescription.includes("dinner")) {
    return CATEGORY_COLORS.social;
  } else if (normalizedDescription.includes("clean") || 
             normalizedDescription.includes("laundry") || 
             normalizedDescription.includes("cook") || 
             normalizedDescription.includes("home")) {
    return CATEGORY_COLORS.home;
  } else {
    return CATEGORY_COLORS.default;
  }
};

/**
 * Generate a fallback image URL if the API fails
 */
const generateFallbackImageUrl = (taskDescription: string): string => {
  const color = getCategoryColor(taskDescription);
  const text = encodeURIComponent(taskDescription.trim().substring(0, 15));
  return `https://placehold.co/600x400/${color}/white?text=${text}`;
};

/**
 * Generate an image for a task using OpenAI's DALL-E
 */
export const generateTaskImage = async (taskDescription: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskDescription }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn(`Image generation failed: ${errorData.error}. Using fallback.`);
      return generateFallbackImageUrl(taskDescription);
    }

    const data = await response.json() as ImageGenerationResponse;
    
    // If the server indicates this is a mock image, but doesn't contain the task name,
    // replace it with our client-side fallback that has the task name embedded
    if (data.isMock && data.imageUrl.includes('Task+Icon')) {
      return generateFallbackImageUrl(taskDescription);
    }
    
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating task image:', error);
    return generateFallbackImageUrl(taskDescription);
  }
};

/**
 * In-memory cache for generated images to avoid redundant API calls
 */
const imageCache = new Map<string, string>();

/**
 * Get or generate an image for a task description
 */
export const getTaskImage = async (taskDescription: string): Promise<string> => {
  if (!taskDescription || taskDescription.trim() === '') {
    return generateFallbackImageUrl('Task');
  }
  
  // Check if we already have this image cached
  const normalizedDescription = taskDescription.toLowerCase().trim();
  if (imageCache.has(normalizedDescription)) {
    return imageCache.get(normalizedDescription)!;
  }
  
  try {
    // Generate new image
    const imageUrl = await generateTaskImage(taskDescription);
    
    // Cache it for future use
    imageCache.set(normalizedDescription, imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.error('Error in getTaskImage:', error);
    const fallbackUrl = generateFallbackImageUrl(taskDescription);
    imageCache.set(normalizedDescription, fallbackUrl);
    return fallbackUrl;
  }
};