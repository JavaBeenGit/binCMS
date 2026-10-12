import type { InteriorCategory, InteriorResponse } from '@/shared/api/endpoints/interior';

/** 카테고리 코드 → 화면 이름 (하위 메뉴 제목·등록 폼의 카테고리 표시) */
export const CATEGORY_MAP: Record<InteriorCategory, string> = {
  ONSITE: '현장시공',
  SELF_TIP: '셀프시공 팁',
  STORY: '인테리어스토리',
};

/** 썸네일 추출: thumbnailUrl이 없으면 content에서 첫 <img src> 추출 */
export const getThumbnail = (item: InteriorResponse): string | null => {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  const match = item.content?.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : null;
};
