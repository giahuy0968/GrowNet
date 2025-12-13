import { Request, Response, NextFunction } from 'express';
import svgCaptcha from 'svg-captcha';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { LoginProvider, UserRole } from '../models/User';
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
      captcha,
      role
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

    const normalizeRole = (value?: string): UserRole => {
      if (value === 'mentor' || value === 'mentee') {
        return value;
      }
      return 'mentee';
    };

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
      gender,
      role: normalizeRole(role)
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
          experienceYears: user.experienceYears,
          role: user.role
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
    const { email, password, provider, providerAccountId } = req.body as {
      email: string;
      password: string;
      provider?: LoginProvider;
      providerAccountId?: string;
    };

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.accountStatus !== 'active') {
      throw new AppError('Tài khoản đang bị hạn chế. Vui lòng liên hệ admin.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const loginProvider: LoginProvider = provider || 'password';
    const now = new Date();
    user.lastActive = now;
    user.lastLoginAt = now;
    user.lastLoginProvider = loginProvider;

    if (!Array.isArray(user.oauthProviders)) {
      user.oauthProviders = [];
    }

    const providerIdentifier = providerAccountId || (loginProvider === 'password' ? user.email : undefined);
    const existingProvider = user.oauthProviders.find((entry) => {
      if (entry.provider !== loginProvider) return false;
      if (!providerIdentifier) return true;
      return entry.accountId === providerIdentifier;
    });

    if (existingProvider) {
      existingProvider.lastLoginAt = now;
      if (providerIdentifier) {
        existingProvider.accountId = providerIdentifier;
      }
    } else {
      user.oauthProviders.push({
        provider: loginProvider,
        accountId: providerIdentifier,
        lastLoginAt: now
      });
    }

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
        location: user.location,
        role: user.role,
        accountStatus: user.accountStatus,
        profileStatus: user.profileStatus,
        moderationNotes: user.moderationNotes,
        lastLoginProvider: user.lastLoginProvider,
        lastLoginAt: user.lastLoginAt,
        oauthProviders: user.oauthProviders,
        isSpamSuspected: user.isSpamSuspected
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

    sendSuccess(res, user, { message: 'Current user fetched successfully' });
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
      fields,
      skills,
      experienceYears,
      location,
      age,
      gender,
      avatar,
      role
    } = req.body;

    let nextRole: UserRole | undefined;
    if (role) {
      if (role === 'mentor' || role === 'mentee' || role === 'admin') {
        nextRole = role;
      } else {
        throw new AppError('Role không hợp lệ', 400);
      }
    }

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (typeof fullName !== 'undefined') updatePayload.fullName = fullName;
    const moderatedFieldsUpdated =
      typeof bio !== 'undefined' ||
      typeof avatar !== 'undefined' ||
      typeof skills !== 'undefined' ||
      typeof fields !== 'undefined';

    if (typeof bio !== 'undefined') updatePayload.bio = bio;
    if (typeof interests !== 'undefined') updatePayload.interests = interests;
    if (typeof fields !== 'undefined') updatePayload.fields = fields;
    if (typeof skills !== 'undefined') updatePayload.skills = skills;
    if (typeof experienceYears !== 'undefined') updatePayload.experienceYears = experienceYears;
    if (typeof location !== 'undefined') updatePayload.location = location;
    if (typeof age !== 'undefined') updatePayload.age = age;
    if (typeof gender !== 'undefined') updatePayload.gender = gender;
    if (typeof avatar !== 'undefined') updatePayload.avatar = avatar;
    if (nextRole) updatePayload.role = nextRole;
    if (moderatedFieldsUpdated) {
      updatePayload.profileStatus = 'pending';
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updatePayload,
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
