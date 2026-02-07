/**
 * 메뉴 URL → 필요 권한코드 매핑
 * AdminLayout(메뉴 필터링) + PermissionGuard(라우트 보호) 공용
 */
export const menuPermissionMap: Record<string, string> = {
  '/admin': 'MENU_DASHBOARD',
  '/admin/posts': 'MENU_POST',
  '/admin/statistics': 'MENU_STATISTICS',
  '/admin/users': 'MENU_USER',
  '/admin/system/menus': 'MENU_SYSTEM_MENU',
  '/admin/system/admins': 'MENU_SYSTEM_ADMIN',
  '/admin/system/ips': 'MENU_SYSTEM_IP',
  '/admin/system/codes': 'MENU_SYSTEM_CODE',
  '/admin/system/boards': 'MENU_SYSTEM_BOARD',
  '/admin/system/roles': 'MENU_SYSTEM_ROLE',
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
