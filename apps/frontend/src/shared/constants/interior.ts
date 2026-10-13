import type { InteriorCategory } from '@/shared/api/endpoints/interior';

/** 인테리어 카테고리 ↔ URL 조각. 백엔드 sitemap.xml(SitemapController.SLUG)과 같은 규칙 */
export const INTERIOR_SLUG: Record<InteriorCategory, string> = {
  ONSITE: 'onsite',
  SELF_TIP: 'self-tip',
  STORY: 'story',
};

export const interiorListPath = (category: InteriorCategory) => `/user/interior/${INTERIOR_SLUG[category]}`;
