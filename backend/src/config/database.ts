import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://202.92.6.223:27017/grownet';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 MongoDB URI: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Server will continue running, but database operations will fail');
    // Don't exit - let server run without DB for debugging
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected - attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

export default connectDB;
