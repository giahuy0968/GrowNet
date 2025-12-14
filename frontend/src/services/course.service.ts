import apiService, { ApiResponse } from './api.service';

export interface CourseModule {
  title: string;
  content: string;
  durationHours?: number;
  deliverable?: string;
}

export interface Course {
  _id: string;
  mentorId: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  title: string;
  subtitle?: string;
  description: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  format?: 'online' | 'hybrid' | 'onsite';
  language?: string;
  durationHours?: number;
  sessions?: number;
  price?: number;
  coverImage?: string;
  tags?: string[];
  tools?: string[];
  startDate?: string;
  endDate?: string;
  modules: CourseModule[];
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoursePayload {
  title: string;
  subtitle?: string;
  description: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  format?: 'online' | 'hybrid' | 'onsite';
  language?: string;
  durationHours?: number;
  sessions?: number;
  price?: number;
  coverImage?: string;
  tags?: string[];
  tools?: string[];
  startDate?: string;
  endDate?: string;
  modules: CourseModule[];
}

export interface CourseListMeta {
  count: number;
}

export interface CourseQuery {
  category?: string;
  level?: string;
  mentorId?: string;
}

class CourseService {
  async create(payload: CreateCoursePayload): Promise<Course> {
    const response = await apiService.post<ApiResponse<Course>>('/courses', payload);
    return response.data;
  }

  async list(params?: CourseQuery): Promise<{ courses: Course[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.level) query.set('level', params.level);
    if (params?.mentorId) query.set('mentorId', params.mentorId);

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const response = await apiService.get<ApiResponse<Course[], CourseListMeta>>(`/courses${suffix}`);

    return {
      courses: response.data,
      count: response.meta?.count ?? response.data.length
    };
  }

  async listMine(): Promise<Course[]> {
    const response = await apiService.get<ApiResponse<Course[], CourseListMeta>>('/courses/mentor/me');
    return response.data;
  }

  async getById(id: string): Promise<Course> {
    const response = await apiService.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  }
}

export default new CourseService();
