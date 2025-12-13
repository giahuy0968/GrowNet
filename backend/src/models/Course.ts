import mongoose, { Document, Schema } from 'mongoose';

interface CourseModule {
  title: string;
  content: string;
  durationHours?: number;
  deliverable?: string;
}

export interface ICourse extends Document {
  mentorId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  format?: 'online' | 'hybrid' | 'onsite';
  language?: string;
  durationHours?: number;
  sessions?: number;
  price?: number;
  coverImage?: string;
  tags: string[];
  tools: string[];
  startDate?: Date;
  endDate?: Date;
  modules: CourseModule[];
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<CourseModule>({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  durationHours: { type: Number, min: 0 },
  deliverable: { type: String }
}, { _id: false });

const CourseSchema = new Schema<ICourse>({
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 60
  },
  category: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  format: {
    type: String,
    enum: ['online', 'hybrid', 'onsite'],
    default: 'online'
  },
  language: {
    type: String,
    default: 'vi'
  },
  durationHours: {
    type: Number,
    min: 1,
    max: 500
  },
  sessions: {
    type: Number,
    min: 1,
    max: 100
  },
  price: {
    type: Number,
    min: 0
  },
  coverImage: {
    type: String
  },
  tags: {
    type: [{ type: String, trim: true, lowercase: true }],
    default: []
  },
  tools: {
    type: [{ type: String, trim: true }],
    default: []
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  modules: {
    type: [ModuleSchema],
    default: []
  }
}, {
  timestamps: true
});

CourseSchema.index({ slug: 1 });
CourseSchema.index({ mentorId: 1, createdAt: -1 });
CourseSchema.index({ level: 1 });
CourseSchema.index({ tags: 1 });

export default mongoose.model<ICourse>('Course', CourseSchema);
