import { createServer } from 'http';
import { registerRoutes } from '../server/routes';
import express from 'express';
import path from 'path';
import fs from 'fs';

// Create Express app
const app = express();

// Enable JSON parsing for request bodies
app.use(express.json());

// Helper function to serve static files in production
function serveStaticFiles(app: express.Express) {
  const distPath = path.join(process.cwd(), 'dist/public');
  
  // Check if the directory exists
  if (fs.existsSync(distPath)) {
    // Serve static files from the dist/public directory
    app.use(express.static(distPath));
    
    // Serve index.html for all other routes that don't match API or static files
    app.get('*', (req, res) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) return;
      
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Not found');
      }
    });
  } else {
    console.warn(`Static directory ${distPath} not found`);
  }
}

// Initialize API routes
const init = async () => {
  // Register API routes
  const server = await registerRoutes(app);
  
  // In production, serve static files
  if (process.env.NODE_ENV === 'production') {
    serveStaticFiles(app);
  }
  
  // Start the server if not in serverless environment
  if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }
  
  return app;
};

// Initialize the app immediately for Vercel
init();

// Export the Express app for serverless environments (Vercel)
export default app;