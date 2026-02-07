import client from '../client';
import { ApiResponse, PageResponse } from '../types';
import { PostResponse } from './post';
import { InteriorResponse } from './interior';
import { PopupResponse } from './popup';

/**
 * 사용자 화면용 Public API (인증 불필요)
 */

// ── 게시글 Public API ──
export const publicPostApi = {
  /** 게시판 코드로 게시글 목록 조회 */
  getByBoardCode: async (
    boardCode: string,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PageResponse<PostResponse>>> => {
    const response = await client.get(`/public/posts/board/${boardCode}`, {
      params: { page, size },
    });
    return response.data;
  },

  /** 게시글 상세 조회 */
  getById: async (id: number): Promise<ApiResponse<PostResponse>> => {
    const response = await client.get(`/public/posts/${id}`);
    return response.data;
  },
};

// ── 인테리어 Public API ──
export const publicInteriorApi = {
  /** 카테고리별 인테리어 목록 조회 */
  getByCategory: async (
    category: string,
    page: number = 0,
    size: number = 12
  ): Promise<ApiResponse<PageResponse<InteriorResponse>>> => {
    const response = await client.get(`/public/interiors/category/${category}`, {
      params: { page, size },
    });
    return response.data;
  },

  /** 인테리어 상세 조회 */
  getById: async (id: number): Promise<ApiResponse<InteriorResponse>> => {
    const response = await client.get(`/public/interiors/${id}`);
    return response.data;
  },
};

// ── 견적문의 Public API ──
export interface InquiryCreateRequest {
  name: string;
  phone: string;
  email?: string;
  type: string;
  budget?: string;
  address?: string;
  content: string;
}

export interface InquiryResponse {
  id: number;
  name: string;
  phone: string;
  email: string;
  inquiryType: string;
  budget: string;
  address: string;
  content: string;
  status: string;
  adminMemo: string;
  regDt: string;
  modDt: string;
}

export const publicInquiryApi = {
  /** 견적문의 등록 */
  create: async (data: InquiryCreateRequest): Promise<ApiResponse<InquiryResponse>> => {
    const response = await client.post('/public/inquiries', data);
    return response.data;
  },
};

// ── 팝업 Public API ──
export const publicPopupApi = {
  /** 현재 활성 팝업 목록 조회 */
  getActive: async (): Promise<ApiResponse<PopupResponse[]>> => {
    const response = await client.get('/public/popups/active');
    return response.data;
  },
};
