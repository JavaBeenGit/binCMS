import client from '../client';
import { ApiResponse } from '../types';

// ── 댓글 타입 ──
export interface CommentResponse {
  id: number;
  postId: number;
  parentId: number | null;
  authorName: string;
  content: string;
  regDt: string;
  modDt: string;
  replies: CommentResponse[] | null;
}

export interface CommentCreateRequest {
  postId: number;
  parentId?: number | null;
  authorName: string;
  password: string;
  content: string;
}

export interface CommentUpdateRequest {
  password: string;
  content: string;
}

export interface CommentDeleteRequest {
  password: string;
}

// ── Public 댓글 API (인증 불필요) ──
export const publicCommentApi = {
  /** 게시글의 댓글 목록 조회 */
  getByPostId: async (postId: number): Promise<ApiResponse<CommentResponse[]>> => {
    const response = await client.get(`/public/comments/post/${postId}`);
    return response.data;
  },

  /** 게시글의 댓글 수 조회 */
  getCount: async (postId: number): Promise<ApiResponse<number>> => {
    const response = await client.get(`/public/comments/post/${postId}/count`);
    return response.data;
  },

  /** 댓글 작성 */
  create: async (data: CommentCreateRequest): Promise<ApiResponse<CommentResponse>> => {
    const response = await client.post('/public/comments', data);
    return response.data;
  },

  /** 댓글 수정 */
  update: async (id: number, data: CommentUpdateRequest): Promise<ApiResponse<CommentResponse>> => {
    const response = await client.put(`/public/comments/${id}`, data);
    return response.data;
  },

  /** 댓글 삭제 */
  delete: async (id: number, data: CommentDeleteRequest): Promise<ApiResponse<void>> => {
    const response = await client.delete(`/public/comments/${id}`, { data });
    return response.data;
  },
};

// ── 관리자 댓글 API ──
export const commentApi = {
  /** 게시글의 댓글 목록 조회 */
  getByPostId: async (postId: number): Promise<ApiResponse<CommentResponse[]>> => {
    const response = await client.get(`/comments/post/${postId}`);
    return response.data;
  },

  /** 관리자 댓글 삭제 */
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.delete(`/comments/${id}`);
    return response.data;
  },
};
