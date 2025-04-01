import { ApiError } from "@/types";

interface ImageGenerationResponse {
  imageUrl: string;
}

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
      throw new Error(errorData.error || 'Failed to generate image');
    }

    const data = await response.json() as ImageGenerationResponse;
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating task image:', error);
    throw error;
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
    // Return empty string if image generation fails
    return '';
  }
};