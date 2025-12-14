import apiService, { ApiResponse } from './api.service';
import { User } from './auth.service';
import { Course } from './course.service';

export interface Certificate {
  _id: string;
  credentialId: string;
  mentorId: Pick<User, '_id' | 'fullName' | 'avatar' | 'email'>;
  menteeId: Pick<User, '_id' | 'fullName' | 'avatar' | 'email'>;
  courseId: Pick<Course, '_id' | 'title' | 'slug'>;
  summary: string;
  skills: string[];
  badgeUrl?: string;
  evidenceUrl?: string;
  issuedAt: string;
  expiresAt?: string;
  createdAt: string;
}

export interface IssueCertificatePayload {
  menteeId?: string;
  menteeEmail?: string;
  courseId: string;
  summary: string;
  skills: string[];
  badgeUrl?: string;
  evidenceUrl?: string;
  issuedAt?: string;
  expiresAt?: string;
  credentialId?: string;
}

class CertificateService {
  async issue(payload: IssueCertificatePayload): Promise<Certificate> {
    const response = await apiService.post<ApiResponse<Certificate>>('/certificates', payload);
    return response.data;
  }

  async listMine(): Promise<Certificate[]> {
    const response = await apiService.get<ApiResponse<Certificate[], { count: number }>>('/certificates/me');
    return response.data;
  }

  async listMentorCertificates(): Promise<Certificate[]> {
    const response = await apiService.get<ApiResponse<Certificate[], { count: number }>>('/certificates/mentor/me');
    return response.data;
  }

  async getById(id: string): Promise<Certificate> {
    const response = await apiService.get<ApiResponse<Certificate>>(`/certificates/${id}`);
    return response.data;
  }
}

export default new CertificateService();
