import apiService, { ApiResponse } from './api.service';
import { User } from './auth.service';

export type AdminRole = 'mentor' | 'mentee' | 'admin' | 'moderator';
export type AdminAccountStatus = 'active' | 'locked' | 'suspended';
export type AdminProfileStatus = 'pending' | 'approved' | 'rejected';
export type AdminLoginProvider = 'password' | 'google' | 'linkedin';

export interface AdminUser extends User {
  role: AdminRole;
  accountStatus: AdminAccountStatus;
  profileStatus: AdminProfileStatus;
  moderationNotes?: string;
  lastLoginProvider?: AdminLoginProvider;
  lastLoginAt?: string;
  oauthProviders?: Array<{
    provider: AdminLoginProvider;
    lastLoginAt: string;
    accountId?: string;
  }>;
  isSpamSuspected?: boolean;
}

export interface AdminUserFilters {
  q?: string;
  role?: AdminRole;
  accountStatus?: AdminAccountStatus;
  profileStatus?: AdminProfileStatus;
  provider?: AdminLoginProvider;
  flagged?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminUserListMeta {
  total: number;
  page: number;
  pages: number;
  providerStats?: Record<string, number>;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  meta: AdminUserListMeta;
}

class AdminService {
  async listUsers(filters: AdminUserFilters = {}): Promise<AdminUserListResponse> {
    const params = new URLSearchParams();

    if (filters.q) params.set('q', filters.q);
    if (filters.role) params.set('role', filters.role);
    if (filters.accountStatus) params.set('status', filters.accountStatus);
    if (filters.profileStatus) params.set('profileStatus', filters.profileStatus);
    if (filters.provider) params.set('provider', filters.provider);
    if (typeof filters.flagged !== 'undefined') params.set('flagged', String(filters.flagged));
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const query = params.toString();
    const response = await apiService.get<ApiResponse<AdminUser[], AdminUserListMeta>>(
      `/admin/users${query ? `?${query}` : ''}`
    );

    return {
      users: response.data,
      meta: response.meta || { total: response.data.length, page: 1, pages: 1 }
    };
  }

  async updateUserRole(userId: string, role: AdminRole): Promise<AdminUser> {
    const response = await apiService.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/role`, { role });
    return response.data;
  }

  async updateAccountStatus(userId: string, accountStatus: AdminAccountStatus, reason?: string): Promise<AdminUser> {
    const response = await apiService.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/status`, {
      accountStatus,
      reason
    });
    return response.data;
  }

  async updateProfileReview(
    userId: string,
    payload: { profileStatus?: AdminProfileStatus; moderationNotes?: string; flagged?: boolean }
  ): Promise<AdminUser> {
    const response = await apiService.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/profile-review`, payload);
    return response.data;
  }

  async resetUserPassword(userId: string): Promise<string> {
    const response = await apiService.post<ApiResponse<{ tempPassword: string }>>(
      `/admin/users/${userId}/reset-password`
    );
    return response.data.tempPassword;
  }

  async deleteUser(userId: string): Promise<void> {
    await apiService.delete<ApiResponse<null>>(`/admin/users/${userId}`);
  }
}

export default new AdminService();
