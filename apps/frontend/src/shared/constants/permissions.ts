/**
 * 메뉴 URL → 필요 권한코드 매핑
 * AdminLayout(메뉴 필터링) + PermissionGuard(라우트 보호) 공용
 */
export const menuPermissionMap: Record<string, string> = {
  '/admin': 'MENU_DASHBOARD',
  '/admin/posts/notice': 'MENU_POST',
  '/admin/posts/faq': 'MENU_POST',
  '/admin/posts/free': 'MENU_POST',
  '/admin/posts/qna': 'MENU_POST',
  '/admin/users': 'MENU_USER',
  '/admin/system/menus': 'MENU_SYSTEM_MENU',
  '/admin/system/admins': 'MENU_SYSTEM_ADMIN',
  '/admin/system/boards': 'MENU_SYSTEM_BOARD',
  '/admin/system/roles': 'MENU_SYSTEM_ROLE',
  '/admin/contents': 'MENU_CONTENT',
  '/admin/popups': 'MENU_POPUP',
  '/admin/site-menus': 'MENU_SITE_MENU',
  '/admin/interiors/onsite': 'MENU_INTERIOR',
  '/admin/interiors/self-tip': 'MENU_INTERIOR',
  '/admin/interiors/story': 'MENU_INTERIOR',
};

/**
 * 사용자가 해당 경로에 접근할 권한이 있는지 확인
 * @param pathname - 현재 URL 경로
 * @param permissions - 사용자 보유 권한 목록
 * @returns 접근 가능 여부
 */
export const hasPermission = (pathname: string, permissions: string[]): boolean => {
  const requiredPerm = menuPermissionMap[pathname];
  if (!requiredPerm) return true; // 매핑에 없는 경로는 허용
  return permissions.includes(requiredPerm);
};
