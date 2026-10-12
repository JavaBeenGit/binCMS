import dayjs from 'dayjs';
import type { PopupResponse } from '@/shared/api/endpoints/popup';

/**
 * 노출 상태 판단 — 목록의 "노출상태" 열과 상세 모달이 같이 쓴다.
 * 미사용 → 미사용, 시작 전 → 대기, 종료 후 → 종료, 그 외 → 노출중
 */
export function getExposureStatus(record: PopupResponse): { color: string; text: string } {
  if (record.useYn !== 'Y') return { color: 'default', text: '미사용' };
  const now = dayjs();
  if (record.startDt && now.isBefore(dayjs(record.startDt))) return { color: 'orange', text: '대기' };
  if (record.endDt && now.isAfter(dayjs(record.endDt))) return { color: 'red', text: '종료' };
  return { color: 'green', text: '노출중' };
}
