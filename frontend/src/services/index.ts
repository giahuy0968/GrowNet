// Export all services
export { default as authService } from './auth.service';
export { default as postService } from './post.service';
export { default as userService } from './user.service';
export { default as chatService } from './chat.service';
export { default as connectionService } from './connection.service';
export { default as notificationService } from './notification.service';
export { default as meetingService } from './meeting.service';
export { default as courseService } from './course.service';
export { default as certificateService } from './certificate.service';
export { default as adminService } from './admin.service';

// Export types
export type { User, RegisterData, LoginData, AuthResponse } from './auth.service';
export type { Post, Comment, CreatePostData, PaginationMeta, PostListResult, UserPostsResult } from './post.service';
export type { UserStats } from './user.service';
export type { Chat, Message, SendMessageData, ChatListResult, MessageListResult } from './chat.service';
export type { Connection, FriendsResult, PendingRequestsResult } from './connection.service';
export type { Notification, NotificationListResult } from './notification.service';
export type { Meeting, MeetingListResult, ScheduleMeetingPayload, UserMeetingQuery } from './meeting.service';
export type { Course, CourseModule, CreateCoursePayload, CourseQuery } from './course.service';
export type { Certificate, IssueCertificatePayload } from './certificate.service';
export type {
	AdminUser,
	AdminRole,
	AdminAccountStatus,
	AdminProfileStatus,
	AdminLoginProvider,
	AdminUserFilters
} from './admin.service';
