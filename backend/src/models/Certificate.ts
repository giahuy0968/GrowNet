import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  credentialId: string;
  summary: string;
  skills: string[];
  badgeUrl?: string;
  evidenceUrl?: string;
  issuedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>({
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  menteeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  credentialId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  summary: {
    type: String,
    required: true,
    minlength: 20
  },
  skills: {
    type: [{ type: String, trim: true }],
    default: []
  },
  badgeUrl: {
    type: String
  },
  evidenceUrl: {
    type: String
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

CertificateSchema.index({ credentialId: 1 });
CertificateSchema.index({ mentorId: 1, issuedAt: -1 });
CertificateSchema.index({ menteeId: 1, issuedAt: -1 });

export default mongoose.model<ICertificate>('Certificate', CertificateSchema);
