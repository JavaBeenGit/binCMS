import type { MenuResponse } from '@/shared/api/endpoints/menu';

/** 트리 → 플랫 리스트 (상위 메뉴 선택 옵션용). children 은 그대로 둔다. */
export const flattenMenus = (menus: MenuResponse[]): MenuResponse[] => {
  const result: MenuResponse[] = [];
  const traverse = (menuList: MenuResponse[]) => {
    menuList.forEach((menu) => {
      result.push(menu);
      if (menu.children && menu.children.length > 0) {
        traverse(menu.children);
      }
    });
  };
  traverse(menus);
  return result;
};

/** 트리 → 플랫 리스트 (테이블 표시용). children 을 제거해 Ant Design Table 의 자동 트리 확장을 막는다. */
export const flattenForTable = (menus: MenuResponse[]): MenuResponse[] => {
  const result: MenuResponse[] = [];
  const traverse = (menuList: MenuResponse[]) => {
    menuList.forEach((menu) => {
      const { children, ...menuWithoutChildren } = menu;
      result.push(menuWithoutChildren as MenuResponse);
      if (children && children.length > 0) {
        traverse(children);
      }
    });
  };
  traverse(menus);
  return result;
};
