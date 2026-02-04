import client from '../client';
import { ApiResponse, PageResponse } from '../types';

export interface PostCreateRequest {
  boardId: number;
  title: string;
  content: string;
  noticeYn?: string;
}

export interface PostUpdateRequest {
  title: string;
  content: string;
  noticeYn?: string;
}

export interface PostResponse {
  id: number;
  boardId: number;
  boardName: string;
  title: string;
  content: string;
  viewCount: number;
  noticeYn: string;
  useYn: string;
  regDt: string;
  modDt: string;
  regNo: string;
}

export interface PostSearchParams {
  boardId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export const postApi = {
  createPost: async (data: PostCreateRequest): Promise<ApiResponse<PostResponse>> => {
    const response = await client.post('/posts', data);
    return response.data;
  },

  getAllPosts: async (page: number = 0, size: number = 20): Promise<ApiResponse<PageResponse<PostResponse>>> => {
    const response = await client.get('/posts', {
      params: { page, size }
    });
    return response.data;
  },

  getPostsByBoard: async (boardId: number, page: number = 0, size: number = 20): Promise<ApiResponse<PageResponse<PostResponse>>> => {
    const response = await client.get(`/posts/board/${boardId}`, {
      params: { page, size }
    });
    return response.data;
  },

  searchPosts: async (params: PostSearchParams): Promise<ApiResponse<PageResponse<PostResponse>>> => {
    const response = await client.get('/posts/search', { params });
    return response.data;
  },

  getPostById: async (id: number): Promise<ApiResponse<PostResponse>> => {
    const response = await client.get(`/posts/${id}`);
    return response.data;
  },

  updatePost: async (id: number, data: PostUpdateRequest): Promise<ApiResponse<PostResponse>> => {
    const response = await client.put(`/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.delete(`/posts/${id}`);
    return response.data;
  }
};
