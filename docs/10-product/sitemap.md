# 사이트맵 (현재 코드 기준)

> 출처: `frontend/src/App.tsx` 라우트, 권한은 `frontend/src/shared/constants/permissions.ts`. 2026-10-12. 라우트를 바꾸면 이 표도 같은 브랜치에서 고친다(5단계에서 `features/` 가이드로 승격).

## 사용자 (`/user`, 레이아웃 `UserLayout`)

| URL | 화면 | 접근 | 코드 |
|---|---|---|---|
| `/` | → `/user` 리다이렉트 | 모두 | `App.tsx` |
| `/user` | 홈(히어로·서비스 3종·견적 CTA) | 모두 | `user/pages/HomePage.tsx` |
| `/user/notice` | 공지사항 목록 | 모두 | `PostListPage` (`boardCode=notice`) |
| `/user/faq` | 자주묻는질문 | 모두 | `PostListPage` (`faq`) |
| `/user/free` | 자유게시판(글·댓글) | 조회 모두 / 작성 로그인 | `FreeBoardPage`, `CommentSection` |
| `/user/interior/onsite` | 현장시공 갤러리 | 모두 | `InteriorGalleryPage` (`ONSITE`) |
| `/user/interior/self-tip` | 셀프시공 갤러리 | 모두 | `InteriorGalleryPage` (`SELF_TIP`) |
| `/user/interior/story` | 인테리어스토리 갤러리 | 모두 | `InteriorGalleryPage` (`STORY`) |
| `/user/inquiry` | 견적문의 작성 | 모두 | `InquiryPage` |
| `/user/page/:contentKey` | 관리자 편집 고정 페이지 | 모두 | `ContentPage` |
| `/user/login` | 회원 로그인(이메일·카카오·네이버·구글) | 비로그인 | `UserLogin` |
| `/user/signup`, `/user/signup/email` | 회원가입(이메일 인증) | 비로그인 | `UserSignup`, `EmailSignup` |
| `/user/oauth/callback/{kakao,naver,google}` | 소셜 로그인 콜백 | — | `OAuthCallback` |
| `/user/mypage` | 내 정보 수정·탈퇴 | 로그인 | `MyPage` |

홈 진입 시 활성 팝업 레이어(`PopupLayer`)가 뜬다.

## 관리자 (`/admin`, 레이아웃 `AdminLayout`, 인증 `adminAuthStore`)

| URL | 화면 | 권한(프론트 가드) | 코드 |
|---|---|---|---|
| `/admin/login`, `/admin/signup` | 관리자 로그인·가입 | 비로그인 | `pages/auth/Login`, `Signup` |
| `/login`, `/signup` | → `/admin/...` 리다이렉트 | | |
| `/admin` | 대시보드 | `MENU_DASHBOARD` (가드 밖, 로그인만) | `pages/admin/Dashboard` |
| `/admin/posts`, `/admin/posts/{notice,faq,free}` | 게시글 관리 | `MENU_POST` | `PostManagement` |
| `/admin/posts/qna` | 견적문의 관리 | `MENU_POST` | `InquiryManagement` |
| `/admin/contents` | 콘텐츠(고정 페이지) 관리 | `MENU_CONTENT` | `ContentManagement` |
| `/admin/popups` | 팝업 관리 | `MENU_POPUP` | `PopupManagement` |
| `/admin/interiors/{onsite,self-tip,story}` | 인테리어 관리 | `MENU_INTERIOR` | `InteriorManagement` |
| `/admin/users` | 회원 관리(차단 포함) | `MENU_USER` | `UserManagement` |
| `/admin/system/menus` | 메뉴 관리 | `MENU_SYSTEM_MENU` | `MenuManagement` |
| `/admin/system/admins` | 관리자 회원 관리 | `MENU_SYSTEM_ADMIN` | `AdminMemberManagement` |
| `/admin/system/boards` | 게시판 설정 | `MENU_SYSTEM_BOARD` | `BoardManagement` |
| `/admin/system/roles` | 권한 관리 | `MENU_SYSTEM_ROLE` | `RoleManagement` |
| `/admin/profile` | "개발 예정" 플레이스홀더 | 로그인 | `App.tsx` 인라인 |
| `/admin/statistics`, `/admin/system/ips`, `/admin/system/codes` | "개발 예정" 플레이스홀더 | `MENU_STATISTICS`, `MENU_SYSTEM_IP`, `MENU_SYSTEM_CODE` | `App.tsx` 인라인 |

권한 코드 ↔ 라우트 매핑의 정본은 `frontend/src/shared/constants/permissions.ts`(`menuPermissionMap`). 위 표의 권한 열이 그 파일과 다르면 파일이 맞다 — 표를 고친다.

## 의도적 미구현

- 통계·IP 관리·공통코드·관리자 프로필: 라우트만 있고 "개발 예정" 텍스트. 운영에 필요하면 기획 후 구현, 아니면 메뉴에서 제거(7단계에서 결정).
