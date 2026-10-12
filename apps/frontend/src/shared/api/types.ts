export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * 백엔드 com.bincms.common.dto.PageResponse 와 같은 모양. (Spring Page 원형이 아니다 — pageable/number 없음)
 * page 는 0부터.
 */
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
