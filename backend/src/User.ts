import mongoose, { Document, Schema } from 'mongoose';

// 1. Định nghĩa Interface cho Document
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'mentor' | 'mentee' | 'admin';
  createdAt: Date;
}

// 2. Định nghĩa Schema MongoDB
const UserSchema: Schema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['mentor', 'mentee', 'admin'], // Ràng buộc vai trò
    default: 'mentee', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// 3. Tạo và Export Model
export default mongoose.model<IUser>('User', UserSchema);