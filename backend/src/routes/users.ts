import { Router, Response } from 'express';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { auth, mentorOnly, menteeOnly, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Helper: join Users + Profiles theo userId
 */
async function getUsersWithProfilesByRole(role: 'mentor' | 'mentee') {
  const users = await User.find({ role }).select('_id email role createdAt');
  const userIds = users.map((u) => u._id);

  const profiles = await Profile.find({ userId: { $in: userIds } }).select(
    'userId name headline location',
  );

  const profileMap = new Map(
    profiles.map((p) => [p.userId.toString(), p]),
  );

  return users.map((u) => {
    const p = profileMap.get(u._id.toString());
    return {
      _id: u._id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      name: p?.name ?? null,
      headline: p?.headline ?? null,
      location: p?.location ?? null,
    };
  });
}

/**
 * GET /api/users/mentors
 * - Chỉ MENTEE được gọi
 * - Trả danh sách mentor (user + profile)
 */
router.get(
  '/mentors',
  auth,
  menteeOnly,
  async (_req: AuthRequest, res: Response) => {
    try {
      const mentors = await getUsersWithProfilesByRole('mentor');
      res.json(mentors);
    } catch (err) {
      console.error('Error fetching mentors:', err);
      res.status(500).json({ error: 'Failed to fetch mentors' });
    }
  },
);

/**
 * GET /api/users/mentees
 * - Chỉ MENTOR được gọi
 * - Trả danh sách mentee (user + profile)
 */
router.get(
  '/mentees',
  auth,
  mentorOnly,
  async (_req: AuthRequest, res: Response) => {
    try {
      const mentees = await getUsersWithProfilesByRole('mentee');
      res.json(mentees);
    } catch (err) {
      console.error('Error fetching mentees:', err);
      res.status(500).json({ error: 'Failed to fetch mentees' });
    }
  },
);

/**
 * GET /api/users
 * - Yêu cầu đăng nhập, trả tất cả user (không profile) – cho debug/admin
 */
router.get('/', auth, async (_req: AuthRequest, res: Response) => {
  try {
    const list = await User.find().select('email role createdAt');
    res.json(list);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
