// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
    mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/grownet',
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
};

// Validate required environment variables
if (!env.mongoUri) {
  throw new Error('MONGO_URI or MONGODB_URI is not defined in environment variables');
}