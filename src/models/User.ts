import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, AccountStatus, TierLevel } from '../utils/enums';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
  avatar?: string;
  bio?: string;
  
  streamerProfile?: {
    streamingPlatforms: {
      platform: string;
      profileUrl: string;
      verified: boolean;
    }[];
    paymentSettings: {
      upiId?: string;
      qrCodeEnabled: boolean;
      minDonationAmount: number;
      maxDonationAmount: number;
      allowAnonymous: boolean;
      showDonorList: boolean;
    };
    alertSettings: {
      soundEnabled: boolean;
      minAmountForAlert: number;
      displayDuration: number;
      customMessage?: string;
    };
    tier: {
      level: TierLevel;
      features: string[];
      expiresAt?: Date;
    };
    stats: {
      totalDonationsReceived: number;
      totalAmountReceived: number;
      totalDonors: number;
      averageDonation: number;
    };
  };

  donorProfile?: {
    totalDonationsGiven: number;
    totalAmountGiven: number;
    favoriteStreamers: mongoose.Types.ObjectId[];
    preferredPaymentMethod?: string;
  };

  status: AccountStatus;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  phoneNumber?: string;
  twoFactorEnabled: boolean;
  
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
}

const UserSchema = new Schema<IUser>(
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
      enum: Object.values(UserRole),
      default: UserRole.DONOR,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    
    streamerProfile: {
      streamingPlatforms: [
        {
          platform: { type: String, required: true },
          profileUrl: { type: String, required: true },
          verified: { type: Boolean, default: false },
        },
      ],
      paymentSettings: {
        upiId: { type: String },
        qrCodeEnabled: { type: Boolean, default: true },
        minDonationAmount: { type: Number, default: 10 },
        maxDonationAmount: { type: Number, default: 100000 },
        allowAnonymous: { type: Boolean, default: true },
        showDonorList: { type: Boolean, default: true },
      },
      alertSettings: {
        soundEnabled: { type: Boolean, default: true },
        minAmountForAlert: { type: Number, default: 10 },
        displayDuration: { type: Number, default: 5 },
        customMessage: { type: String },
      },
      tier: {
        level: {
          type: String,
          enum: Object.values(TierLevel),
          default: TierLevel.FREE,
        },
        features: [{ type: String }],
        expiresAt: { type: Date },
      },
      stats: {
        totalDonationsReceived: { type: Number, default: 0 },
        totalAmountReceived: { type: Number, default: 0 },
        totalDonors: { type: Number, default: 0 },
        averageDonation: { type: Number, default: 0 },
      },
    },

    donorProfile: {
      totalDonationsGiven: { type: Number, default: 0 },
      totalAmountGiven: { type: Number, default: 0 },
      favoriteStreamers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      preferredPaymentMethod: { type: String },
    },

    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.PENDING_VERIFICATION,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      sparse: true,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ username: 1, email: 1 });
UserSchema.index({ 'streamerProfile.tier.level': 1 });
UserSchema.index({ status: 1, role: 1 });
UserSchema.index({ createdAt: -1 });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

export default mongoose.model<IUser>('User', UserSchema);
