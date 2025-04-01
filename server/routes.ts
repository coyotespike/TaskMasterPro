import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // All other API endpoints would go here
  // The application is fully frontend-driven, so no additional
  // server-side endpoints are needed for the task planning functionality

  const httpServer = createServer(app);

  return httpServer;
}
