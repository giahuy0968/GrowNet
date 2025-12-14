import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'mentor' | 'mentee' | 'admin' | 'moderator';

export type AccountStatus = 'active' | 'locked' | 'suspended';
export type ProfileStatus = 'pending' | 'approved' | 'rejected';
export type LoginProvider = 'password' | 'google' | 'linkedin' | 'facebook';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  interests: string[];
  fields?: string[];
  skills?: string[];
  location?: {
    city: string;
    country: string;
  };
  experienceYears?: number;
  age?: number;
  gender?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  accountStatus: AccountStatus;
  profileStatus: ProfileStatus;
  moderationNotes?: string;
  lastLoginProvider?: LoginProvider;
  lastLoginAt?: Date;
  oauthProviders: Array<{
    provider: LoginProvider;
    lastLoginAt: Date;
    accountId?: string;
  }>;
  isSpamSuspected: boolean;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String,
    default: 'https://i.pravatar.cc/150'
  },
  interests: {
    type: [{ type: String, trim: true }],
    default: []
  },
  fields: {
    type: [{ type: String, trim: true, lowercase: true }],
    default: []
  },
  skills: {
    type: [{ type: String, trim: true, lowercase: true }],
    default: []
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  experienceYears: {
    type: Number,
    min: 0,
    max: 60,
    default: 0
  },
  age: {
    type: Number,
    min: 13,
    max: 120
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', '']
  },
  role: {
    type: String,
    enum: ['mentor', 'mentee', 'admin', 'moderator'],
    default: 'mentee'
  },
  accountStatus: {
    type: String,
    enum: ['active', 'locked', 'suspended'],
    default: 'active'
  },
  profileStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNotes: {
    type: String,
    maxlength: 500
  },
  lastLoginProvider: {
    type: String,
    enum: ['password', 'google', 'linkedin', 'facebook'],
    default: 'password'
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  oauthProviders: {
    type: [
      {
        provider: {
          type: String,
          enum: ['password', 'google', 'linkedin', 'facebook'],
          required: true
        },
        accountId: {
          type: String,
          trim: true
        },
        lastLoginAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },
  isSpamSuspected: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes - email and username already indexed via unique: true
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'location.city': 1 });
UserSchema.index({ interests: 1 });
UserSchema.index({ fields: 1 });
UserSchema.index({ role: 1, accountStatus: 1 });
UserSchema.index({ profileStatus: 1 });

export default mongoose.model<IUser>('User', UserSchema);
