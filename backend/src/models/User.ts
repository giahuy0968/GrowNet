import mongoose, { Document, Schema } from 'mongoose';

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
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
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

export default mongoose.model<IUser>('User', UserSchema);
