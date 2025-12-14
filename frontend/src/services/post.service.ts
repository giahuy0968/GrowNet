import apiService, { ApiResponse } from './api.service';
import { User } from './auth.service';

export interface Comment {
  _id: string;
  userId: User | string;
  content: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  authorId: User | string;
  content: string;
  images?: string[];
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  images?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PostListResult {
  posts: Post[];
  pagination?: PaginationMeta;
}

export interface UserPostsResult {
  posts: Post[];
  count: number;
}

class PostService {
  async createPost(data: CreatePostData): Promise<Post> {
    const response = await apiService.post<ApiResponse<Post>>('/posts', data);
    return response.data;
  }

  async getAllPosts(page: number = 1, limit: number = 20): Promise<PostListResult> {
    const response = await apiService.get<ApiResponse<Post[], { pagination: PaginationMeta }>>(
      `/posts?page=${page}&limit=${limit}`
    );

    return {
      posts: response.data,
      pagination: response.meta?.pagination
    };
  }

  async getPostById(id: string): Promise<Post> {
    const response = await apiService.get<ApiResponse<Post>>(`/posts/${id}`);
    return response.data;
  }

  async getUserPosts(userId: string): Promise<UserPostsResult> {
    const response = await apiService.get<ApiResponse<Post[], { count: number }>>(`/posts/user/${userId}`);

    return {
      posts: response.data,
      count: response.meta?.count ?? response.data.length
    };
  }

  async updatePost(id: string, data: CreatePostData): Promise<Post> {
    const response = await apiService.put<ApiResponse<Post>>(`/posts/${id}`, data);
    return response.data;
  }

  async deletePost(id: string): Promise<string> {
    const response = await apiService.delete<ApiResponse<null>>(`/posts/${id}`);
    return response.message || 'Post deleted successfully';
  }

  async toggleLike(id: string): Promise<{ likes: number; message: string }> {
    const response = await apiService.post<ApiResponse<{ likes: number }>>(`/posts/${id}/like`);
    return {
      likes: response.data.likes,
      message: response.message || ''
    };
  }

  async addComment(id: string, content: string): Promise<Post> {
    const response = await apiService.post<ApiResponse<Post>>(`/posts/${id}/comment`, { content });
    return response.data;
  }

  async deleteComment(postId: string, commentId: string): Promise<string> {
    const response = await apiService.delete<ApiResponse<null>>(`/posts/${postId}/comment/${commentId}`);
    return response.message || 'Comment deleted successfully';
  }
}

export default new PostService();
