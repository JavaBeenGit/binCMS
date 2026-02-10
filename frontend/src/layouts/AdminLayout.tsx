import React, { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  BarChartOutlined,
  MenuOutlined,
  TeamOutlined,
  GlobalOutlined,
  CodeOutlined,
  AppstoreOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  UserSwitchOutlined,
  LayoutOutlined,
  NotificationOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import { menuApi, MenuType, MenuResponse } from '../api/endpoints/menu';
import { hasPermission } from '../shared/constants/permissions';
import type { MenuProps } from 'antd';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

// 아이콘 이름 → 컴포넌트 매핑
const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  UserOutlined: <UserOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  SettingOutlined: <SettingOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  MenuOutlined: <MenuOutlined />,
  TeamOutlined: <TeamOutlined />,
  GlobalOutlined: <GlobalOutlined />,
  CodeOutlined: <CodeOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  LogoutOutlined: <LogoutOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  UserSwitchOutlined: <UserSwitchOutlined />,
  LayoutOutlined: <LayoutOutlined />,
  NotificationOutlined: <NotificationOutlined />,
  PictureOutlined: <PictureOutlined />,
};

const getIcon = (iconName?: string): React.ReactNode => {
  if (!iconName) return <QuestionCircleOutlined />;
  return iconMap[iconName] || <QuestionCircleOutlined />;
};

/**
 * Admin 레이아웃
 */
const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAdminAuthStore();

  // DB에서 관리자 메뉴 조회
  const { data: menusData } = useQuery({
    queryKey: ['menus', MenuType.ADMIN, false],
    queryFn: async () => {
      const response = await menuApi.getMenusByType(MenuType.ADMIN, false);
      return response.data;
    },
  });

  const userPermissions = user?.permissions || [];

  // 사용자가 해당 메뉴에 접근 권한이 있는지 체크 (공용 모듈 활용)
  const hasMenuPermission = (menuUrl?: string): boolean => {
    if (!menuUrl) return true; // 부모 메뉴(URL 없음)는 자식으로 판단
    return hasPermission(menuUrl, userPermissions);
  };

  // MenuResponse 트리 → Antd Menu items 변환 (권한 기반 필터링)
  const convertToMenuItems = (menus: MenuResponse[]): MenuProps['items'] => {
    return menus
      .filter((menu) => {
        // 자식이 있는 부모 메뉴: 접근 가능한 자식이 하나라도 있으면 표시
        if (menu.children && menu.children.length > 0) {
          return menu.children.some(c => hasMenuPermission(c.menuUrl));
        }
        // 단일 메뉴: 권한 체크
        return hasMenuPermission(menu.menuUrl);
      })
      .map((menu) => {
        const hasChildren = menu.children && menu.children.length > 0;

        if (hasChildren) {
          const filteredChildren = menu.children!.filter((child) => {
            return hasMenuPermission(child.menuUrl);
          });
          if (filteredChildren.length === 0) return null;
          return {
            key: menu.menuUrl || `menu-${menu.id}`,
            icon: getIcon(menu.icon),
            label: menu.menuName,
            children: convertToMenuItems(filteredChildren),
          };
        }

        return {
          key: menu.menuUrl || `menu-${menu.id}`,
          icon: getIcon(menu.icon),
          label: menu.menuName,
          onClick: () => {
            if (menu.menuUrl) navigate(menu.menuUrl);
          },
        };
      })
      .filter(Boolean);
  };

  // DB 메뉴 데이터를 사이드바 아이템으로 변환
  const menuItems: MenuProps['items'] = useMemo(() => {
    if (menusData && menusData.length > 0) {
      return convertToMenuItems(menusData);
    }
    // DB 메뉴 로딩 전 기본 폴백
    return [];
  }, [menusData, user]);

  // 로그아웃
  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  // 사용자 드롭다운 메뉴
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '내 정보',
      onClick: () => navigate('/admin/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // 현재 경로에 해당하는 부모 메뉴의 key를 찾아 자동 열기
  const openKeys = useMemo(() => {
    if (!menusData) return [];
    const keys: string[] = [];
    const findParent = (menus: MenuResponse[]) => {
      for (const menu of menus) {
        if (menu.children && menu.children.length > 0) {
          const childMatch = menu.children.some(
            (child) => child.menuUrl === location.pathname
          );
          if (childMatch) {
            keys.push(menu.menuUrl || `menu-${menu.id}`);
          }
          findParent(menu.children);
        }
      }
    };
    findParent(menusData);
    return keys;
  }, [menusData, location.pathname]);

  return (
    <Layout className="admin-layout">
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div className="logo">
          {collapsed ? 'CMS' : 'binCMS'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={openKeys}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
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
