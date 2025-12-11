import mongoose, { Schema, Document } from 'mongoose';
import { AutopayStatus, PaymentGateway, RecurringFrequency } from '../utils/enums';

export interface IAutopayMandate extends Document {
  donorId: mongoose.Types.ObjectId;
  streamerId: mongoose.Types.ObjectId;
  
  mandateId: string;
  gatewayMandateId: string;
  
  status: AutopayStatus;
  
  amount: number;
  currency: string;
  
  frequency: RecurringFrequency;
  
  startDate: Date;
  endDate?: Date;
  nextExecutionDate: Date;
  
  gateway: PaymentGateway;
  
  bankAccount?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  
  card?: {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  
  upi?: {
    vpa: string;
  };
  
  maxAmount: number;
  
  executionHistory: {
    executedAt: Date;
    amount: number;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    donationId?: mongoose.Types.ObjectId;
    failureReason?: string;
    transactionId?: string;
  }[];
  
  statistics: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalAmountCollected: number;
    lastExecutionDate?: Date;
    lastSuccessfulExecutionDate?: Date;
  };
  
  pausedAt?: Date;
  pausedBy?: 'DONOR' | 'STREAMER' | 'ADMIN' | 'SYSTEM';
  pauseReason?: string;
  
  cancelledAt?: Date;
  cancelledBy?: 'DONOR' | 'STREAMER' | 'ADMIN' | 'SYSTEM';
  cancellationReason?: string;
  
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const AutopayMandateSchema = new Schema<IAutopayMandate>(
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
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    gatewayMandateId: {
      type: String,
      required: true,
      index: true,
    },
    
    status: {
      type: String,
      enum: Object.values(AutopayStatus),
      default: AutopayStatus.PENDING_APPROVAL,
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
    nextExecutionDate: {
      type: Date,
      required: true,
      index: true,
    },
    
    gateway: {
      type: String,
      enum: Object.values(PaymentGateway),
      required: true,
    },
    
    bankAccount: {
      accountNumber: { type: String, select: false },
      ifscCode: { type: String },
      accountHolderName: { type: String },
      bankName: { type: String },
    },
    
    card: {
      last4: { type: String },
      brand: { type: String },
      expiryMonth: { type: Number },
      expiryYear: { type: Number },
    },
    
    upi: {
      vpa: { type: String },
    },
    
    maxAmount: {
      type: Number,
      required: true,
    },
    
    executionHistory: [
      {
        executedAt: { type: Date, required: true },
        amount: { type: Number, required: true },
        status: {
          type: String,
          enum: ['SUCCESS', 'FAILED', 'PENDING'],
          required: true,
        },
        donationId: { type: Schema.Types.ObjectId, ref: 'Donation' },
        failureReason: { type: String },
        transactionId: { type: String },
      },
    ],
    
    statistics: {
      totalExecutions: { type: Number, default: 0 },
      successfulExecutions: { type: Number, default: 0 },
      failedExecutions: { type: Number, default: 0 },
      totalAmountCollected: { type: Number, default: 0 },
      lastExecutionDate: { type: Date },
      lastSuccessfulExecutionDate: { type: Date },
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
      ipAddress: { type: String },
      userAgent: { type: String },
      deviceId: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

AutopayMandateSchema.index({ donorId: 1, streamerId: 1 });
AutopayMandateSchema.index({ status: 1, nextExecutionDate: 1 });
AutopayMandateSchema.index({ streamerId: 1, status: 1 });
AutopayMandateSchema.index({ mandateId: 1, donorId: 1 });
AutopayMandateSchema.index({ createdAt: -1 });

export default mongoose.model<IAutopayMandate>('AutopayMandate', AutopayMandateSchema);
