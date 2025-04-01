import { OpenAI } from "openai";
import type { NextApiRequest, NextApiResponse } from 'next';

type ImageResponse = {
  imageUrl: string;
};

type ErrorResponse = {
  error: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { taskDescription } = req.body;
    
    if (!taskDescription) {
      return res.status(400).json({ error: 'Task description is required' });
    }

    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key is missing in environment variables');
      return res.status(500).json({ 
        error: 'OpenAI API key is missing', 
        details: 'Please check the environment variables' 
      });
    }

    // Only use mock responses if explicitly configured
    if (process.env.USE_MOCK_IMAGES === 'true') {
      console.log('Using mock image response');
      // Get the first letter of the task as a simple identifier
      const firstLetter = taskDescription.trim()[0]?.toUpperCase() || 'T';
      const color = '6366f1'; // Indigo color for mock images
      return res.json({ 
        imageUrl: `https://placehold.co/600x400/${color}/white?text=${firstLetter}`
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log(`Generating image for task: "${taskDescription}"`);
    
    // Create a direct and simple prompt that creates a visual representation
    const prompt = `Create a simple, colorful icon representing the task: "${taskDescription}".
    
    Important requirements:
    1. NO TEXT OR WRITING in the image
    2. Use a bright, solid color background
    3. Create a clean, minimal design that's clearly visible at small sizes
    4. The image should visually represent the action or object in the task
    5. Use a modern, flat design style with simple shapes and bold colors
    
    This will be used as a small task icon in a scheduling application.`;

    // Set a timeout to prevent hanging indefinitely
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 30000);
    });

    // Make the actual API request
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const apiRequestPromise = openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    // Race between the timeout and the actual request
    const response = await Promise.race([apiRequestPromise, timeoutPromise]) as {
      data: { url: string }[]
    };
    
    const imageUrl = response.data[0].url;
    console.log('Successfully generated image for task');
    return res.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Provide more detailed error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        return res.status(504).json({
          error: 'Request to OpenAI timed out',
          details: 'The OpenAI service is taking too long to respond'
        });
      } else if (error.message.includes('authentication')) {
        return res.status(401).json({
          error: 'Invalid OpenAI API key',
          details: 'The provided API key is incorrect or has expired'
        });
      } else if (error.message.includes('billing') || error.message.includes('quota')) {
        return res.status(402).json({
          error: 'OpenAI billing issue',
          details: 'There may be an issue with your OpenAI account quota or billing'
        });
      } else if (error.message.includes('rate limit') || error.message.includes('rate_limit_exceeded')) {
        return res.status(429).json({
          error: 'OpenAI rate limit exceeded',
          details: 'Too many requests sent to OpenAI in a short time'
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate image', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}