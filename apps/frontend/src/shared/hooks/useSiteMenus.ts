import { useQuery } from '@tanstack/react-query';
import { menuApi, type MenuResponse } from '@/shared/api/endpoints/menu';

/** 홈페이지 상단 메뉴 한 항목 — DB 사용자 메뉴(MenuResponse)와 기본 메뉴가 같은 모양을 쓴다 */
export interface SiteMenu {
  id: number;
  menuName: string;
  menuUrl?: string;
  children?: SiteMenu[];
}

/**
 * API 가 실패하거나 비어 있을 때 쓰는 기본 메뉴 — 메뉴 장애가 홈페이지를 못 죽이게.
 * DB 시드(V2·V4)와 같은 구성. 자유게시판은 2026-10-13부터 숨김이라 여기에도 없다.
 */
export const FALLBACK_SITE_MENUS: SiteMenu[] = [
  { id: -1, menuName: 'HOME', menuUrl: '/user' },
  { id: -2, menuName: '공지사항', menuUrl: '/user/notice' },
  {
    id: -3,
    menuName: '인테리어',
    children: [
      { id: -31, menuName: '현장시공', menuUrl: '/user/interior/onsite' },
      { id: -32, menuName: '셀프시공', menuUrl: '/user/interior/self-tip' },
      { id: -33, menuName: '인테리어스토리', menuUrl: '/user/interior/story' },
    ],
  },
  { id: -4, menuName: '자주묻는질문', menuUrl: '/user/faq' },
  { id: -5, menuName: '견적문의', menuUrl: '/user/inquiry' },
];

const toSiteMenu = (m: MenuResponse): SiteMenu => ({
  id: m.id,
  menuName: m.menuName,
  menuUrl: m.menuUrl || undefined,
  children: m.children && m.children.length > 0 ? m.children.map(toSiteMenu) : undefined,
});

/**
 * 홈페이지 상단 메뉴 — `GET /api/v1/public/menus`(켜진 사용자 메뉴 트리)를 5분 캐시로 읽는다.
 * 관리자 "홈페이지 메뉴" 화면이 바꾸면 `['site-menus']` 를 무효화해 바로 반영된다.
 */
export function useSiteMenus() {
  const { data, isError } = useQuery({
    queryKey: ['site-menus'],
    queryFn: async () => (await menuApi.getPublicMenus()).data,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const fromApi = data && data.length > 0 ? data.map(toSiteMenu) : null;
  return { menus: fromApi ?? FALLBACK_SITE_MENUS, isFallback: fromApi === null, isError };
}
