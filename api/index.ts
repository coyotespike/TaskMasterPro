import { createServer } from 'http';
import { registerRoutes } from '../server/routes';
import express from 'express';
import { serveStatic } from '../server/vite';

// Create Express app
const app = express();

// Enable JSON parsing for request bodies
app.use(express.json());

// Set up routes
registerRoutes(app).then((server) => {
  // In production, serve static files from dist/public
  if (process.env.NODE_ENV === 'production') {
    serveStatic(app);
  }

  // Start the server if not in serverless environment
  if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }
});

// Export the Express app for serverless environments (Vercel)
export default app;