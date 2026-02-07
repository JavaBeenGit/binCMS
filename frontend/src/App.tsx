import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import BoardManagement from './pages/admin/BoardManagement';
import PostManagement from './pages/admin/PostManagement';
import MenuManagement from './pages/admin/MenuManagement';
import AdminMemberManagement from './pages/admin/AdminMemberManagement';
import RoleManagement from './pages/admin/RoleManagement';
import ContentManagement from './pages/admin/ContentManagement';
import ContentPage from './user/pages/ContentPage';
import { useAuthStore } from './stores/authStore';
import PermissionGuard from './shared/components/PermissionGuard';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  return (
    <ConfigProvider locale={koKR}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              isAuthenticated ? (
                <AdminLayout />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            {/* 대시보드 - 권한 체크 없이 기본 페이지 */}
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<div>내 정보 (개발 예정)</div>} />
            
            {/* 권한 체크가 필요한 라우트 */}
            <Route element={<PermissionGuard />}>
              <Route path="posts" element={<PostManagement />} />
              <Route path="statistics" element={<div>통계 관리 (개발 예정)</div>} />
              <Route path="users" element={<div>사용자 관리 (개발 예정)</div>} />
              
              {/* 시스템 관리 */}
              <Route path="system/menus" element={<MenuManagement />} />
              <Route path="system/admins" element={<AdminMemberManagement />} />
              <Route path="system/ips" element={<div>IP 관리 (개발 예정)</div>} />
              <Route path="system/codes" element={<div>공통코드 관리 (개발 예정)</div>} />
              <Route path="system/boards" element={<BoardManagement />} />
              <Route path="system/roles" element={<RoleManagement />} />
              
              {/* 컨텐츠 관리 */}
              <Route path="contents" element={<ContentManagement />} />
            </Route>
          </Route>
          
          {/* Root redirect */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* 사용자 컨텐츠 페이지 (인증 불필요) */}
          <Route path="/page/:contentKey" element={<ContentPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
