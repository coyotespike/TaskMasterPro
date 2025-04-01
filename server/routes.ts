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

      // Test mock response only when explicitly requested
      if (process.env.USE_MOCK_IMAGES === 'true') {
        console.log('Using mock image response');
        // Return a placeholder image URL after a short delay to simulate API call
        return setTimeout(() => {
          res.json({ 
            imageUrl: 'https://placehold.co/600x400/6366f1/white?text=Task+Icon',
            isMock: true
          });
        }, 500);
      }

      const openai = new OpenAI({
        apiKey: apiKey,
      });

      console.log(`Generating image for task: "${taskDescription}"`);
      
      // Create a simplified prompt for the image
      const prompt = `A simple, colorful, minimalist icon representing the task: "${taskDescription}". Use bright colors, simple shapes, and a clean design. The icon should be centered and have a solid background. Make it suitable as a small task icon.`;

      // Set a timeout to prevent hanging indefinitely
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OpenAI API request timed out')), 10000);
      });

      // Make the actual API request
      const apiRequestPromise = openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
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
