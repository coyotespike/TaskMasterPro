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
    res.json({
      openaiApiKey: process.env.OPENAI_API_KEY || ""
    });
  });

  // API endpoint for generating task images
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { taskDescription } = req.body;
      
      if (!taskDescription) {
        return res.status(400).json({ error: 'Task description is required' });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Create a simplified prompt for the image
      const prompt = `A simple, colorful, minimalist icon representing the task: "${taskDescription}". Use bright colors, simple shapes, and a clean design. The icon should be centered and have a solid background. Make it suitable as a small task icon.`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      const imageUrl = response.data[0].url;
      return res.json({ imageUrl });
    } catch (error) {
      console.error('Error generating image:', error);
      return res.status(500).json({ 
        error: 'Failed to generate image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
