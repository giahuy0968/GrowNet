const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Kết nối MongoDB (lấy từ .env)
const MONGO_URI = 'mongodb://admin:changethispassword123@202.92.6.223:27017/grownet?authSource=admin';

mongoose.connect(MONGO_URI);

async function hashOldPasswords() {
  try {
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      password: String
    }));

    const users = await User.find({});
    console.log(`Tìm thấy ${users.length} tài khoản`);

    for (const user of users) {
      // Kiểm tra xem password đã được hash chưa (bcrypt hash bắt đầu bằng $2a$ hoặc $2b$)
      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        console.log(`Đang hash password cho user: ${user.username}`);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await User.updateOne(
          { _id: user._id },
          { password: hashedPassword }
        );
        console.log(`✓ Đã hash password cho: ${user.username}`);
      } else {
        console.log(`✓ Password của ${user.username} đã được hash`);
      }
    }

    console.log('\nHoàn thành!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

hashOldPasswords();
