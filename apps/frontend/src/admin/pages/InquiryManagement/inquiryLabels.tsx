import React from 'react';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';

// 상태 관련 매핑
export const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: '대기', color: 'orange', icon: <ClockCircleOutlined /> },
  IN_PROGRESS: { label: '처리중', color: 'processing', icon: <SyncOutlined spin /> },
  COMPLETED: { label: '완료', color: 'success', icon: <CheckCircleOutlined /> },
  CANCELLED: { label: '취소', color: 'default', icon: <CloseCircleOutlined /> },
};

// 시공유형 매핑 (사용자 화면과 동일)
export const TYPE_MAP: Record<string, string> = {
  apartment: '아파트',
  villa: '빌라',
  office: '사무실',
  store: '상가',
  other: '기타',
};

// 예산 매핑 (사용자 화면과 동일)
export const BUDGET_MAP: Record<string, string> = {
  under1000: '1,000만원 이하',
  '1000-3000': '1,000 ~ 3,000만원',
  '3000-5000': '3,000 ~ 5,000만원',
  over5000: '5,000만원 이상',
  consult: '상담 후 결정',
};
