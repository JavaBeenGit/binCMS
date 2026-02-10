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
import PopupManagement from './pages/admin/PopupManagement';
import InteriorManagement from './pages/admin/InteriorManagement';
import InquiryManagement from './pages/admin/InquiryManagement';
import ContentPage from './user/pages/ContentPage';
import UserLayout from './user/layouts/UserLayout';
import HomePage from './user/pages/HomePage';
import PostListPage from './user/pages/PostListPage';
import FreeBoardPage from './user/pages/FreeBoardPage';
import InteriorGalleryPage from './user/pages/InteriorGalleryPage';
import InquiryPage from './user/pages/InquiryPage';
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
              <Route path="posts/notice" element={<PostManagement boardCode="notice" />} />
              <Route path="posts/faq" element={<PostManagement boardCode="faq" />} />
              <Route path="posts/free" element={<PostManagement boardCode="free" />} />
              <Route path="posts/qna" element={<InquiryManagement />} />
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
              
              {/* 팝업 관리 */}
              <Route path="popups" element={<PopupManagement />} />
              
              {/* 인테리어 관리 */}
              <Route path="interiors/onsite" element={<InteriorManagement category="ONSITE" />} />
              <Route path="interiors/self-tip" element={<InteriorManagement category="SELF_TIP" />} />
              <Route path="interiors/story" element={<InteriorManagement category="STORY" />} />
            </Route>
          </Route>
          
          {/* Root redirect → 사용자 홈 */}
          <Route 
            path="/" 
            element={<UserLayout />}
          >
            <Route index element={<HomePage />} />
            <Route path="notice" element={<PostListPage boardCode="notice" title="공지사항" subtitle="BIN INTERIOR의 소식을 전해드립니다" />} />
            <Route path="free" element={<FreeBoardPage boardCode="free" title="자유게시판" subtitle="자유롭게 소통하는 공간입니다" />} />
            <Route path="faq" element={<PostListPage boardCode="faq" title="자주묻는질문" subtitle="궁금한 점을 확인해 보세요" />} />
            <Route path="inquiry" element={<InquiryPage />} />
            <Route path="interior/onsite" element={<InteriorGalleryPage category="ONSITE" title="현장시공" subtitle="전문 시공팀의 현장 시공 사례를 확인해 보세요" />} />
            <Route path="interior/self-tip" element={<InteriorGalleryPage category="SELF_TIP" title="셀프시공" subtitle="누구나 따라할 수 있는 셀프 인테리어 팁" />} />
            <Route path="interior/story" element={<InteriorGalleryPage category="STORY" title="인테리어스토리" subtitle="감각적인 인테리어 이야기를 들려드립니다" />} />
          </Route>

          {/* 사용자 컨텐츠 페이지 (인증 불필요) */}
          <Route path="/page/:contentKey" element={<ContentPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
