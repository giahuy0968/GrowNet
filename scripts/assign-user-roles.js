'use strict';

const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.resolve(__dirname, '..', 'grownet.users.json');
const ADMIN_COUNT = 3;
const MENTOR_COUNT = 15;

function loadUsers() {
  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(`Không tìm thấy file dữ liệu: ${SOURCE_FILE}`);
  }
  const payload = fs.readFileSync(SOURCE_FILE, 'utf8');
  return JSON.parse(payload);
}

function assignRoles(users) {
  const sorted = [...users].sort((a, b) => {
    const expA = typeof a.experienceYears === 'number' ? a.experienceYears : 0;
    const expB = typeof b.experienceYears === 'number' ? b.experienceYears : 0;
    return expB - expA;
  });

  const adminIds = new Set(sorted.slice(0, ADMIN_COUNT).map((user) => user?._id?.$oid));
  const mentorIds = new Set(
    sorted
      .slice(ADMIN_COUNT, ADMIN_COUNT + MENTOR_COUNT)
      .map((user) => user?._id?.$oid)
  );

  return users.map((user) => {
    const userId = user?._id?.$oid;
    let role = 'mentee';

    if (userId && adminIds.has(userId)) {
      role = 'admin';
    } else if (userId && mentorIds.has(userId)) {
      role = 'mentor';
    }

    return { ...user, role };
  });
}

function persist(users) {
  const serialized = JSON.stringify(users, null, 2);
  fs.writeFileSync(SOURCE_FILE, `${serialized}\n`, 'utf8');
}

function main() {
  const users = loadUsers();
  const updated = assignRoles(users);

  const mentorCount = updated.filter((u) => u.role === 'mentor').length;
  const adminCount = updated.filter((u) => u.role === 'admin').length;
  const menteeCount = updated.length - mentorCount - adminCount;

  persist(updated);

  console.log(`Đã gán quyền cho ${updated.length} tài khoản.`);
  console.log(`Admin: ${adminCount}, Mentor: ${mentorCount}, Mentee: ${menteeCount}`);
  console.log(`File đã cập nhật: ${SOURCE_FILE}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('Không thể gán quyền cho danh sách người dùng:', error);
    process.exit(1);
  }
}
