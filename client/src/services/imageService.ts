import { ApiError } from "@/types";

interface ImageGenerationResponse {
  imageUrl: string;
}

/**
 * Simple fallback color generator based on task type
 */
const getFallbackColor = (taskDescription: string): string => {
  const lowerDesc = taskDescription.toLowerCase();
  
  if (lowerDesc.includes('exercise') || lowerDesc.includes('workout') || lowerDesc.includes('gym')) {
    return '10b981'; // Emerald for exercise
  } else if (lowerDesc.includes('meeting') || lowerDesc.includes('call') || lowerDesc.includes('work')) {
    return '6366f1'; // Indigo for work/meetings
  } else if (lowerDesc.includes('eat') || lowerDesc.includes('breakfast') || lowerDesc.includes('lunch') || lowerDesc.includes('dinner')) {
    return 'f59e0b'; // Amber for food
  } else if (lowerDesc.includes('read') || lowerDesc.includes('study') || lowerDesc.includes('book')) {
    return 'a78bfa'; // Purple for study
  }
  
  return '6366f1'; // Default indigo
};

/**
 * Generate a simple fallback URL if API fails
 */
const generateFallbackUrl = (taskDescription: string): string => {
  const color = getFallbackColor(taskDescription);
  // Just use the first character as a simple icon
  const firstChar = taskDescription.trim()[0]?.toUpperCase() || 'T';
  return `https://placehold.co/600x400/${color}/white?text=${firstChar}`;
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
      console.warn(`Image generation failed: ${errorData.error || 'Unknown error'}`);
      return generateFallbackUrl(taskDescription);
    }

    const data = await response.json() as ImageGenerationResponse;
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating task image:', error);
    return generateFallbackUrl(taskDescription);
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
    return generateFallbackUrl('Task'); 
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
    return generateFallbackUrl(taskDescription);
  }
};