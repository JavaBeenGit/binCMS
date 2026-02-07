import client from '../client';
import { ApiResponse } from '../types';

export interface FileResponse {
  id: number;
  originalName: string;
  storedName: string;
  filePath: string;
  thumbnailPath: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileSize: number;
  contentType: string;
  fileExt: string;
  refType: string | null;
  refId: number | null;
  useYn: string;
  regDt: string;
}

export const fileApi = {
  /**
   * 파일 업로드
   */
  upload: async (
    file: File,
    refType?: string,
    refId?: number
  ): Promise<ApiResponse<FileResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (refType) formData.append('refType', refType);
    if (refId) formData.append('refId', String(refId));

    const response = await client.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * 파일 정보 조회
   */
  getById: async (id: number): Promise<ApiResponse<FileResponse>> => {
    const response = await client.get(`/files/${id}`);
    return response.data;
  },

  /**
   * 참조 기준 파일 목록
   */
  getByRef: async (refType: string, refId: number): Promise<ApiResponse<FileResponse[]>> => {
    const response = await client.get('/files/ref', {
      params: { refType, refId },
    });
    return response.data;
  },

  /**
   * 파일 삭제
   */
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.delete(`/files/${id}`);
    return response.data;
  },
};
