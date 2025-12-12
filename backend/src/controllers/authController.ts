import { Request, Response, NextFunction } from 'express';
import svgCaptcha from 'svg-captcha';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

/* ===================== CAPTCHA ===================== */
export const getCaptcha = (req: Request, res: Response): void => {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 2,
    ignoreChars: '0oO1ilI',
    color: false,
    background: '#f6f7fb'
  });

  if (req.session) {
    req.session.captcha = captcha.text;
  }

  res.type('image/svg+xml');
  res.send(captcha.data);
};

/* ===================== REGISTER ===================== */
export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      interests,
      location,
      age,
      gender,
      fields,
      skills,
      experienceYears,
      captcha
    } = req.body;

    // Validate captcha
    if (
      !req.session?.captcha ||
      (captcha || '').trim() !== req.session.captcha
    ) {
      throw new AppError('CAPTCHA không hợp lệ', 400);
    }
    delete req.session.captcha;

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new AppError('Username or email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      interests: interests || [],
      fields: fields || [],
      skills: skills || [],
      experienceYears,
      location,
      age,
      gender
    });

    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT_SECRET is not defined', 500);
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendSuccess(
      res,
      {
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          interests: user.interests,
          fields: user.fields,
          skills: user.skills,
          experienceYears: user.experienceYears
        }
      },
      {
        status: 201,
        message: 'User registered successfully'
      }
    );
  } catch (err) {
    next(err);
  }
};

/* ===================== LOGIN ===================== */
export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    user.lastActive = new Date();
    await user.save();

    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT_SECRET is not defined', 500);
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendSuccess(res, {
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: user.bio,
        interests: user.interests,
        fields: user.fields,
        skills: user.skills,
        experienceYears: user.experienceYears,
        location: user.location
      }
    }, { message: 'Login successful' });
  } catch (err) {
    next(err);
  }
};

/* ===================== GET CURRENT USER ===================== */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

/* ===================== UPDATE PROFILE ===================== */
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      fullName,
      bio,
      interests,
      location,
      age,
      gender,
      avatar,
      fields,
      skills,
      experienceYears
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        fullName,
        bio,
        interests,
        fields,
        skills,
        experienceYears,
        location,
        age,
        gender,
        avatar,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendSuccess(res, user, { message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

/* ===================== CHANGE PASSWORD ===================== */
export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    sendSuccess(res, null, { message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};
