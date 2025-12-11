import mongoose, { Schema, Document } from 'mongoose';
import { TransactionType, PaymentMethod, PaymentGateway } from '../utils/enums';

export interface IPaymentHistory extends Document {
  userId: mongoose.Types.ObjectId;
  
  transactionType: TransactionType;
  
  donationId?: mongoose.Types.ObjectId;
  mandateId?: mongoose.Types.ObjectId;
  recurringPaymentId?: mongoose.Types.ObjectId;
  
  amount: number;
  currency: string;
  
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGateway;
  
  transactionId: string;
  gatewayTransactionId?: string;
  
  status: 'INITIATED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  
  description: string;
  
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    location?: {
      country?: string;
      city?: string;
    };
  };
  
  timeline: {
    initiatedAt: Date;
    processedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    refundedAt?: Date;
  };
  
  fees: {
    gatewayFee: number;
    platformFee: number;
    gst: number;
    totalFee: number;
  };
  
  netAmount: number;
  
  failureDetails?: {
    code: string;
    message: string;
    retry: boolean;
    retryAttempts: number;
  };
  
  refundDetails?: {
    refundId: string;
    refundAmount: number;
    refundReason: string;
    refundedBy: mongoose.Types.ObjectId;
  };

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentHistorySchema = new Schema<IPaymentHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    transactionType: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
      index: true,
    },
    
    donationId: {
      type: Schema.Types.ObjectId,
      ref: 'Donation',
      index: true,
    },
    mandateId: {
      type: Schema.Types.ObjectId,
      ref: 'AutopayMandate',
      index: true,
    },
    recurringPaymentId: {
      type: Schema.Types.ObjectId,
      ref: 'RecurringPayment',
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
    
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
      index: true,
    },
    paymentGateway: {
      type: String,
      enum: Object.values(PaymentGateway),
      required: true,
    },
    
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    gatewayTransactionId: {
      type: String,
      index: true,
    },
    
    status: {
      type: String,
      enum: ['INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'],
      required: true,
      index: true,
    },
    
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    
    metadata: {
      ipAddress: { type: String },
      userAgent: { type: String },
      deviceId: { type: String },
      location: {
        country: { type: String },
        city: { type: String },
      },
    },
    
    timeline: {
      initiatedAt: { type: Date, required: true, default: Date.now },
      processedAt: { type: Date },
      completedAt: { type: Date },
      failedAt: { type: Date },
      refundedAt: { type: Date },
    },
    
    fees: {
      gatewayFee: { type: Number, default: 0 },
      platformFee: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      totalFee: { type: Number, default: 0 },
    },
    
    netAmount: {
      type: Number,
      required: true,
    },
    
    failureDetails: {
      code: { type: String },
      message: { type: String },
      retry: { type: Boolean },
      retryAttempts: { type: Number, default: 0 },
    },
    
    refundDetails: {
      refundId: { type: String },
      refundAmount: { type: Number },
      refundReason: { type: String },
      refundedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },

    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

PaymentHistorySchema.index({ userId: 1, status: 1 });
PaymentHistorySchema.index({ userId: 1, transactionType: 1 });
PaymentHistorySchema.index({ transactionId: 1, userId: 1 });
PaymentHistorySchema.index({ status: 1, createdAt: -1 });
PaymentHistorySchema.index({ 'timeline.completedAt': -1 });
PaymentHistorySchema.index({ createdAt: -1 });

export default mongoose.model<IPaymentHistory>('PaymentHistory', PaymentHistorySchema);
