import apiService from './api.service';
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

class PostService {
  async createPost(data: CreatePostData): Promise<Post> {
    return apiService.post<Post>('/posts', data);
  }

  async getAllPosts(page: number = 1, limit: number = 20): Promise<Post[]> {
    return apiService.get<Post[]>(`/posts?page=${page}&limit=${limit}`);
  }

  async getPostById(id: string): Promise<Post> {
    return apiService.get<Post>(`/posts/${id}`);
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return apiService.get<Post[]>(`/posts/user/${userId}`);
  }

  async updatePost(id: string, data: CreatePostData): Promise<Post> {
    return apiService.put<Post>(`/posts/${id}`, data);
  }

  async deletePost(id: string): Promise<{ message: string }> {
    return apiService.delete(`/posts/${id}`);
  }

  async toggleLike(id: string): Promise<Post> {
    return apiService.post<Post>(`/posts/${id}/like`);
  }

  async addComment(id: string, content: string): Promise<Post> {
    return apiService.post<Post>(`/posts/${id}/comment`, { content });
  }

  async deleteComment(postId: string, commentId: string): Promise<Post> {
    return apiService.delete<Post>(`/posts/${postId}/comment/${commentId}`);
  }
}

export default new PostService();
