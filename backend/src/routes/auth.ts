import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { env } from '../config/env';

const router = Router();

// ĐĂNG KÝ
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Name, email, password and role are required',
      });
    }

    if (role !== 'mentor' && role !== 'mentee') {
      return res.status(400).json({
        error: 'Role must be "mentor" or "mentee"',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({ email, role, passwordHash });
    await user.save();

    const profile = new Profile({
      userId: user._id,
      name,
    });
    await profile.save();

    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      env.jwtSecret,
      { expiresIn: '7d' },
    );

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile: {
        name: profile.name,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    const message =
      err instanceof Error ? err.message : 'Unknown error in /api/auth/register';
    res.status(500).json({ error: 'Registration failed', details: message });
  }
});

// ĐĂNG NHẬP
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email }).select('+passwordHash role createdAt');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const profile = await Profile.findOne({ userId: user._id }).select(
      'name headline location',
    );

    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      env.jwtSecret,
      { expiresIn: '7d' },
    );

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile: profile
        ? {
            name: profile.name,
            headline: profile.headline,
            location: profile.location,
          }
        : null,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
