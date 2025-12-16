// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://202.92.6.223:27017/grownet',
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  serverBaseUrl: process.env.SERVER_BASE_URL,
  googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
  googleOAuthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
  linkedinClientId: process.env.LINKEDIN_CLIENT_ID || process.env.LINKEDIN_APP_ID,
  linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET || process.env.LINKEDIN_APP_SECRET,
  facebookClientId: process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID,
  facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET
};

// Validate required environment variables
if (!env.mongoUri) {
  throw new Error('MONGO_URI or MONGODB_URI is not defined in environment variables');
}