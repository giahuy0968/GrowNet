import mongoose from 'mongoose';

export async function connectMongo(uri: string) {
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 5,
        socketTimeoutMS: 45000,
    });
    console.log('[DB] Connected to MongoDB');
}

export async function disconnectMongo() {
    await mongoose.disconnect();
    console.log('[DB] Disconnected from MongoDB');
}

