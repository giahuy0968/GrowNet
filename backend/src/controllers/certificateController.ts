import { Response } from 'express';
import mongoose from 'mongoose';
import Certificate from '../models/Certificate';
import Course from '../models/Course';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

const certificateProjection = 'credentialId summary skills badgeUrl evidenceUrl issuedAt expiresAt courseId mentorId menteeId';

const ensureMentor = async (userId?: string) => {
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const mentor = await User.findById(userId).select('role fullName email');
  if (!mentor) {
    throw new AppError('User not found', 404);
  }

  if (mentor.role !== 'mentor' && mentor.role !== 'admin') {
    throw new AppError('Chức năng này chỉ dành cho mentor', 403);
  }

  return mentor;
};

const generateCredentialId = async () => {
  const year = new Date().getFullYear();
  let attempts = 0;
  while (attempts < 5) {
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const credentialId = `GR-${year}-${suffix}`;
    const exists = await Certificate.exists({ credentialId });
    if (!exists) {
      return credentialId;
    }
    attempts += 1;
  }
  return `GR-${year}-${Date.now()}`;
};

const resolveMentee = async (menteeId?: string, menteeEmail?: string) => {
  if (!menteeId && !menteeEmail) {
    throw new AppError('Vui lòng cung cấp menteeId hoặc menteeEmail', 400);
  }

  const filter = menteeId
    ? { _id: new mongoose.Types.ObjectId(menteeId) }
    : { email: (menteeEmail || '').toLowerCase().trim() };

  const mentee = await User.findOne(filter).select('_id fullName email role');
  if (!mentee) {
    throw new AppError('Không tìm thấy mentee phù hợp', 404);
  }

  return mentee;
};

export const issueCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await ensureMentor(req.userId);
    const {
      menteeId,
      menteeEmail,
      courseId,
      summary,
      skills,
      badgeUrl,
      evidenceUrl,
      issuedAt,
      expiresAt,
      credentialId
    } = req.body;

    if (!courseId || !summary || !Array.isArray(skills) || skills.length === 0) {
      throw new AppError('Vui lòng cung cấp đầy đủ thông tin chứng chỉ', 400);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Khóa học không tồn tại', 404);
    }

    if (course.mentorId.toString() !== mentor._id.toString() && mentor.role !== 'admin') {
      throw new AppError('Bạn không thể cấp chứng chỉ cho khóa học của mentor khác', 403);
    }

    const mentee = await resolveMentee(menteeId, menteeEmail);
    const credential = credentialId || await generateCredentialId();

    const certificate = await Certificate.create({
      mentorId: mentor._id,
      menteeId: mentee._id,
      courseId: course._id,
      summary,
      skills,
      badgeUrl,
      evidenceUrl,
      issuedAt: issuedAt ? new Date(issuedAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      credentialId: credential
    });

    const populated = await Certificate.findById(certificate._id)
      .populate('mentorId', 'fullName email avatar')
      .populate('menteeId', 'fullName email avatar')
      .populate('courseId', 'title slug');

    if (!populated) {
      throw new AppError('Không thể tải chứng chỉ vừa tạo', 500);
    }

    sendSuccess(res, populated, {
      status: 201,
      message: 'Đã cấp chứng chỉ cho mentee'
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const listMentorCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await ensureMentor(req.userId);

    const certificates = await Certificate.find({ mentorId: mentor._id })
      .sort({ issuedAt: -1 })
      .populate('menteeId', 'fullName email avatar')
      .populate('courseId', 'title slug');

    sendSuccess(res, certificates, {
      meta: { count: certificates.length }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const listMenteeCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const certificates = await Certificate.find({ menteeId: req.userId })
      .sort({ issuedAt: -1 })
      .populate('mentorId', 'fullName email avatar')
      .populate('courseId', 'title slug');

    sendSuccess(res, certificates, {
      meta: { count: certificates.length }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getCertificateById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id)
      .populate('mentorId', 'fullName email avatar')
      .populate('menteeId', 'fullName email avatar')
      .populate('courseId', 'title slug');

    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    if (
      certificate.mentorId._id.toString() !== (req.userId || '') &&
      certificate.menteeId._id.toString() !== (req.userId || '')
    ) {
      throw new AppError('Bạn không có quyền xem chứng chỉ này', 403);
    }

    sendSuccess(res, certificate);
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
