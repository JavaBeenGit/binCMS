import React from 'react';

interface ListSummaryProps {
  total: number;
  /** 0부터 시작하는 현재 페이지 */
  page: number;
  pageSize: number;
}

/**
 * 테이블 위 "총 N건 (p/P 페이지)" 한 줄.
 */
const ListSummary: React.FC<ListSummaryProps> = ({ total, page, pageSize }) => (
  <div style={{ marginBottom: 8, color: '#666', fontSize: 14 }}>
    총 {total}건 ({page + 1}/{Math.max(1, Math.ceil(total / pageSize))} 페이지)
  </div>
);

export default ListSummary;
