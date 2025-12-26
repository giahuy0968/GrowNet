/*
 * Script: fix-chat-index.js
 * Purpose: Drop the invalid unique index on chats.participants and recreate a safe compound index.
 */
'use strict';

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ Không tìm thấy biến môi trường MONGODB_URI hoặc MONGO_URI');
  process.exit(1);
}

async function fixChatIndex() {
  console.log('⏳ Đang kết nối MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Đã kết nối MongoDB');

  const collection = mongoose.connection.collection('chats');
  const indexes = await collection.indexes();
  const participantsIdx = indexes.find((idx) => idx.name === 'participants_1');

  if (!participantsIdx) {
    console.log('ℹ️ Không tìm thấy index "participants_1". Không cần drop.');
  } else {
    console.log(`🔎 Found index participants_1 (unique=${Boolean(participantsIdx.unique)})`);
    await collection.dropIndex('participants_1');
    console.log('🗑️  Đã xoá index participants_1');
  }

  const newIndex = { participants: 1, updatedAt: -1 };
  await collection.createIndex(newIndex, { name: 'participants_updatedAt', background: true });
  console.log('✅ Đã tạo index participants_updatedAt (không unique)');

  await mongoose.disconnect();
  console.log('🎉 Hoàn thành fix index cho chats collection');
}

fixChatIndex().catch(async (error) => {
  console.error('❌ Lỗi khi xử lý index:', error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('Không thể đóng kết nối Mongo:', disconnectError);
  }
  process.exit(1);
});
