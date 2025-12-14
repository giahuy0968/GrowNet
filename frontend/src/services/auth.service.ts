import apiService, { ApiResponse } from './api.service';
import { setAuthToken, removeAuthToken } from '../config/api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  captcha?: string;
  role?: 'mentor' | 'mentee';
}

export interface LoginData {
  email: string;
  password: string;
}

export type UserRole = 'mentor' | 'mentee' | 'admin' | 'moderator';
export type AccountStatus = 'active' | 'locked' | 'suspended';
export type ProfileStatus = 'pending' | 'approved' | 'rejected';
export type LoginProvider = 'password' | 'google' | 'linkedin' | 'facebook';
export type SocialLoginProvider = Extract<LoginProvider, 'google' | 'linkedin' | 'facebook'>;

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  interests?: string[];
  fields?: string[];
  skills?: string[];
  jobTitle?: string;
  languages?: string[];
  availability?: string;
  location?: {
    city?: string;
    country?: string;
  };
  experienceYears?: number;
  age?: number;
  gender?: string;
  role?: UserRole;
  accountStatus?: AccountStatus;
  profileStatus?: ProfileStatus;
  moderationNotes?: string;
  lastLoginProvider?: LoginProvider;
  lastLoginAt?: string;
  oauthProviders?: Array<{
    provider: LoginProvider;
    lastLoginAt: string;
    accountId?: string;
  }>;
  isSpamSuspected?: boolean;
  createdAt: string;
  lastActive: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/login', data);
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  async getEnabledProviders(): Promise<SocialLoginProvider[]> {
    const response = await apiService.get<ApiResponse<LoginProvider[]>>('/auth/oauth/providers');
    const providers = response.data || [];
    return providers.filter((provider): provider is SocialLoginProvider => provider !== 'password');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<ApiResponse<User>>('/auth/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiService.put<ApiResponse<null>>('/auth/password', { currentPassword, newPassword });
    return { message: response.message || 'Password changed successfully' };
  }

  logout(): void {
    removeAuthToken();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();
