import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/database';
import User, { UserRole } from '../models/User';
import Course from '../models/Course';
import Certificate from '../models/Certificate';

dotenv.config();

interface SeedUser {
  email: string;
  username: string;
  fullName: string;
  bio: string;
  role: UserRole;
  interests: string[];
  fields: string[];
  skills: string[];
  experienceYears: number;
  location: {
    city: string;
    country: string;
  };
}

interface SeedCourse {
  mentorEmail: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  format: 'online' | 'hybrid' | 'onsite';
  language: string;
  durationHours: number;
  sessions: number;
  price: number;
  coverImage?: string;
  tags: string[];
  tools: string[];
  startDate: string;
  endDate: string;
  modules: Array<{
    title: string;
    content: string;
    durationHours?: number;
    deliverable?: string;
  }>;
}

interface SeedCertificate {
  credentialId: string;
  mentorEmail: string;
  menteeEmail: string;
  courseTitle: string;
  summary: string;
  skills: string[];
  badgeUrl?: string;
  evidenceUrl?: string;
  issuedAt: string;
}

const mentors: SeedUser[] = [
  {
    email: 'mentor.lan@grownet.vn',
    username: 'lanpham',
    fullName: 'Phạm Thanh Lan',
    bio: '12 năm xây dựng chiến lược tăng trưởng sản phẩm SaaS tại VNG và Gojek. Lan tập trung vào Product-Led Growth, monetization và OKR vận hành nhóm product.',
    role: 'mentor',
    interests: ['product-led growth', 'saas', 'leadership'],
    fields: ['product management'],
    skills: ['product strategy', 'experimentation', 'growth marketing', 'team coaching'],
    experienceYears: 12,
    location: { city: 'TP. Hồ Chí Minh', country: 'Việt Nam' }
  },
  {
    email: 'mentor.hoang@grownet.vn',
    username: 'hoangdata',
    fullName: 'Nguyễn Đăng Hoàng',
    bio: 'Lead Data Scientist tại beGroup, phụ trách xây dựng hệ thống dự báo nhu cầu và tối ưu recommendation. Hoàng chú trọng mentoring mentee xây pipeline thực tế.',
    role: 'mentor',
    interests: ['machine learning', 'mlops', 'data engineering'],
    fields: ['data science'],
    skills: ['python', 'mlflow', 'gcp', 'feature engineering'],
    experienceYears: 10,
    location: { city: 'Hà Nội', country: 'Việt Nam' }
  }
];

const mentees: SeedUser[] = [
  {
    email: 'mai.mkt@grownet.vn',
    username: 'maimarketing',
    fullName: 'Trần Mai',
    bio: 'Chuyên viên marketing chuyển hướng sang quản lý sản phẩm cho mảng B2B.',
    role: 'mentee',
    interests: ['product management', 'data-driven marketing'],
    fields: ['marketing'],
    skills: ['google analytics', 'crm'],
    experienceYears: 4,
    location: { city: 'Đà Nẵng', country: 'Việt Nam' }
  },
  {
    email: 'hung.ds@grownet.vn',
    username: 'hungdatasci',
    fullName: 'Phạm Hữu Hùng',
    bio: 'Kỹ sư phần mềm muốn nâng cấp kỹ năng ML để dẫn dắt nhóm data.',
    role: 'mentee',
    interests: ['machine learning', 'mlops'],
    fields: ['software engineering'],
    skills: ['python', 'nodejs'],
    experienceYears: 6,
    location: { city: 'Cần Thơ', country: 'Việt Nam' }
  }
];

const courses: SeedCourse[] = [
  {
    mentorEmail: 'mentor.lan@grownet.vn',
    title: 'Chiến lược Product-Led Growth cho SaaS Việt',
    subtitle: 'Thiết kế vòng đời người dùng & mô hình đo lường tăng trưởng bền vững',
    description:
      'Chương trình chuyên sâu 8 tuần giúp đội ngũ sản phẩm xây dựng chiến lược Product-Led Growth cho SaaS ở thị trường Việt Nam. Học viên sẽ thực chiến với số liệu thật của beCRM và xây dựng roadmap thí điểm tăng trưởng.',
    category: 'Product Management',
    level: 'advanced',
    format: 'online',
    language: 'vi',
    durationHours: 24,
    sessions: 8,
    price: 4200000,
    coverImage: 'https://images.grownet.vn/courses/plg-saas.jpg',
    tags: ['product-led growth', 'saas', 'activation', 'retention'],
    tools: ['Mixpanel', 'Amplitude', 'Figma', 'Notion'],
    startDate: '2025-01-06',
    endDate: '2025-02-28',
    modules: [
      {
        title: 'Chẩn đoán funnel & định nghĩa North Star Metric',
        content: 'Phân tích dữ liệu hành vi người dùng thật từ sản phẩm nội bộ và xây dựng chỉ số North Star phù hợp.',
        durationHours: 3,
        deliverable: 'Tài liệu North Star Metric và dashboard theo dõi'
      },
      {
        title: 'Thiết kế thí nghiệm Activation & Retention',
        content: 'Xây backlog thí nghiệm với ma trận ICE, chuẩn bị kế hoạch tracking và ritual review.',
        durationHours: 4,
        deliverable: 'Activation experiment backlog + ritual template'
      },
      {
        title: 'Vận hành PLG Squad & OKR',
        content: 'Thiết lập cơ chế ra quyết định, OKR theo quý và hệ thống cảnh báo.',
        durationHours: 3,
        deliverable: 'Bảng OKR quý + playbook retro'
      }
    ]
  },
  {
    mentorEmail: 'mentor.hoang@grownet.vn',
    title: 'Xây dựng pipeline MLOps dự báo nhu cầu giao vận',
    subtitle: 'Triển khai ML pipeline end-to-end trên GCP Vertex AI',
    description:
      'Khóa học 6 tuần dành cho kỹ sư muốn triển khai pipeline MLOps hoàn chỉnh. Mentees làm việc với dataset đơn hàng thật của hệ thống beDelivery để xây feature store, huấn luyện model XGBoost và triển khai CI/CD.',
    category: 'Data Science',
    level: 'intermediate',
    format: 'hybrid',
    language: 'vi',
    durationHours: 30,
    sessions: 6,
    price: 5600000,
    coverImage: 'https://images.grownet.vn/courses/mlops-demand.jpg',
    tags: ['mlops', 'vertex ai', 'forecasting'],
    tools: ['Vertex AI', 'BigQuery', 'dbt', 'MLflow'],
    startDate: '2025-02-10',
    endDate: '2025-03-28',
    modules: [
      {
        title: 'Thiết kế kiến trúc MLOps thực dụng',
        content: 'So sánh vertex pipelines với Kubeflow, chọn kiến trúc phù hợp cho đội 5 người.',
        durationHours: 4,
        deliverable: 'Architecture diagram + chi phí vận hành'
      },
      {
        title: 'Xây feature store và pipeline training',
        content: 'Sử dụng BigQuery + Vertex Feature Store để quản lý version dữ liệu và tracking.',
        durationHours: 5,
        deliverable: 'Feature store schema + training pipeline'
      },
      {
        title: 'Triển khai CI/CD & giám sát drift',
        content: 'Tích hợp Cloud Build, GitHub Actions và cài cảnh báo drift.',
        durationHours: 4,
        deliverable: 'CI/CD pipeline + dashboard drift'
      }
    ]
  }
];

const certificates: SeedCertificate[] = [
  {
    credentialId: 'GR-2025-PLGMAI01',
    mentorEmail: 'mentor.lan@grownet.vn',
    menteeEmail: 'mai.mkt@grownet.vn',
    courseTitle: 'Chiến lược Product-Led Growth cho SaaS Việt',
    summary: 'Hoàn thành 22 bài tập thực chiến, xây dựng North Star Metric và triển khai 3 thí nghiệm activation cho beCRM.',
    skills: ['Product Strategy', 'Experiment Design', 'Activation Analytics'],
    badgeUrl: 'https://badges.grownet.vn/plg-mentor-lan.svg',
    issuedAt: '2025-03-02',
    evidenceUrl: 'https://drive.grownet.vn/cases/plg-mai-report.pdf'
  },
  {
    credentialId: 'GR-2025-MLOPSHUNG',
    mentorEmail: 'mentor.hoang@grownet.vn',
    menteeEmail: 'hung.ds@grownet.vn',
    courseTitle: 'Xây dựng pipeline MLOps dự báo nhu cầu giao vận',
    summary: 'Thiết kế hoàn chỉnh pipeline dự báo nhu cầu cho 18 thành phố, deploy Vertex AI pipelines và thiết lập cảnh báo drift.',
    skills: ['MLOps', 'Vertex AI', 'Forecasting'],
    issuedAt: '2025-04-04'
  }
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 120) || `course-${Date.now()}`;

async function ensureUser(user: SeedUser, hashedPassword: string) {
  const existing = await User.findOne({ email: user.email });
  if (existing) {
    existing.fullName = user.fullName;
    existing.bio = user.bio;
    existing.role = user.role;
    existing.interests = user.interests;
    existing.fields = user.fields;
    existing.skills = user.skills;
    existing.experienceYears = user.experienceYears;
    existing.location = user.location;
    await existing.save();
    return existing;
  }

  return User.create({
    username: user.username,
    email: user.email,
    password: hashedPassword,
    fullName: user.fullName,
    bio: user.bio,
    role: user.role,
    interests: user.interests,
    fields: user.fields,
    skills: user.skills,
    experienceYears: user.experienceYears,
    location: user.location
  });
}

async function ensureCourse(course: SeedCourse, mentorId: mongoose.Types.ObjectId) {
  const existing = await Course.findOne({ mentorId, title: course.title });
  if (existing) {
    existing.subtitle = course.subtitle;
    existing.description = course.description;
    existing.category = course.category;
    existing.level = course.level;
    existing.format = course.format;
    existing.language = course.language;
    existing.durationHours = course.durationHours;
    existing.sessions = course.sessions;
    existing.price = course.price;
    existing.coverImage = course.coverImage;
    existing.tags = course.tags;
    existing.tools = course.tools;
    existing.startDate = new Date(course.startDate);
    existing.endDate = new Date(course.endDate);
    existing.modules = course.modules;
    await existing.save();
    return existing;
  }

  const baseSlug = slugify(course.title);
  let slug = baseSlug;
  let counter = 1;
  while (await Course.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return Course.create({
    mentorId,
    slug,
    ...course,
    startDate: new Date(course.startDate),
    endDate: new Date(course.endDate)
  });
}

async function ensureCertificate(entry: SeedCertificate, mentorId: mongoose.Types.ObjectId, menteeId: mongoose.Types.ObjectId, courseId: mongoose.Types.ObjectId) {
  const existing = await Certificate.findOne({ credentialId: entry.credentialId });
  if (existing) {
    existing.summary = entry.summary;
    existing.skills = entry.skills;
    existing.badgeUrl = entry.badgeUrl;
    existing.evidenceUrl = entry.evidenceUrl;
    existing.issuedAt = new Date(entry.issuedAt);
    existing.mentorId = mentorId;
    existing.menteeId = menteeId;
    existing.courseId = courseId;
    await existing.save();
    return existing;
  }

  return Certificate.create({
    credentialId: entry.credentialId,
    mentorId,
    menteeId,
    courseId,
    summary: entry.summary,
    skills: entry.skills,
    badgeUrl: entry.badgeUrl,
    evidenceUrl: entry.evidenceUrl,
    issuedAt: new Date(entry.issuedAt)
  });
}

async function seed() {
  await connectDB();

  const hashedPassword = await bcrypt.hash('GrowNet@2025', 10);

  const mentorDocs = new Map<string, mongoose.Document>();
  for (const mentor of mentors) {
    const doc = await ensureUser(mentor, hashedPassword);
    mentorDocs.set(mentor.email, doc);
  }

  const menteeDocs = new Map<string, mongoose.Document>();
  for (const mentee of mentees) {
    const doc = await ensureUser(mentee, hashedPassword);
    menteeDocs.set(mentee.email, doc);
  }

  const courseDocs = new Map<string, mongoose.Document>();
  for (const course of courses) {
    const mentor = mentorDocs.get(course.mentorEmail);
    if (!mentor) {
      throw new Error(`Không tìm thấy mentor với email ${course.mentorEmail}`);
    }
    const doc = await ensureCourse(course, mentor._id as mongoose.Types.ObjectId);
    courseDocs.set(`${course.mentorEmail}:${course.title}`, doc);
  }

  for (const certificate of certificates) {
    const mentor = mentorDocs.get(certificate.mentorEmail);
    const mentee = menteeDocs.get(certificate.menteeEmail);
    const course = courseDocs.get(`${certificate.mentorEmail}:${certificate.courseTitle}`);
    if (!mentor || !mentee || !course) {
      throw new Error('Thiếu dữ liệu liên kết để cấp chứng chỉ');
    }
    await ensureCertificate(
      certificate,
      mentor._id as mongoose.Types.ObjectId,
      mentee._id as mongoose.Types.ObjectId,
      course._id as mongoose.Types.ObjectId
    );
  }

  console.log('✅ Đã seed mentor, khóa học và chứng chỉ thực tế cho GrowNet');
  await mongoose.connection.close();
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed thất bại:', error);
    mongoose.connection.close().finally(() => process.exit(1));
  });
