import { apiClient } from '../client';

export interface BoardCreateRequest {
  boardCode: string;
  boardName: string;
  description?: string;
  sortOrder?: number;
}

export interface BoardUpdateRequest {
  boardName: string;
  description?: string;
  sortOrder?: number;
}

export interface BoardResponse {
  id: number;
  boardCode: string;
  boardName: string;
  description?: string;
  useYn: string;
  sortOrder: number;
  regDt: string;
  modDt: string;
}

/**
 * 게시판 생성
 */
export const createBoard = async (data: BoardCreateRequest) => {
  const response = await apiClient.post<{
    success: boolean;
    data: BoardResponse;
    message: string;
  }>('/boards', data);
  return response.data;
};

/**
 * 전체 게시판 목록 조회
 */
export const getAllBoards = async () => {
  const response = await apiClient.get<{
    success: boolean;
    data: BoardResponse[];
  }>('/boards');
  return response.data;
};

/**
 * 사용 중인 게시판 목록 조회
 */
export const getActiveBoards = async () => {
  const response = await apiClient.get<{
    success: boolean;
    data: BoardResponse[];
  }>('/boards/active');
  return response.data;
};

/**
 * 게시판 상세 조회
 */
export const getBoardById = async (id: number) => {
  const response = await apiClient.get<{
    success: boolean;
    data: BoardResponse;
  }>(`/boards/${id}`);
  return response.data;
};

/**
 * 게시판 수정
 */
export const updateBoard = async (id: number, data: BoardUpdateRequest) => {
  const response = await apiClient.put<{
    success: boolean;
    data: BoardResponse;
    message: string;
  }>(`/boards/${id}`, data);
  return response.data;
};

/**
 * 게시판 삭제 (비활성화)
 */
export const deleteBoard = async (id: number) => {
  const response = await apiClient.delete<{
    success: boolean;
    message: string;
  }>(`/boards/${id}`);
  return response.data;
};

/**
 * 게시판 활성화
 */
export const activateBoard = async (id: number) => {
  const response = await apiClient.patch<{
    success: boolean;
    message: string;
  }>(`/boards/${id}/activate`);
  return response.data;
};
