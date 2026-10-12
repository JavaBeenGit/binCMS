import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import koKR from 'antd/locale/ko_KR';
import UserLayout from '@/user/layouts/UserLayout';
import HomePage from '@/user/pages/HomePage';
import PostListPage from '@/user/pages/PostListPage';
import InteriorGalleryPage from '@/user/pages/InteriorGalleryPage';
import InquiryPage from '@/user/pages/InquiryPage';
import UserLogin from '@/user/pages/UserLogin';
import UserSignup from '@/user/pages/UserSignup';
import EmailSignup from '@/user/pages/EmailSignup';
import OAuthCallback from '@/user/pages/OAuthCallback';
import MyPage from '@/user/pages/MyPage';
import ContentPage from '@/user/pages/ContentPage';
import { useAdminAuthStore } from '@/shared/stores/adminAuthStore';
import PermissionGuard from '@/shared/components/PermissionGuard';

// 관리자 화면과 CKEditor 를 쓰는 화면은 지연 로딩 — 사용자 첫 화면 번들에서 분리한다 (6단계).
const FreeBoardPage = lazy(() => import('@/user/pages/FreeBoardPage'));
const Login = lazy(() => import('@/admin/pages/auth/Login'));
const AdminLayout = lazy(() => import('@/admin/layouts/AdminLayout'));
const Dashboard = lazy(() => import('@/admin/pages/Dashboard'));
const BoardManagement = lazy(() => import('@/admin/pages/BoardManagement'));
const PostManagement = lazy(() => import('@/admin/pages/PostManagement'));
const MenuManagement = lazy(() => import('@/admin/pages/MenuManagement'));
const AdminMemberManagement = lazy(() => import('@/admin/pages/AdminMemberManagement'));
const RoleManagement = lazy(() => import('@/admin/pages/RoleManagement'));
const ContentManagement = lazy(() => import('@/admin/pages/ContentManagement'));
const PopupManagement = lazy(() => import('@/admin/pages/PopupManagement'));
const InteriorManagement = lazy(() => import('@/admin/pages/InteriorManagement'));
const InquiryManagement = lazy(() => import('@/admin/pages/InquiryManagement'));
const UserManagement = lazy(() => import('@/admin/pages/UserManagement'));

const PageLoading: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
    <Spin size="large" />
  </div>
);

const galleryProps = {
  onsite: { category: 'ONSITE' as const, title: '현장시공', subtitle: '전문 시공팀의 현장 시공 사례를 확인해 보세요' },
  'self-tip': { category: 'SELF_TIP' as const, title: '셀프시공', subtitle: '누구나 따라할 수 있는 셀프 인테리어 팁' },
  story: { category: 'STORY' as const, title: '인테리어스토리', subtitle: '감각적인 인테리어 이야기를 들려드립니다' },
};

function App() {
  const isAdminAuthenticated = useAdminAuthStore((state) => state.isAuthenticated());

  return (
    <ConfigProvider locale={koKR}>
      <BrowserRouter>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* 관리자 로그인 (관리자 계정은 시스템 관리 > 관리자 계정에서만 만든다) */}
            <Route path="/admin/login" element={<Login />} />

            {/* 기존 /login 리디렉트 */}
            <Route path="/login" element={<Navigate to="/admin/login" replace />} />
            <Route path="/signup" element={<Navigate to="/user/signup" replace />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                isAdminAuthenticated ? (
                  <AdminLayout />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            >
              {/* 대시보드 - 권한 체크 없이 기본 페이지 */}
              <Route index element={<Dashboard />} />

              {/* 권한 체크가 필요한 라우트 */}
              <Route element={<PermissionGuard />}>
                <Route path="posts/notice" element={<PostManagement boardCode="notice" />} />
                <Route path="posts/faq" element={<PostManagement boardCode="faq" />} />
                <Route path="posts/free" element={<PostManagement boardCode="free" />} />
                <Route path="posts/qna" element={<InquiryManagement />} />
                <Route path="users" element={<UserManagement />} />

                {/* 시스템 관리 */}
                <Route path="system/menus" element={<MenuManagement />} />
                <Route path="system/admins" element={<AdminMemberManagement />} />
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
            <Route path="/" element={<Navigate to="/user" replace />} />

            {/* User Routes */}
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<HomePage />} />
              <Route path="notice" element={<PostListPage boardCode="notice" title="공지사항" subtitle="BIN INTERIOR의 소식을 전해드립니다" />} />
              <Route path="free" element={<FreeBoardPage boardCode="free" title="자유게시판" subtitle="자유롭게 소통하는 공간입니다" />} />
              <Route path="faq" element={<PostListPage boardCode="faq" title="자주묻는질문" subtitle="궁금한 점을 확인해 보세요" />} />
              <Route path="inquiry" element={<InquiryPage />} />
              <Route path="login" element={<UserLogin />} />
              <Route path="signup" element={<UserSignup />} />
              <Route path="signup/email" element={<EmailSignup />} />
              <Route path="oauth/callback/kakao" element={<OAuthCallback provider="kakao" />} />
              <Route path="oauth/callback/naver" element={<OAuthCallback provider="naver" />} />
              <Route path="oauth/callback/google" element={<OAuthCallback provider="google" />} />
              <Route path="mypage" element={<MyPage />} />
              {/* 갤러리 목록 + 상세 딥링크(/user/interior/{slug}/{id}) */}
              {Object.entries(galleryProps).map(([slug, props]) => (
                <React.Fragment key={slug}>
                  <Route path={`interior/${slug}`} element={<InteriorGalleryPage {...props} />} />
                  <Route path={`interior/${slug}/:id`} element={<InteriorGalleryPage {...props} />} />
                </React.Fragment>
              ))}
              <Route path="page/:contentKey" element={<ContentPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
