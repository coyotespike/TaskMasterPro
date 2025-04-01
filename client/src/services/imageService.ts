import { ApiError } from "@/types";

interface ImageGenerationResponse {
  imageUrl: string;
  isMock?: boolean;
}

/**
 * Task categories with colors and emojis for better fallback images
 */
interface TaskCategory {
  color: string;
  icon: string; // Unicode emoji
  name: string;
}

const TASK_CATEGORIES: Record<string, TaskCategory> = {
  work: {
    color: "6366f1", // Indigo
    icon: "💼",
    name: "Work"
  },
  meeting: {
    color: "8b5cf6", // Violet
    icon: "👥",
    name: "Meeting"
  },
  study: {
    color: "a78bfa", // Purple
    icon: "📚",
    name: "Study"
  },
  exercise: {
    color: "10b981", // Emerald
    icon: "🏃",
    name: "Exercise"
  },
  food: {
    color: "f59e0b", // Amber
    icon: "🍽️",
    name: "Food"
  },
  shopping: {
    color: "ec4899", // Pink
    icon: "🛒",
    name: "Shopping"
  },
  cleaning: {
    color: "06b6d4", // Cyan
    icon: "🧹",
    name: "Cleaning"
  },
  relaxation: {
    color: "3b82f6", // Blue
    icon: "🧘",
    name: "Relaxation"
  },
  sleep: {
    color: "6366f1", // Indigo
    icon: "😴",
    name: "Sleep"
  },
  travel: {
    color: "f97316", // Orange
    icon: "✈️",
    name: "Travel"
  },
  entertainment: {
    color: "ec4899", // Pink
    icon: "🎮",
    name: "Entertainment"
  },
  social: {
    color: "f59e0b", // Amber
    icon: "🎉",
    name: "Social"
  },
  health: {
    color: "14b8a6", // Teal
    icon: "💊",
    name: "Health"
  },
  default: {
    color: "6366f1", // Indigo
    icon: "📋",
    name: "Task"
  }
};

/**
 * Keyword mappings to categories
 */
const KEYWORD_TO_CATEGORY: Record<string, string> = {
  // Work related
  "work": "work",
  "job": "work",
  "project": "work",
  "email": "work",
  "report": "work",
  "office": "work",
  "business": "work",
  
  // Meetings
  "meeting": "meeting",
  "call": "meeting",
  "presentation": "meeting",
  "conference": "meeting",
  "zoom": "meeting",
  "interview": "meeting",
  
  // Study related
  "study": "study",
  "read": "study",
  "learn": "study",
  "homework": "study", 
  "research": "study",
  "class": "study",
  "book": "study",
  "lecture": "study",
  
  // Exercise related
  "exercise": "exercise",
  "workout": "exercise",
  "gym": "exercise",
  "run": "exercise",
  "jog": "exercise",
  "fitness": "exercise",
  "sport": "exercise",
  "training": "exercise",
  
  // Food related
  "eat": "food",
  "lunch": "food",
  "dinner": "food",
  "breakfast": "food",
  "cook": "food", 
  "meal": "food",
  "food": "food",
  "restaurant": "food",
  
  // Shopping related
  "shop": "shopping",
  "buy": "shopping",
  "purchase": "shopping",
  "store": "shopping",
  "mall": "shopping",
  "grocery": "shopping",
  "market": "shopping",
  
  // Cleaning related
  "clean": "cleaning",
  "laundry": "cleaning",
  "wash": "cleaning",
  "dishes": "cleaning",
  "tidy": "cleaning",
  "organize": "cleaning",
  "dust": "cleaning",
  "vacuum": "cleaning",
  
  // Relaxation related
  "relax": "relaxation",
  "rest": "relaxation",
  "break": "relaxation",
  "meditate": "relaxation",
  "yoga": "relaxation",
  
  // Sleep related
  "sleep": "sleep",
  "nap": "sleep",
  "bed": "sleep",
  
  // Travel related
  "travel": "travel",
  "trip": "travel",
  "drive": "travel",
  "commute": "travel",
  "flight": "travel",
  "journey": "travel",
  "vacation": "travel",
  
  // Entertainment related
  "play": "entertainment",
  "game": "entertainment",
  "movie": "entertainment",
  "watch": "entertainment",
  "tv": "entertainment",
  "show": "entertainment",
  "entertainment": "entertainment",
  
  // Social related
  "friend": "social",
  "party": "social",
  "visit": "social",
  "meet": "social",
  "date": "social",
  "family": "social",
  
  // Health related
  "doctor": "health",
  "appointment": "health",
  "medicine": "health",
  "therapy": "health",
  "dentist": "health",
  "checkup": "health"
};

/**
 * Get the appropriate category for a task
 */
const getCategoryForTask = (taskDescription: string): TaskCategory => {
  if (!taskDescription) return TASK_CATEGORIES.default;
  
  const normalizedDescription = taskDescription.toLowerCase();
  const words = normalizedDescription.split(/\s+/);
  
  // Check if any word in the description matches our keywords
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (cleanWord && KEYWORD_TO_CATEGORY[cleanWord]) {
      const categoryKey = KEYWORD_TO_CATEGORY[cleanWord];
      return TASK_CATEGORIES[categoryKey];
    }
  }
  
  // If no direct word match, try to find a keyword within the description
  for (const keyword of Object.keys(KEYWORD_TO_CATEGORY)) {
    if (normalizedDescription.includes(keyword)) {
      const categoryKey = KEYWORD_TO_CATEGORY[keyword];
      return TASK_CATEGORIES[categoryKey];
    }
  }
  
  return TASK_CATEGORIES.default;
};

/**
 * Generate a fallback image URL if the API fails
 */
const generateFallbackImageUrl = (taskDescription: string): string => {
  const category = getCategoryForTask(taskDescription);
  return `https://placehold.co/600x400/${category.color}/white?text=${encodeURIComponent(category.icon)}`;
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