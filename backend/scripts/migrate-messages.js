/*
  Message normalization migration
  - Adds readBy array (defaults to [senderId]) if missing
  - Adds type = 'text' if missing
  - Backfills createdAt/updatedAt from sentAt if missing
  Safe to re-run: operations are conditional/idempotent.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grownet';

async function run() {
    console.log('Starting message migration...');
    console.log('Connecting to', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });

    const db = mongoose.connection.db;
    const messages = db.collection('messages');

    // 1) Ensure readBy exists (default to [senderId])
    const res1 = await messages.updateMany(
        { readBy: { $exists: false } },
        [{ $set: { readBy: ['$senderId'] } }]
    );
    console.log(`readBy added on ${res1.modifiedCount} docs`);

    // 2) Default type to 'text'
    const res2 = await messages.updateMany(
        { type: { $exists: false } },
        { $set: { type: 'text' } }
    );
    console.log(`type defaulted on ${res2.modifiedCount} docs`);

    // 3) Backfill timestamps from sentAt if present
    const res3 = await messages.updateMany(
        { createdAt: { $exists: false }, sentAt: { $exists: true } },
        [{ $set: { createdAt: '$sentAt', updatedAt: '$sentAt' } }]
    );
    console.log(`timestamps backfilled on ${res3.modifiedCount} docs`);

    await mongoose.disconnect();
    console.log('Migration complete.');
}

run().catch(err => {
    console.error('Migration failed:', err);
    process.exitCode = 1;
});
