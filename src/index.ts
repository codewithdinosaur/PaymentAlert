import http from 'http';
import express, { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

// Import configurations
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';

// Import middleware
import { requestLogger } from './middleware/requestLogger';
import { globalRateLimit, apiRateLimit } from './middleware/rateLimiter';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler, handleUnhandledRejection, handleUncaughtException } from './middleware/errorHandler';

// Import routes
import healthRoutes from './routes/healthRoutes';

// Import services
import { socketService } from './services/socketService';

class PaymentAlertServer {
  public app: Application;
  public server: http.Server | null = null;
  private isShuttingDown = false;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocketIO();
  }

  // Initialize all middleware
  private initializeMiddlewares(): void {
    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS middleware
    this.app.use(corsMiddleware);

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Global rate limiting
    this.app.use(globalRateLimit);

    // Health check endpoints (no rate limiting for basic health check)
    this.app.use('/health', (req, res, next) => {
      // Skip rate limiting for health checks
      next();
    });
  }

  // Initialize routes
  private initializeRoutes(): void {
    // API routes with stricter rate limiting
    this.app.use('/api', apiRateLimit);

    // Health check routes
    this.app.use('/health', healthRoutes);
    this.app.use('/api/health', healthRoutes);

    // API info endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: 'Payment Alert Backend API',
        version: process.env.npm_package_version || '1.0.0',
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          healthDetailed: '/health/detailed',
          ping: '/health/ping',
        },
      });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Payment Alert Backend Service',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
      });
    });
  }

  // Initialize error handling
  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  // Initialize Socket.IO
  private initializeSocketIO(): void {
    // Socket.IO will be initialized in the startServer method
    // since we need the HTTP server instance
  }

  // Start the server
  public async start(): Promise<void> {
    try {
      // Connect to database first
      await connectDatabase();
      logger.info('Database connected successfully');

      // Create HTTP server
      this.server = http.createServer(this.app);

      // Initialize Socket.IO
      socketService.initializeServer(this.server);

      // Start listening
      const port = parseInt(env.PORT);
      this.server.listen(port, () => {
        logger.info(`🚀 Payment Alert Backend server started on port ${port}`);
        logger.info(`📊 Health check available at http://localhost:${port}/health`);
        logger.info(`🌍 Environment: ${env.NODE_ENV}`);
        logger.info(`🔧 Socket.IO enabled for real-time notifications`);
      });

      // Graceful shutdown handling
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  // Setup graceful shutdown
  private setupGracefulShutdown(): void {
    if (!this.server) return;

    const gracefulShutdown = async (signal: string) => {
      if (this.isShuttingDown) return;
      
      this.isShuttingDown = true;
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      try {
        // Close HTTP server
        if (this.server) {
          await new Promise<void>((resolve) => {
            this.server!.close(() => {
              logger.info('HTTP server closed');
              resolve();
            });
          });
        }

        // Close Socket.IO connections
        const io = socketService.getIO();
        if (io) {
          io.close();
          logger.info('Socket.IO server closed');
        }

        // Close database connections
        const { disconnectDatabase } = await import('./config/database');
        await disconnectDatabase();
        logger.info('Database connections closed');

        logger.info('Graceful shutdown completed');
        process.exit(0);

      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Setup unhandled rejection and exception handlers
    handleUnhandledRejection();
    handleUncaughtException();
  }

  // Get Express app instance
  public getApp(): Application {
    return this.app;
  }

  // Get HTTP server instance
  public getServer(): http.Server | null {
    return this.server;
  }
}

// Create and start server
const server = new PaymentAlertServer();

// Start the server
server.start().catch((error) => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});

// Handle uncaught exceptions and unhandled rejections
handleUnhandledRejection();
handleUncaughtException();

export default server;
