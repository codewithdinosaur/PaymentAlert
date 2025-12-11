import { Request, Response } from 'express';
import { mongoose } from '../config/database';
import { logger } from '../config/logger';

// Health check controller
export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Memory usage
    const memoryUsage = process.memoryUsage();

    // System uptime
    const uptime = process.uptime();

    // Response data
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes`,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbStatus,
        readyState: mongoose.connection.readyState,
      },
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      },
      cpu: {
        usage: process.cpuUsage(),
      },
    };

    logger.info('Health check requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      data: healthData,
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'Health check failed',
    });
  }
};

// Detailed health check with all system information
export const detailedHealthCheck = async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Memory usage
    const memoryUsage = process.memoryUsage();

    // System uptime
    const uptime = process.uptime();

    // Response data
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes`,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbStatus,
        readyState: mongoose.connection.readyState,
      },
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      },
      cpu: {
        usage: process.cpuUsage(),
      },
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        execPath: process.execPath,
      },
      eventLoop: {
        loopDelay: process.hrtime(),
      },
    };

    logger.info('Detailed health check requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      data: healthData,
    });
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'Detailed health check failed',
    });
  }
};
