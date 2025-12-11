import mongoose, { Schema, Document } from 'mongoose';
import { QRCodeStatus, PaymentGateway } from '../utils/enums';

export interface IQRCodeOrder extends Document {
  streamerId: mongoose.Types.ObjectId;
  
  qrCodeId: string;
  qrCodeUrl: string;
  qrCodeData: string;
  
  upiId: string;
  merchantName: string;
  
  status: QRCodeStatus;
  
  amount?: number;
  isDynamic: boolean;
  
  gateway: PaymentGateway;
  gatewayQRId?: string;
  
  validFrom: Date;
  validUntil?: Date;
  
  usage: {
    totalScans: number;
    successfulPayments: number;
    totalAmountReceived: number;
    lastUsedAt?: Date;
  };
  
  restrictions: {
    maxUsageCount?: number;
    maxAmountPerTransaction?: number;
    minAmountPerTransaction?: number;
    allowedPaymentMethods?: string[];
  };
  
  metadata: {
    description?: string;
    customerId?: string;
    referenceId?: string;
    tags?: string[];
  };

  deactivatedAt?: Date;
  deactivatedBy?: mongoose.Types.ObjectId;
  deactivationReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const QRCodeOrderSchema = new Schema<IQRCodeOrder>(
  {
    streamerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    qrCodeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrCodeUrl: {
      type: String,
      required: true,
    },
    qrCodeData: {
      type: String,
      required: true,
    },
    
    upiId: {
      type: String,
      required: true,
      index: true,
    },
    merchantName: {
      type: String,
      required: true,
    },
    
    status: {
      type: String,
      enum: Object.values(QRCodeStatus),
      default: QRCodeStatus.ACTIVE,
      index: true,
    },
    
    amount: {
      type: Number,
      min: 0,
    },
    isDynamic: {
      type: Boolean,
      default: true,
    },
    
    gateway: {
      type: String,
      enum: Object.values(PaymentGateway),
      required: true,
    },
    gatewayQRId: {
      type: String,
    },
    
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      index: true,
    },
    
    usage: {
      totalScans: { type: Number, default: 0 },
      successfulPayments: { type: Number, default: 0 },
      totalAmountReceived: { type: Number, default: 0 },
      lastUsedAt: { type: Date },
    },
    
    restrictions: {
      maxUsageCount: { type: Number },
      maxAmountPerTransaction: { type: Number },
      minAmountPerTransaction: { type: Number },
      allowedPaymentMethods: [{ type: String }],
    },
    
    metadata: {
      description: { type: String, maxlength: 500 },
      customerId: { type: String },
      referenceId: { type: String },
      tags: [{ type: String }],
    },

    deactivatedAt: {
      type: Date,
    },
    deactivatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    deactivationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

QRCodeOrderSchema.index({ streamerId: 1, status: 1 });
QRCodeOrderSchema.index({ status: 1, validUntil: 1 });
QRCodeOrderSchema.index({ qrCodeId: 1, streamerId: 1 });
QRCodeOrderSchema.index({ createdAt: -1 });

export default mongoose.model<IQRCodeOrder>('QRCodeOrder', QRCodeOrderSchema);
