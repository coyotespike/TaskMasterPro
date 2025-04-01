// This is a Vercel serverless function
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { OpenAI } from "openai";

// Initialize express app
const app = express();
app.use(express.json());

// Routes
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
    const apiRequestPromise = openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    // Race between the timeout and the actual request
    const response = await Promise.race([apiRequestPromise, timeoutPromise]);
    
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

// Create HTTP server
const server = createServer(app);

// For local development 
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless function
export default app;