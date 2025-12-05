import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProfile extends Document {
  userId: Types.ObjectId;
  name: string;
  headline?: string;
  location?: string;
  languages?: string[];
  skills?: string[];
  goals?: string;
  expertise?: string;
  verified?: boolean;
  gender?: string;
  birthDate?: Date;
  avatarImage?: string;
}

const ProfileSchema: Schema<IProfile> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: { type: String, required: true },

  headline: String,
  location: String,
  languages: [String],
  skills: [String],
  goals: String,
  expertise: String,
  verified: { type: Boolean, default: false },
  gender: String,
  birthDate: Date,
  avatarImage: String,
});

export const Profile: Model<IProfile> = mongoose.model<IProfile>(
  'Profile',
  ProfileSchema,
  'Profiles',
);
