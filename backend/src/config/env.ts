// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';

// Debug: In đường dẫn hiện tại
console.log('Current directory:', __dirname);
console.log('Loading .env from:', path.resolve(__dirname, '../../.env'));

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debug: In các biến env
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('PORT')));

export const env = {
    mongoUri: process.env.MONGO_URI!,
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
};

// Tạm comment validation để test
// if (!process.env.MONGO_URI) {
//   throw new Error('MONGO_URI is not defined in environment variables');
// }