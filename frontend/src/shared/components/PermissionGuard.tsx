import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { message } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { hasPermission } from '../constants/permissions';

/**
 * 권한 기반 라우트 가드
 * - 현재 URL에 필요한 권한이 없으면 "권한이 없습니다" 메시지 후 대시보드로 이동
 * - AdminLayout 내부의 <Outlet /> 대신 이 컴포넌트를 거쳐서 렌더링
 */
const PermissionGuard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const userPermissions = user?.permissions || [];
  const allowed = hasPermission(location.pathname, userPermissions);

  useEffect(() => {
    if (!allowed) {
      message.error('권한이 없습니다.');
      navigate('/admin', { replace: true });
    }
  }, [allowed, navigate, location.pathname]);

  if (!allowed) {
    return null;
  }

  return <Outlet />;
};

export default PermissionGuard;
