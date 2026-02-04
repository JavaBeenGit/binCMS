import React, { useState } from 'react';
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
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { MenuProps } from 'antd';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

/**
 * Admin 레이아웃
 */
const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  // 로그아웃
  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // 사이드바 메뉴 아이템
  const menuItems: MenuProps['items'] = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '대시보드',
      onClick: () => navigate('/admin'),
    },
    {
      key: '/admin/posts',
      icon: <FileTextOutlined />,
      label: '게시글 관리',
      onClick: () => navigate('/admin/posts'),
    },
    {
      key: '/admin/statistics',
      icon: <BarChartOutlined />,
      label: '통계 관리',
      onClick: () => navigate('/admin/statistics'),
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: '사용자 관리',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '시스템 관리',
      children: [
        {
          key: '/admin/system/menus',
          icon: <MenuOutlined />,
          label: '메뉴 관리',
          onClick: () => navigate('/admin/system/menus'),
        },
        {
          key: '/admin/system/admins',
          icon: <TeamOutlined />,
          label: '관리자 회원 관리',
          onClick: () => navigate('/admin/system/admins'),
        },
        {
          key: '/admin/system/ips',
          icon: <GlobalOutlined />,
          label: 'IP 관리',
          onClick: () => navigate('/admin/system/ips'),
        },
        {
          key: '/admin/system/codes',
          icon: <CodeOutlined />,
          label: '공통코드 관리',
          onClick: () => navigate('/admin/system/codes'),
        },
        {
          key: '/admin/system/boards',
          icon: <AppstoreOutlined />,
          label: '게시판 설정',
          onClick: () => navigate('/admin/system/boards'),
        },
      ]
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: '설정',
      onClick: () => navigate('/admin/settings'),
    },
  ];

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
