import { Response } from 'express';
import mongoose from 'mongoose';
import Course, { ICourse } from '../models/Course';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

const mentorProjection = 'fullName avatar bio fields skills role';

const toSlug = (value: string): string => {
  const transformed = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 120);

  return transformed || `course-${Date.now()}`;
};

const ensureMentor = async (userId?: string) => {
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const mentor = await User.findById(userId).select('role fullName');
  if (!mentor) {
    throw new AppError('User not found', 404);
  }

  if (mentor.role !== 'mentor' && mentor.role !== 'admin') {
    throw new AppError('Chức năng này chỉ dành cho mentor', 403);
  }

  return mentor;
};

const resolveUniqueSlug = async (title: string) => {
  const base = toSlug(title);
  let slug = base;
  let counter = 1;

  while (await Course.exists({ slug })) {
    slug = `${base}-${counter++}`;
  }

  return slug;
};

export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await ensureMentor(req.userId);
    const {
      title,
      subtitle,
      description,
      category,
      level,
      format,
      language,
      durationHours,
      sessions,
      price,
      coverImage,
      tags,
      tools,
      startDate,
      endDate,
      modules
    } = req.body;

    if (!title || !description) {
      throw new AppError('Thiếu tiêu đề hoặc mô tả khóa học', 400);
    }

    if (!Array.isArray(modules) || modules.length === 0) {
      throw new AppError('Vui lòng cung cấp ít nhất một module', 400);
    }

    const slug = await resolveUniqueSlug(title);

    const course = await Course.create({
      mentorId: new mongoose.Types.ObjectId(mentor._id),
      title,
      subtitle,
      description,
      category,
      level,
      format,
      language,
      durationHours,
      sessions,
      price,
      coverImage,
      tags,
      tools,
      startDate,
      endDate,
      modules,
      slug
    });

    const populated = await course.populate('mentorId', mentorProjection);

    sendSuccess(res, populated, {
      status: 201,
      message: 'Tạo khóa học thành công'
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const listCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, level, mentorId } = req.query as { category?: string; level?: string; mentorId?: string };
    const filter: Record<string, unknown> = {};

    if (category) {
      filter.category = new RegExp(category, 'i');
    }

    if (level) {
      filter.level = level as ICourse['level'];
    }

    if (mentorId) {
      filter.mentorId = new mongoose.Types.ObjectId(mentorId);
    }

    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .populate('mentorId', mentorProjection);

    sendSuccess(res, courses, {
      meta: { count: courses.length }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const listMentorCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await ensureMentor(req.userId);

    const courses = await Course.find({ mentorId: mentor._id })
      .sort({ createdAt: -1 })
      .populate('mentorId', mentorProjection);

    sendSuccess(res, courses, {
      meta: { count: courses.length }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getCourseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('mentorId', mentorProjection);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    sendSuccess(res, course);
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
