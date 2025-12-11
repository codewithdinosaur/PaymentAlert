import mongoose, { Schema, Document } from 'mongoose';
import { DonationStatus, PaymentMethod, PaymentGateway } from '../utils/enums';

export interface IDonation extends Document {
  donorId: mongoose.Types.ObjectId;
  streamerId: mongoose.Types.ObjectId;
  
  amount: number;
  currency: string;
  
  status: DonationStatus;
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGateway;
  
  transactionId: string;
  gatewayTransactionId?: string;
  gatewayOrderId?: string;
  
  message?: string;
  isAnonymous: boolean;
  donorName?: string;
  
  metadata: {
    upiId?: string;
    cardLast4?: string;
    bankName?: string;
    walletProvider?: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
  };
  
  fees: {
    gatewayFee: number;
    platformFee: number;
    gst: number;
    totalFee: number;
  };
  
  netAmount: number;
  
  alertShown: boolean;
  alertShownAt?: Date;
  
  refund?: {
    refundId: string;
    refundAmount: number;
    refundReason: string;
    refundedAt: Date;
    refundedBy: mongoose.Types.ObjectId;
  };
  
  fraudCheck?: {
    score: number;
    flagged: boolean;
    reason?: string;
    checkedAt: Date;
  };

  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
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
    
    status: {
      type: String,
      enum: Object.values(DonationStatus),
      default: DonationStatus.PENDING,
      index: true,
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
    gatewayOrderId: {
      type: String,
      index: true,
    },
    
    message: {
      type: String,
      maxlength: 500,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    donorName: {
      type: String,
      maxlength: 100,
    },
    
    metadata: {
      upiId: { type: String },
      cardLast4: { type: String },
      bankName: { type: String },
      walletProvider: { type: String },
      ipAddress: { type: String },
      userAgent: { type: String },
      referer: { type: String },
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
    
    alertShown: {
      type: Boolean,
      default: false,
    },
    alertShownAt: {
      type: Date,
    },
    
    refund: {
      refundId: { type: String },
      refundAmount: { type: Number },
      refundReason: { type: String },
      refundedAt: { type: Date },
      refundedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },
    
    fraudCheck: {
      score: { type: Number },
      flagged: { type: Boolean, default: false },
      reason: { type: String },
      checkedAt: { type: Date },
    },

    processedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

DonationSchema.index({ donorId: 1, transactionId: 1 });
DonationSchema.index({ streamerId: 1, status: 1 });
DonationSchema.index({ streamerId: 1, completedAt: -1 });
DonationSchema.index({ status: 1, createdAt: -1 });
DonationSchema.index({ 'fraudCheck.flagged': 1 });
DonationSchema.index({ amount: -1 });
DonationSchema.index({ createdAt: -1 });

export default mongoose.model<IDonation>('Donation', DonationSchema);
