import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config/index.js';
import { connectRedis } from './config/redis.js';
import logger from './config/logger.js';
import { initializeSocket } from './socket/SocketManager.js';
import apiRoutes from './routes/index.js';
import { globalErrorHandler } from './utils/errorHandler.js';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({ origin: config.app.corsOrigin }));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use(globalErrorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectRedis();
    
    // Initialize Socket.IO
    initializeSocket(httpServer);
    logger.info('Socket.IO initialized');

    httpServer.listen(config.app.port, () => {
      logger.info(
        `Server running on port ${config.app.port} in ${config.app.env} mode`
      );
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
