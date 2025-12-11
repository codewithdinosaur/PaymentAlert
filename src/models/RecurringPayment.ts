import mongoose, { Schema, Document } from 'mongoose';
import { RecurringFrequency, AutopayStatus } from '../utils/enums';

export interface IRecurringPayment extends Document {
  donorId: mongoose.Types.ObjectId;
  streamerId: mongoose.Types.ObjectId;
  mandateId: mongoose.Types.ObjectId;
  
  subscriptionId: string;
  
  status: AutopayStatus;
  
  amount: number;
  currency: string;
  
  frequency: RecurringFrequency;
  
  startDate: Date;
  endDate?: Date;
  nextPaymentDate: Date;
  lastPaymentDate?: Date;
  
  totalPaymentsScheduled?: number;
  completedPayments: number;
  failedPayments: number;
  
  payments: {
    paymentId: mongoose.Types.ObjectId;
    scheduledAt: Date;
    processedAt?: Date;
    amount: number;
    status: 'SCHEDULED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
    transactionId?: string;
    failureReason?: string;
    retryCount: number;
  }[];
  
  statistics: {
    totalAmountCollected: number;
    averagePaymentAmount: number;
    successRate: number;
    longestStreak: number;
    currentStreak: number;
  };
  
  retryPolicy: {
    enabled: boolean;
    maxRetries: number;
    retryIntervalHours: number;
    lastRetryAt?: Date;
  };
  
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    webhookEnabled: boolean;
    notifyOnSuccess: boolean;
    notifyOnFailure: boolean;
    notifyBeforePayment: boolean;
    notifyBeforeDays: number;
  };
  
  pausedAt?: Date;
  pausedBy?: 'DONOR' | 'STREAMER' | 'ADMIN' | 'SYSTEM';
  pauseReason?: string;
  resumedAt?: Date;
  
  cancelledAt?: Date;
  cancelledBy?: 'DONOR' | 'STREAMER' | 'ADMIN' | 'SYSTEM';
  cancellationReason?: string;
  
  metadata: {
    tags?: string[];
    customFields?: Record<string, any>;
    notes?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const RecurringPaymentSchema = new Schema<IRecurringPayment>(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    streamerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mandateId: {
      type: Schema.Types.ObjectId,
      ref: 'AutopayMandate',
      required: true,
      index: true,
    },
    
    subscriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    status: {
      type: String,
      enum: Object.values(AutopayStatus),
      default: AutopayStatus.ACTIVE,
      index: true,
    },
    
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
      uppercase: true,
    },
    
    frequency: {
      type: String,
      enum: Object.values(RecurringFrequency),
      required: true,
      index: true,
    },
    
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      index: true,
    },
    nextPaymentDate: {
      type: Date,
      required: true,
      index: true,
    },
    lastPaymentDate: {
      type: Date,
    },
    
    totalPaymentsScheduled: {
      type: Number,
    },
    completedPayments: {
      type: Number,
      default: 0,
    },
    failedPayments: {
      type: Number,
      default: 0,
    },
    
    payments: [
      {
        paymentId: { type: Schema.Types.ObjectId, ref: 'Donation' },
        scheduledAt: { type: Date, required: true },
        processedAt: { type: Date },
        amount: { type: Number, required: true },
        status: {
          type: String,
          enum: ['SCHEDULED', 'PROCESSING', 'SUCCESS', 'FAILED', 'SKIPPED'],
          required: true,
        },
        transactionId: { type: String },
        failureReason: { type: String },
        retryCount: { type: Number, default: 0 },
      },
    ],
    
    statistics: {
      totalAmountCollected: { type: Number, default: 0 },
      averagePaymentAmount: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
    },
    
    retryPolicy: {
      enabled: { type: Boolean, default: true },
      maxRetries: { type: Number, default: 3 },
      retryIntervalHours: { type: Number, default: 24 },
      lastRetryAt: { type: Date },
    },
    
    notifications: {
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: false },
      webhookEnabled: { type: Boolean, default: false },
      notifyOnSuccess: { type: Boolean, default: true },
      notifyOnFailure: { type: Boolean, default: true },
      notifyBeforePayment: { type: Boolean, default: true },
      notifyBeforeDays: { type: Number, default: 2 },
    },
    
    pausedAt: {
      type: Date,
    },
    pausedBy: {
      type: String,
      enum: ['DONOR', 'STREAMER', 'ADMIN', 'SYSTEM'],
    },
    pauseReason: {
      type: String,
    },
    resumedAt: {
      type: Date,
    },
    
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: String,
      enum: ['DONOR', 'STREAMER', 'ADMIN', 'SYSTEM'],
    },
    cancellationReason: {
      type: String,
    },
    
    metadata: {
      tags: [{ type: String }],
      customFields: { type: Schema.Types.Mixed },
      notes: { type: String, maxlength: 1000 },
    },
  },
  {
    timestamps: true,
  }
);

RecurringPaymentSchema.index({ donorId: 1, streamerId: 1 });
RecurringPaymentSchema.index({ status: 1, nextPaymentDate: 1 });
RecurringPaymentSchema.index({ streamerId: 1, status: 1 });
RecurringPaymentSchema.index({ subscriptionId: 1, donorId: 1 });
RecurringPaymentSchema.index({ 'payments.scheduledAt': 1 });
RecurringPaymentSchema.index({ createdAt: -1 });

export default mongoose.model<IRecurringPayment>('RecurringPayment', RecurringPaymentSchema);
