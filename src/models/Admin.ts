import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminRole, AccountStatus } from '../utils/enums';

export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  role: AdminRole;
  fullName: string;
  avatar?: string;
  
  permissions: string[];
  
  status: AccountStatus;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  
  lastLogin?: Date;
  lastLoginIp?: string;
  loginAttempts: number;
  lockUntil?: Date;
  
  activityLog: {
    action: string;
    timestamp: Date;
    ipAddress?: string;
    details?: string;
  }[];

  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.SUPPORT,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
    },
    
    permissions: [
      {
        type: String,
        enum: [
          'users.read',
          'users.write',
          'users.delete',
          'donations.read',
          'donations.write',
          'donations.refund',
          'fraud.read',
          'fraud.write',
          'fraud.investigate',
          'reports.read',
          'reports.generate',
          'settings.read',
          'settings.write',
          'admins.read',
          'admins.write',
          'admins.delete',
        ],
      },
    ],
    
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.ACTIVE,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    
    lastLogin: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    
    activityLog: [
      {
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        ipAddress: { type: String },
        details: { type: String },
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

AdminSchema.index({ username: 1, email: 1 });
AdminSchema.index({ status: 1, role: 1 });
AdminSchema.index({ createdAt: -1 });

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

AdminSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

export default mongoose.model<IAdmin>('Admin', AdminSchema);
