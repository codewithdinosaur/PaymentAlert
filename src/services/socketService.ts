import { Server, Socket } from 'socket.io';
import { logger } from '../config/logger';

export interface SocketUser {
  id: string;
  socketId: string;
  connectedAt: Date;
}

// Socket.IO service class
export class SocketService {
  private io: Server | null = null;
  private connectedUsers: Map<string, SocketUser> = new Map();

  // Initialize Socket.IO server
  public initializeServer(httpServer: any): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupEventHandlers();
    logger.info('Socket.IO server initialized successfully');
    return this.io;
  }

  // Setup Socket.IO event handlers
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Store connected user
      const user: SocketUser = {
        id: socket.id,
        socketId: socket.id,
        connectedAt: new Date(),
      };
      this.connectedUsers.set(socket.id, user);

      // Handle user identification
      socket.on('identify', (userId: string) => {
        const existingUser = this.connectedUsers.get(socket.id);
        if (existingUser) {
          existingUser.id = userId;
          this.connectedUsers.set(socket.id, existingUser);
          logger.info(`User ${userId} identified with socket ${socket.id}`);
        }
      });

      // Handle joining rooms
      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        logger.info(`Socket ${socket.id} joined room ${roomId}`);
      });

      // Handle leaving rooms
      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId);
        logger.info(`Socket ${socket.id} left room ${roomId}`);
      });

      // Handle payment-related events
      socket.on('payment-subscribe', (paymentId: string) => {
        socket.join(`payment-${paymentId}`);
        logger.info(`Socket ${socket.id} subscribed to payment ${paymentId}`);
      });

      socket.on('payment-unsubscribe', (paymentId: string) => {
        socket.leave(`payment-${paymentId}`);
        logger.info(
          `Socket ${socket.id} unsubscribed from payment ${paymentId}`
        );
      });

      // Handle disconnection
      socket.on('disconnect', (reason: string) => {
        logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
        this.connectedUsers.delete(socket.id);
      });

      // Handle connection errors
      socket.on('error', (error: Error) => {
        logger.error(`Socket error for ${socket.id}:`, error);
      });
    });

    // Handle server-level errors
    this.io.on('error', (error: Error) => {
      logger.error('Socket.IO server error:', error);
    });
  }

  // Send notification to specific user
  public sendToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;

    // Find user's socket
    for (const [socketId, user] of this.connectedUsers) {
      if (user.id === userId) {
        this.io.to(socketId).emit(event, data);
        logger.info(`Sent ${event} to user ${userId}`);
        break;
      }
    }
  }

  // Send notification to all connected users
  public broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
    logger.info(`Broadcasted ${event} to all connected users`);
  }

  // Send notification to specific room
  public sendToRoom(roomId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(roomId).emit(event, data);
    logger.info(`Sent ${event} to room ${roomId}`);
  }

  // Send payment status update
  public notifyPaymentUpdate(
    paymentId: string,
    status: string,
    data: any
  ): void {
    const event = 'payment-update';
    const payload = {
      paymentId,
      status,
      data,
      timestamp: new Date().toISOString(),
    };
    this.sendToRoom(`payment-${paymentId}`, event, payload);
    logger.info(`Payment update notification sent for payment ${paymentId}`);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get connected users
  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  // Get Socket.IO instance
  public getIO(): Server | null {
    return this.io;
  }
}

// Create singleton instance
export const socketService = new SocketService();
