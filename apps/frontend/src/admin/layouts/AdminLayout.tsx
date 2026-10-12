import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space, Drawer } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  UserSwitchOutlined,
  LayoutOutlined,
  NotificationOutlined,
  PictureOutlined,
  SoundOutlined,
  FormOutlined,
  BarsOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuthStore } from '@/shared/stores/adminAuthStore';
import { menuApi, MenuType, MenuResponse } from '@/shared/api/endpoints/menu';
import { hasPermission } from '@/shared/constants/permissions';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import type { MenuProps } from 'antd';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

// 아이콘 이름(tb_menus.icon) → 컴포넌트. 시드가 쓰는 이름만 둔다.
const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  UserOutlined: <UserOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  SettingOutlined: <SettingOutlined />,
  MenuOutlined: <MenuOutlined />,
  TeamOutlined: <TeamOutlined />,
  QuestionCircleOutlined: <QuestionCircleOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  UserSwitchOutlined: <UserSwitchOutlined />,
  LayoutOutlined: <LayoutOutlined />,
  NotificationOutlined: <NotificationOutlined />,
  PictureOutlined: <PictureOutlined />,
  SoundOutlined: <SoundOutlined />,
  FormOutlined: <FormOutlined />,
  BarsOutlined: <BarsOutlined />,
};

const getIcon = (iconName?: string): React.ReactNode => {
  if (!iconName) return <QuestionCircleOutlined />;
  return iconMap[iconName] || <QuestionCircleOutlined />;
};

const EMPTY_PERMISSIONS: string[] = [];

/**
 * 관리자 레이아웃 — 사이드메뉴는 DB 메뉴(ADMIN)를 보유 권한으로 걸러 그린다.
 * 992px 미만(휴대폰·세로 태블릿)에서는 사이드바 대신 왼쪽 서랍(Drawer)으로 연다 — 형이 휴대폰으로도 쓴다.
 */
const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 991px)');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAdminAuthStore();

  // 브라우저 탭 제목 — 홈페이지 제목과 구분한다
  useEffect(() => {
    document.title = '수디자인 관리자';
  }, []);

  // 화면 이동 시 모바일 서랍 닫기
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const { data: menusData } = useQuery({
    queryKey: ['menus', MenuType.ADMIN, false],
    queryFn: async () => {
      const response = await menuApi.getMenusByType(MenuType.ADMIN, false);
      return response.data;
    },
  });

  const userPermissions = user?.permissions ?? EMPTY_PERMISSIONS;

  // URL 없는 그룹 메뉴는 자식으로 판단한다.
  const hasMenuPermission = useCallback(
    (menuUrl?: string): boolean => !menuUrl || hasPermission(menuUrl, userPermissions),
    [userPermissions],
  );

  // MenuResponse 트리 → antd Menu items (권한 필터링)
  const convertToMenuItems = useCallback(
    (menus: MenuResponse[]): MenuProps['items'] =>
      menus
        .map((menu) => {
          const key = menu.menuUrl || `menu-${menu.id}`;
          if (menu.children && menu.children.length > 0) {
            const children = menu.children.filter((c) => hasMenuPermission(c.menuUrl));
            if (children.length === 0) return null;
            return { key, icon: getIcon(menu.icon), label: menu.menuName, children: convertToMenuItems(children) };
          }
          if (!hasMenuPermission(menu.menuUrl)) return null;
          return {
            key,
            icon: getIcon(menu.icon),
            label: menu.menuName,
            onClick: () => {
              if (menu.menuUrl) navigate(menu.menuUrl);
            },
          };
        })
        .filter(Boolean) as MenuProps['items'],
    [hasMenuPermission, navigate],
  );

  const menuItems: MenuProps['items'] = useMemo(
    () => (menusData && menusData.length > 0 ? convertToMenuItems(menusData) : []),
    [menusData, convertToMenuItems],
  );

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // 현재 경로가 속한 그룹 메뉴를 자동으로 펼친다.
  const openKeys = useMemo(() => {
    if (!menusData) return [];
    const keys: string[] = [];
    const findParent = (menus: MenuResponse[]) => {
      for (const menu of menus) {
        if (menu.children && menu.children.length > 0) {
          if (menu.children.some((child) => child.menuUrl === location.pathname)) {
            keys.push(menu.menuUrl || `menu-${menu.id}`);
          }
          findParent(menu.children);
        }
      }
    };
    findParent(menusData);
    return keys;
  }, [menusData, location.pathname]);

  const sideMenu = (
    <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} defaultOpenKeys={openKeys} items={menuItems} />
  );

  return (
    <Layout className="admin-layout">
      {isMobile ? (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          width={240}
          closable={false}
          className="admin-drawer"
          styles={{ body: { padding: 0, background: '#001529' } }}
        >
          <div className="logo">수디자인 관리자</div>
          {sideMenu}
        </Drawer>
      ) : (
        <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
          <div className="logo">{collapsed ? '수' : '수디자인 관리자'}</div>
          {sideMenu}
        </Sider>
      )}
      <Layout>
        <Header className="admin-header">
          <Button
            type="text"
            aria-label="메뉴 열기"
            icon={isMobile ? <MenuOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => (isMobile ? setMobileOpen(true) : setCollapsed(!collapsed))}
            className="trigger"
          />
          <Space className="user-info">
            <span>{user?.name}님</span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
            </Dropdown>
          </Space>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
