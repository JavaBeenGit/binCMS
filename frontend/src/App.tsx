import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import BoardManagement from './pages/admin/BoardManagement';
import PostManagement from './pages/admin/PostManagement';
import { useAuthStore } from './stores/authStore';

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
            <Route index element={<Dashboard />} />
            <Route path="members" element={<div>회원 관리 (개발 예정)</div>} />
            <Route path="boards" element={<BoardManagement />} />
            <Route path="posts" element={<PostManagement />} />
            <Route path="settings" element={<div>설정 (개발 예정)</div>} />
            <Route path="profile" element={<div>내 정보 (개발 예정)</div>} />
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
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
