const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const MONGO_URI = 'mongodb://admin:changethispassword123@202.92.6.223:27017/grownet?authSource=admin';

async function importAndCreate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      fullName: String,
      bio: String,
      avatar: String,
      interests: [String],
      fields: [String],
      skills: [String],
      location: {
        city: String,
        country: String
      },
      experienceYears: Number,
      age: Number,
      gender: String,
      lastActive: Date,
      createdAt: Date,
      updatedAt: Date
    }));

    // Import 22 users cũ
    console.log('📥 Đang import 22 users cũ từ JSON...');
    const oldUsers = JSON.parse(fs.readFileSync('../grownet.users.json', 'utf8'));
    
    for (const user of oldUsers) {
      delete user._id; // Xóa _id cũ để MongoDB tạo mới
      if (user.lastActive?.$date) {
        user.lastActive = new Date(user.lastActive.$date);
      }
      if (user.createdAt?.$date) {
        user.createdAt = new Date(user.createdAt.$date);
      }
      if (user.updatedAt?.$date) {
        user.updatedAt = new Date(user.updatedAt.$date);
      }
    }
    
    await User.insertMany(oldUsers);
    console.log(`✅ Đã import ${oldUsers.length} users cũ`);

    // Tạo thêm 50 users mới
    console.log('\n🔨 Đang tạo 50 users mới...\n');
    
    const fields = ['technology', 'healthcare', 'education', 'finance', 'marketing', 'design', 'engineering', 'law', 'arts', 'agriculture', 'hospitality', 'media', 'retail', 'consulting', 'research'];
    const techSkills = ['javascript', 'python', 'java', 'react', 'nodejs', 'mongodb', 'aws', 'docker', 'kubernetes', 'ai', 'machine learning'];
    const healthcareSkills = ['nursing', 'patient care', 'medical research', 'pharmacy', 'surgery', 'diagnostics'];
    const educationSkills = ['teaching', 'curriculum development', 'mentoring', 'educational technology', 'assessment'];
    const financeSkills = ['accounting', 'investment analysis', 'risk management', 'financial planning', 'auditing'];
    const marketingSkills = ['seo', 'content marketing', 'social media', 'branding', 'analytics', 'copywriting'];
    const designSkills = ['ui/ux', 'graphic design', 'illustration', 'web design', 'branding', 'figma', 'photoshop'];
    const engineeringSkills = ['cad', 'project management', 'quality control', 'manufacturing', 'automation'];
    const lawSkills = ['legal research', 'contract law', 'litigation', 'compliance', 'intellectual property'];
    const artsSkills = ['painting', 'sculpture', 'music', 'photography', 'creative writing', 'performance'];
    const agriSkills = ['crop management', 'sustainable farming', 'irrigation', 'animal husbandry', 'agribusiness'];

    const cities = [
      { city: 'Hanoi', country: 'Vietnam' },
      { city: 'Ho Chi Minh', country: 'Vietnam' },
      { city: 'Da Nang', country: 'Vietnam' },
      { city: 'Hai Phong', country: 'Vietnam' },
      { city: 'Can Tho', country: 'Vietnam' },
      { city: 'Singapore', country: 'Singapore' },
      { city: 'Bangkok', country: 'Thailand' },
      { city: 'Kuala Lumpur', country: 'Malaysia' },
      { city: 'Jakarta', country: 'Indonesia' },
      { city: 'Manila', country: 'Philippines' },
      { city: 'Tokyo', country: 'Japan' },
      { city: 'Seoul', country: 'South Korea' },
      { city: 'New York', country: 'USA' },
      { city: 'London', country: 'UK' },
      { city: 'Sydney', country: 'Australia' }
    ];

    const interests = ['reading', 'traveling', 'cooking', 'sports', 'music', 'photography', 'gaming', 'fitness', 'yoga', 'meditation', 'hiking', 'swimming', 'cycling', 'painting', 'dancing', 'volunteering', 'gardening', 'tech gadgets', 'movies', 'startups'];

    const firstNames = ['An', 'Binh', 'Cuong', 'Dung', 'Em', 'Giang', 'Hoa', 'Khanh', 'Linh', 'Minh', 'Nam', 'Oanh', 'Phuong', 'Quan', 'Son', 'Thao', 'Tuan', 'Vy', 'Xuan', 'Yen', 'James', 'Sarah', 'Michael', 'Emma', 'David', 'Sophia', 'John', 'Olivia', 'Robert', 'Isabella'];
    const lastNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Dang', 'Vo', 'Bui', 'Do', 'Ngo', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];

    function getRandomElement(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function getRandomElements(arr, count) {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }

    function getSkillsForField(field) {
      const skillMap = {
        'technology': techSkills,
        'healthcare': healthcareSkills,
        'education': educationSkills,
        'finance': financeSkills,
        'marketing': marketingSkills,
        'design': designSkills,
        'engineering': engineeringSkills,
        'law': lawSkills,
        'arts': artsSkills,
        'agriculture': agriSkills
      };
      return skillMap[field] || techSkills;
    }

    const hashedPassword = await bcrypt.hash('123456', 10);
    const newUsers = [];

    for (let i = 1; i <= 50; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const username = `user${100 + i}`;
      const email = `${username}@grownet.com`;
      const field = getRandomElement(fields);
      const location = getRandomElement(cities);
      const gender = getRandomElement(['male', 'female', 'other']);
      const age = Math.floor(Math.random() * 30) + 20;
      const experienceYears = Math.floor(Math.random() * 20);

      const user = {
        username,
        email,
        password: hashedPassword,
        fullName: `${firstName} ${lastName}`,
        bio: `${field.charAt(0).toUpperCase() + field.slice(1)} professional with ${experienceYears} years of experience. Based in ${location.city}.`,
        avatar: `https://i.pravatar.cc/150?img=${i}`,
        interests: getRandomElements(interests, Math.floor(Math.random() * 5) + 3),
        fields: [field, ...getRandomElements(fields.filter(f => f !== field), Math.floor(Math.random() * 2))],
        skills: getRandomElements(getSkillsForField(field), Math.floor(Math.random() * 5) + 3),
        location,
        experienceYears,
        age,
        gender,
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      newUsers.push(user);
      console.log(`✓ ${i}. ${user.fullName} - ${field} - ${location.city}`);
    }

    await User.insertMany(newUsers);
    console.log(`\n✅ Đã tạo ${newUsers.length} users mới`);

    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Tổng số users: ${totalUsers}`);
    console.log(`🔑 Tất cả đều có password: 123456`);

    await mongoose.disconnect();
    console.log('\n✅ Hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
  process.exit(0);
}

importAndCreate();
