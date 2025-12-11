import { Router } from 'express';
import {
  healthCheck,
  detailedHealthCheck,
} from '../controllers/healthController';
import { globalRateLimit } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all health check routes
router.use(globalRateLimit);

// Basic health check
router.get('/', healthCheck);

// Detailed health check
router.get('/detailed', detailedHealthCheck);

// Simple ping endpoint
router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
});

export default router;
