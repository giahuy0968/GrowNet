import bcrypt from 'bcryptjs';
import { Response } from 'express';
import User, { AccountStatus, LoginProvider, ProfileStatus, UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

const sanitizeRole = (role?: string): UserRole | undefined => {
  if (!role) return undefined;
  if (['mentor', 'mentee', 'admin', 'moderator'].includes(role)) {
    return role as UserRole;
  }
  return undefined;
};

const sanitizeAccountStatus = (status?: string): AccountStatus | undefined => {
  if (!status) return undefined;
  if (['active', 'locked', 'suspended'].includes(status)) {
    return status as AccountStatus;
  }
  return undefined;
};

const sanitizeProfileStatus = (status?: string): ProfileStatus | undefined => {
  if (!status) return undefined;
  if (['pending', 'approved', 'rejected'].includes(status)) {
    return status as ProfileStatus;
  }
  return undefined;
};

const sanitizeProvider = (provider?: string): LoginProvider | undefined => {
  if (!provider) return undefined;
  if (['password', 'google', 'linkedin'].includes(provider)) {
    return provider as LoginProvider;
  }
  return undefined;
};

export const listAdminUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      q,
      role,
      status,
      profileStatus,
      provider,
      flagged,
      page = '1',
      limit = '50'
    } = req.query as Record<string, string>;

    const filters: Record<string, unknown> = {};
    const normalizedRole = sanitizeRole(role);
    const normalizedStatus = sanitizeAccountStatus(status);
    const normalizedProfileStatus = sanitizeProfileStatus(profileStatus);
    const normalizedProvider = sanitizeProvider(provider);

    if (normalizedRole) filters.role = normalizedRole;
    if (normalizedStatus) filters.accountStatus = normalizedStatus;
    if (normalizedProfileStatus) filters.profileStatus = normalizedProfileStatus;
    if (normalizedProvider) filters.lastLoginProvider = normalizedProvider;
    if (flagged === 'true') filters.isSpamSuspected = true;

    if (q) {
      filters.$or = [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [users, total, providerStats] = await Promise.all([
      User.find(filters)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      User.countDocuments(filters),
      User.aggregate([
        { $group: { _id: '$lastLoginProvider', count: { $sum: 1 } } }
      ])
    ]);

    const normalizedStats = providerStats.reduce<Record<string, number>>((acc, curr) => {
      if (curr._id) {
        acc[curr._id as string] = curr.count;
      }
      return acc;
    }, {});

    sendSuccess(res, users, {
      meta: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        providerStats: normalizedStats
      }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role?: string };

    const normalizedRole = sanitizeRole(role);
    if (!normalizedRole) {
      throw new AppError('Vai trò không hợp lệ', 400);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: normalizedRole },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User không tồn tại', 404);
    }

    sendSuccess(res, user, { message: 'Cập nhật vai trò thành công' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateAccountStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { accountStatus, reason } = req.body as { accountStatus?: string; reason?: string };
    const normalizedStatus = sanitizeAccountStatus(accountStatus);

    if (!normalizedStatus) {
      throw new AppError('Trạng thái tài khoản không hợp lệ', 400);
    }

    const updatePayload: Record<string, unknown> = { accountStatus: normalizedStatus };
    if (reason) {
      updatePayload.moderationNotes = reason;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User không tồn tại', 404);
    }

    sendSuccess(res, user, { message: 'Cập nhật trạng thái tài khoản thành công' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateProfileModeration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      profileStatus,
      moderationNotes,
      flagged
    } = req.body as { profileStatus?: string; moderationNotes?: string; flagged?: boolean };

    const nextProfileStatus = sanitizeProfileStatus(profileStatus);
    const updatePayload: Record<string, unknown> = {};

    if (nextProfileStatus) {
      updatePayload.profileStatus = nextProfileStatus;
    }
    if (typeof moderationNotes === 'string') {
      updatePayload.moderationNotes = moderationNotes;
    }
    if (typeof flagged !== 'undefined') {
      updatePayload.isSpamSuspected = flagged;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User không tồn tại', 404);
    }

    sendSuccess(res, user, { message: 'Cập nhật kiểm duyệt hồ sơ thành công' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword, accountStatus: 'active' },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User không tồn tại', 404);
    }

    sendSuccess(res, { tempPassword }, { message: 'Đã reset mật khẩu tạm thời' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.userId === id) {
      throw new AppError('Không thể tự xóa chính mình', 400);
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw new AppError('User không tồn tại', 404);
    }

    sendSuccess(res, null, { message: 'Đã xóa user khỏi hệ thống' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
