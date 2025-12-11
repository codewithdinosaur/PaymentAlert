import mongoose, { Schema, Document } from 'mongoose';
import { FraudSeverity, FraudAction } from '../utils/enums';

export interface IFraudLog extends Document {
  entityType: 'USER' | 'DONATION' | 'TRANSACTION' | 'IP_ADDRESS';
  entityId: mongoose.Types.ObjectId | string;
  
  userId?: mongoose.Types.ObjectId;
  donationId?: mongoose.Types.ObjectId;
  
  severity: FraudSeverity;
  action: FraudAction;
  
  reason: string;
  description?: string;
  
  riskScore: number;
  
  indicators: {
    type: string;
    value: string;
    weight: number;
  }[];
  
  detection: {
    method: 'AUTOMATED' | 'MANUAL' | 'REPORTED';
    detectedBy?: mongoose.Types.ObjectId;
    automatedRuleName?: string;
  };
  
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: {
      country?: string;
      city?: string;
      coordinates?: [number, number];
    };
    deviceFingerprint?: string;
    previousViolations?: number;
  };
  
  investigation?: {
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
    assignedTo?: mongoose.Types.ObjectId;
    notes: {
      note: string;
      addedBy: mongoose.Types.ObjectId;
      addedAt: Date;
    }[];
    startedAt?: Date;
    completedAt?: Date;
    outcome?: string;
  };
  
  resolution?: {
    action: 'NO_ACTION' | 'WARNING' | 'SUSPENSION' | 'BAN' | 'LEGAL_ACTION';
    resolvedBy: mongoose.Types.ObjectId;
    resolvedAt: Date;
    notes: string;
  };

  relatedLogs: mongoose.Types.ObjectId[];

  isActive: boolean;
  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const FraudLogSchema = new Schema<IFraudLog>(
  {
    entityType: {
      type: String,
      enum: ['USER', 'DONATION', 'TRANSACTION', 'IP_ADDRESS'],
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    donationId: {
      type: Schema.Types.ObjectId,
      ref: 'Donation',
      index: true,
    },
    
    severity: {
      type: String,
      enum: Object.values(FraudSeverity),
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(FraudAction),
      required: true,
      index: true,
    },
    
    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    
    indicators: [
      {
        type: { type: String, required: true },
        value: { type: String, required: true },
        weight: { type: Number, required: true },
      },
    ],
    
    detection: {
      method: {
        type: String,
        enum: ['AUTOMATED', 'MANUAL', 'REPORTED'],
        required: true,
      },
      detectedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
      automatedRuleName: { type: String },
    },
    
    metadata: {
      ipAddress: { type: String },
      userAgent: { type: String },
      location: {
        country: { type: String },
        city: { type: String },
        coordinates: {
          type: [Number],
          index: '2dsphere',
        },
      },
      deviceFingerprint: { type: String },
      previousViolations: { type: Number, default: 0 },
    },
    
    investigation: {
      status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED'],
        default: 'PENDING',
        index: true,
      },
      assignedTo: { type: Schema.Types.ObjectId, ref: 'Admin' },
      notes: [
        {
          note: { type: String, required: true },
          addedBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
          addedAt: { type: Date, default: Date.now },
        },
      ],
      startedAt: { type: Date },
      completedAt: { type: Date },
      outcome: { type: String },
    },
    
    resolution: {
      action: {
        type: String,
        enum: ['NO_ACTION', 'WARNING', 'SUSPENSION', 'BAN', 'LEGAL_ACTION'],
      },
      resolvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
      resolvedAt: { type: Date },
      notes: { type: String },
    },

    relatedLogs: [{ type: Schema.Types.ObjectId, ref: 'FraudLog' }],

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

FraudLogSchema.index({ entityType: 1, entityId: 1 });
FraudLogSchema.index({ severity: 1, isActive: 1 });
FraudLogSchema.index({ action: 1, createdAt: -1 });
FraudLogSchema.index({ 'investigation.status': 1, 'investigation.assignedTo': 1 });
FraudLogSchema.index({ userId: 1, createdAt: -1 });
FraudLogSchema.index({ riskScore: -1 });

export default mongoose.model<IFraudLog>('FraudLog', FraudLogSchema);
