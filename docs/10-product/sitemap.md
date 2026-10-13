# 사이트맵 (현재 코드 기준)

> 출처: `apps/frontend/src/App.tsx` 라우트, 권한은 `apps/frontend/src/shared/constants/permissions.ts`. 2026-10-12. 라우트를 바꾸면 이 표도 같은 브랜치에서 고친다. **화면별 동작·API·체크포인트의 정본은 [기능 가이드](../30-dev/guides/features/README.md)**이고, 이 표는 URL 색인이다.

## 사용자 (`/user`, 레이아웃 `UserLayout`)

| URL | 화면 | 접근 | 코드 |
|---|---|---|---|
| `/` | → `/user` 리다이렉트 | 모두 | `App.tsx` |
| `/user` | 홈(히어로·서비스 3종·견적 CTA) | 모두 | `user/pages/HomePage.tsx` |
| `/user/notice`, `/user/notice/{id}` | 공지사항 목록·상세 페이지 | 모두 | `PostListPage` (`notice`), `PostDetailPage` |
| `/user/faq` | 자주묻는질문(아코디언) | 모두 | `PostListPage` (`faq`, `variant=accordion`) |
| `/user/free` | 자유게시판(글·댓글) — **메뉴 꺼 둠**(V4 `use_yn=N`, 홈페이지 메뉴 화면에서 켤 수 있음), URL 직접 접속만 | 조회 모두 / 작성 로그인 | `FreeBoardPage`, `CommentSection` |
| `/user/interior/onsite`, `/user/interior/onsite/{id}` | 현장시공 갤러리·상세 페이지 | 모두 | `InteriorGalleryPage`, `InteriorDetailPage` (`ONSITE`) |
| `/user/interior/self-tip`, `…/{id}` | 셀프시공 갤러리·상세 | 모두 | `InteriorGalleryPage`, `InteriorDetailPage` (`SELF_TIP`) |
| `/user/interior/story`, `…/{id}` | 인테리어스토리 갤러리·상세 | 모두 | `InteriorGalleryPage`, `InteriorDetailPage` (`STORY`) |
| `/user/inquiry` | 견적문의 작성 | 모두 | `InquiryPage` |
| `/user/page/:contentKey` | 관리자 편집 고정 페이지 | 모두 | `ContentPage` |
| `/user/signup`, `/user/signup/email` | 회원가입(이메일 인증) — **버튼 숨김**(`FEATURES.signup`), URL 직접 접속만 | 비로그인 | `UserSignup`, `EmailSignup` |
| `/user/login` | 회원 로그인 — **버튼 숨김**(`FEATURES.memberLogin`, 2026-10-13), URL 직접 접속만 | 비로그인 | `UserLogin` |
| `/user/oauth/callback/{kakao,naver,google}` | 소셜 로그인 콜백 | — | `OAuthCallback` |
| `/user/mypage` | 내 정보 조회·탈퇴 (수정 기능 없음) | 로그인 | `MyPage` |

홈 진입 시 활성 팝업 레이어(`PopupLayer`)가 뜬다.

## 관리자 (`/admin`, 레이아웃 `AdminLayout`, 인증 `adminAuthStore`)

| URL | 화면 | 권한(프론트 가드) | 코드 |
|---|---|---|---|
| `/admin/login` | 관리자 로그인 | 비로그인 | `admin/pages/auth/Login` |
| `/login`, `/signup` | → `/admin/login`, `/user/signup` 리다이렉트 | | |
| `/admin` | 대시보드 | `MENU_DASHBOARD` (가드 밖, 로그인만) | `admin/pages/Dashboard` |
| `/admin/posts/{notice,faq}` | 공지사항·자주묻는질문 관리 | `MENU_POST` | `PostManagement/` |
| `/admin/posts/free` | 자유게시판 관리 | `MENU_POST` | `PostManagement/` |
| `/admin/posts/qna` | 견적문의 관리 | `MENU_POST` | `InquiryManagement/` |
| `/admin/interiors/{onsite,self-tip,story}` | 시공사례 관리 | `MENU_INTERIOR` | `InteriorManagement/` |
| `/admin/popups` | 팝업 관리 | `MENU_POPUP` | `PopupManagement/` |
| `/admin/site-menus` | 홈페이지 메뉴(켜기/끄기·순서) | `MENU_SITE_MENU` | `SiteMenuManagement/` |
| `/admin/users` | 회원 관리(차단 포함) | `MENU_USER` | `UserManagement/` |
| `/admin/contents` | 컨텐츠(고정 페이지) 관리 — 시스템 메뉴 | `MENU_CONTENT` | `ContentManagement/` |
| `/admin/system/menus` | 메뉴 관리 | `MENU_SYSTEM_MENU` | `MenuManagement/` |
| `/admin/system/boards` | 게시판 설정 | `MENU_SYSTEM_BOARD` | `BoardManagement` |
| `/admin/system/roles` | 권한 관리 | `MENU_SYSTEM_ROLE` | `RoleManagement/` |
| `/admin/system/admins` | 관리자 계정 | `MENU_SYSTEM_ADMIN` | `AdminMemberManagement/` |
| 그 외 `/admin/**` | → `/admin` 리다이렉트 | | `App.tsx` catch-all |

사이드메뉴 트리(V3·V4, DB `tb_menus`): 대시보드 · 시공사례(현장시공/셀프시공 팁/인테리어스토리) · 공지사항 · 자주묻는질문 · 견적문의 · 팝업 관리 · 홈페이지 메뉴 · [커뮤니티·회원: 자유게시판·회원 관리] · [시스템 관리: 컨텐츠·메뉴·게시판 설정·권한·관리자 계정 — SYSTEM_ADMIN만]. 홈페이지 상단 메뉴는 DB 사용자 메뉴(`GET /api/v1/public/menus`).

권한 코드 ↔ 라우트 매핑의 정본은 `apps/frontend/src/shared/constants/permissions.ts`(`menuPermissionMap`). 위 표의 권한 열이 그 파일과 다르면 파일이 맞다 — 표를 고친다.

위 "권한(프론트 가드)"은 메뉴 노출·라우트 가드이고, **서버는 별도로 역할을 강제**한다(2026-10-12): `/api/v1/admin/**`는 관리자 3역할 토큰이 없으면 401/403이므로 `/admin/posts/free`처럼 프론트 매핑이 빠진 화면도 비관리자는 데이터를 못 본다. 규칙 전문은 [ADR-0003](../30-dev/adr/0003-auth-jwt.md).

## 의도적 미구현

- 통계·IP 관리·공통코드·관리자 프로필 플레이스홀더와 `/admin/signup`은 7단계(2026-10-12)에서 삭제했다. 방문자 통계가 필요하면 별도 기획.
