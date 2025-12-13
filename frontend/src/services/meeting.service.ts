import apiService, { ApiResponse } from './api.service';

export interface Meeting {
  _id: string;
  chatId: string;
  organizerId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees: { userId?: string; email: string }[];
  videoLink?: string;
  provider: 'google_meet' | 'zoom' | 'custom';
  calendarEventId: string;
  calendarId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingListResult {
  meetings: Meeting[];
  count: number;
}

export interface ScheduleMeetingPayload {
  chatId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: { userId?: string; email?: string }[];
  location?: string;
  provider?: 'google_meet' | 'zoom' | 'custom';
}

export interface UserMeetingQuery {
  start?: string;
  end?: string;
}

class MeetingService {
  async listByChat(chatId: string): Promise<MeetingListResult> {
    const response = await apiService.get<ApiResponse<Meeting[], { count: number }>>(`/meetings/chat/${chatId}`);
    return {
      meetings: response.data,
      count: response.meta?.count ?? response.data.length
    };
  }

  async listMine(params?: UserMeetingQuery): Promise<MeetingListResult> {
    const query = new URLSearchParams();
    if (params?.start) {
      query.set('start', params.start);
    }
    if (params?.end) {
      query.set('end', params.end);
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const response = await apiService.get<ApiResponse<Meeting[], { count: number }>>(`/meetings/me${suffix}`);
    return {
      meetings: response.data,
      count: response.meta?.count ?? response.data.length
    };
  }

  async schedule(payload: ScheduleMeetingPayload): Promise<Meeting> {
    const response = await apiService.post<ApiResponse<Meeting>>('/meetings', payload);
    return response.data;
  }

  async createInstant(chatId: string, durationMinutes = 45): Promise<Meeting> {
    const response = await apiService.post<ApiResponse<Meeting>>('/meetings/instant', {
      chatId,
      durationMinutes
    });
    return response.data;
  }

  async cancel(meetingId: string): Promise<string> {
    const response = await apiService.delete<ApiResponse<null>>(`/meetings/${meetingId}`);
    return response.message || 'Meeting cancelled';
  }
}

export default new MeetingService();
