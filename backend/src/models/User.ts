import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  interests: string[];
  location?: {
    city: string;
    country: string;
  };
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
  interests: [{
    type: String,
    trim: true
  }],
  location: {
    city: String,
    country: String
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

export default mongoose.model<IUser>('User', UserSchema);
