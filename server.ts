import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { getPredictions } from './src/lib/apiFootballService.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API Route: /api/predictions
app.get('/api/predictions', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const clientKey = typeof req.query.key === 'string' ? req.query.key : undefined;

    const data = await getPredictions(clientKey, forceRefresh);
    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 min browser cache
    return res.json(data);
  } catch (error) {
    console.error('API Error in /api/predictions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate predictions for 192h window',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production build from dist
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    // Development mode with Vite middleware
    // Explicitly set hmr: false to prevent WebSocket closed without opened errors in Cloud Run iframe
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KickPredict server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
