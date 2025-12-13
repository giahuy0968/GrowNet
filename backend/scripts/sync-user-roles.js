'use strict';

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error('Không tìm thấy biến môi trường MONGODB_URI hoặc MONGO_URI');
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    role: { type: String }
  },
  { strict: false, timestamps: false }
);

const User = mongoose.model('User', userSchema, 'users');

const DATASET_PATH = path.resolve(__dirname, '..', '..', 'grownet.users.json');

function loadUsers() {
  if (!fs.existsSync(DATASET_PATH)) {
    throw new Error(`Không tìm thấy file dữ liệu: ${DATASET_PATH}`);
  }
  const buffer = fs.readFileSync(DATASET_PATH, 'utf8');
  return JSON.parse(buffer);
}

function buildRoleMap(rawUsers) {
  const map = new Map();
  for (const user of rawUsers) {
    const email = (user && user.email ? String(user.email) : '').toLowerCase();
    const role = user?.role || 'mentee';
    if (email) {
      map.set(email, role);
    }
  }
  return map;
}

async function syncRoles() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Đã kết nối MongoDB');

  const rawUsers = loadUsers();
  const roleMap = buildRoleMap(rawUsers);
  console.log(`🔄 Bắt đầu đồng bộ ${roleMap.size} tài khoản từ JSON`);

  const operations = [];
  for (const [email, role] of roleMap.entries()) {
    operations.push({
      updateOne: {
        filter: { email },
        update: { $set: { role, updatedAt: new Date() } }
      }
    });
  }

  if (operations.length === 0) {
    console.log('Không có dữ liệu để cập nhật');
    await mongoose.disconnect();
    return;
  }

  const result = await User.bulkWrite(operations, { ordered: false });
  console.log('✅ Hoàn thành đồng bộ roles');
  console.log(` - Tổng lệnh: ${operations.length}`);
  console.log(` - Số bản ghi matched: ${result.matchedCount}`);
  console.log(` - Số bản ghi cập nhật: ${result.modifiedCount}`);

  const roleSummary = {};
  for (const role of roleMap.values()) {
    roleSummary[role] = (roleSummary[role] || 0) + 1;
  }
  console.log('📊 Thống kê theo vai trò từ file JSON:', roleSummary);

  await mongoose.disconnect();
}

syncRoles().catch(async (error) => {
  console.error('❌ Lỗi đồng bộ roles:', error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('Không thể đóng kết nối Mongo:', disconnectError);
  }
  process.exit(1);
});
