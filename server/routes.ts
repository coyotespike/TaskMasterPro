import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import { OpenAI } from "openai";
import { json } from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Parse JSON bodies
  app.use(json());

  // API endpoint for health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API endpoint to get OpenAI API key
  app.get('/api/config', (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key is missing in environment variables');
    }
    
    res.json({
      openaiApiKey: apiKey || "",
      apiProvider: process.env.API_PROVIDER || "openai",
      useMockResponses: process.env.USE_MOCK_RESPONSES === "true"
    });
  });

  // API endpoint for generating task images
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { taskDescription } = req.body as { taskDescription: string };
      
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

      // Test mock response only when explicitly requested
      if (process.env.USE_MOCK_IMAGES === 'true') {
        console.log('Using mock image response');
        // Return a placeholder image URL after a short delay to simulate API call
        return setTimeout(() => {
          res.json({ 
            imageUrl: 'https://placehold.co/600x400/6366f1/white?text=TASK',
            isMock: true
          });
        }, 500);
      }

      const openai = new OpenAI({
        apiKey: apiKey,
      });

      console.log(`Generating image for task: "${taskDescription}"`);
      
      // Create a conceptual prompt for the image that focuses on the task meaning, not text
      let cleanDescription = taskDescription.replace(/[^a-zA-Z0-9\s-]/g, ''); // Remove special characters
      
      // Extract the main concept from the task description
      const conceptKeywords = cleanDescription.toLowerCase()
        .split(' ')
        .filter((word: string) => 
          !['the', 'a', 'an', 'to', 'for', 'in', 'on', 'at', 'by', 'with', 'and', 'or', 'of'].includes(word)
        );
      
      // Identify key activities or objects in the task
      let concept = '';
      if (cleanDescription.toLowerCase().includes('exercise') || 
          cleanDescription.toLowerCase().includes('run') || 
          cleanDescription.toLowerCase().includes('workout')) {
        concept = 'exercise, runner, fitness, workout';
      } else if (cleanDescription.toLowerCase().includes('meeting') || 
                cleanDescription.toLowerCase().includes('call')) {
        concept = 'business meeting, conference call, video chat, collaboration';
      } else if (cleanDescription.toLowerCase().includes('study') || 
                cleanDescription.toLowerCase().includes('read')) {
        concept = 'study, book, learning, education, knowledge';
      } else if (cleanDescription.toLowerCase().includes('eat') || 
                cleanDescription.toLowerCase().includes('lunch') || 
                cleanDescription.toLowerCase().includes('dinner') || 
                cleanDescription.toLowerCase().includes('breakfast')) {
        concept = 'meal, food, dining, eating, restaurant';
      } else if (cleanDescription.toLowerCase().includes('clean') || 
                cleanDescription.toLowerCase().includes('laundry') || 
                cleanDescription.toLowerCase().includes('dishes')) {
        concept = 'cleaning, home maintenance, housework';
      } else if (cleanDescription.toLowerCase().includes('shop') || 
                cleanDescription.toLowerCase().includes('buy') || 
                cleanDescription.toLowerCase().includes('purchase')) {
        concept = 'shopping, retail, store, purchase';
      } else if (cleanDescription.toLowerCase().includes('travel') || 
                cleanDescription.toLowerCase().includes('drive') || 
                cleanDescription.toLowerCase().includes('flight')) {
        concept = 'travel, transportation, journey, vacation';
      } else {
        // Use the first few meaningful keywords if no specific category is found
        concept = conceptKeywords.slice(0, 3).join(', ');
      }
      
      // Create the prompt focusing on the conceptual meaning rather than the text description
      const prompt = `Design a simple, colorful, flat icon representing the concept of "${concept}". 
      Important rules:
      1. NO TEXT OR LETTERS OF ANY KIND in the image
      2. Use bright, solid colors and simple geometric shapes
      3. Create a centered symbolic representation on a colored background
      4. Use a minimalist style with clean lines and shapes
      5. Make it instantly recognizable at small sizes
      6. Focus on a single clear concept rather than multiple ideas
      7. Use colors that evoke the mood of the activity
      
      This icon will be used as a small task icon in a scheduling app. Keep it visually distinct and meaningful.`;

      // Set a timeout to prevent hanging indefinitely - increase to 30 seconds for image generation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OpenAI API request timed out')), 30000);
      });

      // Make the actual API request - use a smaller size for faster generation
      const apiRequestPromise = openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024", // Using standard size for quality icons
        quality: "standard", // Standard quality is sufficient for app icons
        style: "vivid" // Vivid style for more colorful, eye-catching icons
      });

      // Race between the timeout and the actual request
      const response = await Promise.race([apiRequestPromise, timeoutPromise]) as any;
      
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
          console.log('Rate limit hit, retrying with delay');
          
          // Set a short timeout to allow rate limits to reset
          setTimeout(() => {
            return res.status(429).json({
              error: 'OpenAI rate limit exceeded',
              details: 'Too many requests sent to OpenAI in a short time'
            });
          }, 500);
          return;
        }
      }
      
      return res.status(500).json({ 
        error: 'Failed to generate image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
