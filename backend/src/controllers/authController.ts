import bcrypt from 'bcryptjs';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// Register
export const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, fullName, interests, location, age, gender } = req.body;

    // Check if user exists
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
      password,
      fullName,
      interests: interests || [],
      location,
      age,
      gender
    });

    // Generate token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user._id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        interests: user.interests
      }
    });
  } catch (error: any) {
    const err = error instanceof AppError ? error : new AppError(error.message || 'Internal Server Error', error.statusCode || 500);
    return next(err);
  }
};

// Login
export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // ❌ Không bcrypt.compare — so sánh trực tiếp
    if (password !== user.password) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user._id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: user.bio,
        interests: user.interests,
        location: user.location
      }
    });
  } catch (error: any) {
    const err = error instanceof AppError ? error : new AppError(error.message || 'Internal Server Error', error.statusCode || 500);
    return next(err);
  }
};

// Get current user
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user });
  } catch (error: any) {
    const err = error instanceof AppError ? error : new AppError(error.message || 'Internal Server Error', error.statusCode || 500);
    return next(err);
  }
};

// Update profile
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, bio, interests, location, age, gender, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        fullName,
        bio,
        interests,
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

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error: any) {
    const err = error instanceof AppError ? error : new AppError(error.message || 'Internal Server Error', error.statusCode || 500);
    return next(err);
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // ❌ Không bcrypt — so sánh trực tiếp
    if (currentPassword !== user.password) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Lưu password mới dạng plaintext luôn
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    const err = error instanceof AppError ? error : new AppError(error.message || 'Internal Server Error', error.statusCode || 500);
    return next(err);
  }
};
