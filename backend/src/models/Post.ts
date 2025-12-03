import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  content: string;
  images: string[];
  likes: mongoose.Types.ObjectId[];
  comments: {
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  images: [{
    type: String
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });

export default mongoose.model<IPost>('Post', PostSchema);
