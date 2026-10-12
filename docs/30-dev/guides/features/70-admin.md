# 70. 관리자 (`/admin/**`)

로그인·레이아웃·권한 코드는 [20-로그인-인증](20-로그인-인증.md)·[00-공통](00-공통.md). 모든 API는 `/api/v1/admin/**`(관리자 역할 필수). 화면은 `apps/frontend/src/admin/pages/<Feature>/`(index·columns·modal 로 분할, 파일당 300줄 이하 — 7단계). **운영자(형)용 사용법은 [admin-manual](../admin-manual.md)**.

## 사이드메뉴 (정본: V2+V3 시드 `tb_menus`, 보유 권한으로 필터)

| 메뉴 | URL | 화면 | 프론트 권한 | 주요 API |
|---|---|---|---|---|
| 대시보드 | `/admin` | `Dashboard.tsx` | 로그인만 | `GET /admin/dashboard/summary` → 대기 문의(빨간 배지, 클릭 시 견적문의)·시공사례·게시글·회원 수, 60초마다 갱신 |
| 시공사례 › 현장시공 · 셀프시공 팁 · 인테리어스토리 | `/admin/interiors/{onsite,self-tip,story}` | `InteriorManagement/` | `MENU_INTERIOR` | `GET/POST/PUT/DELETE /admin/interiors`, `GET /category/{c}`, `GET /search`, 대표 이미지 `POST /user/files/upload` |
| 공지사항 | `/admin/posts/notice` | `PostManagement/` | `MENU_POST` | `GET /admin/posts/board/{id}?page&size`, `GET /admin/posts/search`, `POST /admin/posts`, `PUT/DELETE /admin/posts/{id}` |
| 자주묻는질문 | `/admin/posts/faq` | `PostManagement/` | `MENU_POST` | 위와 같음 |
| 견적문의 | `/admin/posts/qna` | `InquiryManagement/` | `MENU_POST` | [50-견적문의](50-견적문의.md) |
| 팝업 관리 | `/admin/popups` | `PopupManagement/` | `MENU_POPUP` | `GET/POST/PUT/DELETE /admin/popups`, `PATCH .../activate|deactivate` |
| 커뮤니티·회원 › 자유게시판 | `/admin/posts/free` | `PostManagement/` | `MENU_POST` | 게시글 API (회원 글 삭제) |
| 커뮤니티·회원 › 회원 관리 | `/admin/users` | `UserManagement/` | `MENU_USER` | `GET /admin/users`, `PUT /{id}`, `PATCH /{id}/password|deactivate|activate` |
| 시스템 관리 › 컨텐츠 관리 | `/admin/contents` | `ContentManagement/` | `MENU_CONTENT` | `GET/POST/PUT/DELETE /admin/contents`, `PATCH .../activate|deactivate` |
| 시스템 관리 › 메뉴 관리 | `/admin/system/menus` | `MenuManagement/` | `MENU_SYSTEM_MENU` | `GET /admin/menus`, `GET /type/{ADMIN|USER}`, `POST/PUT/DELETE`, `PATCH /{id}/activate` |
| 시스템 관리 › 게시판 설정 | `/admin/system/boards` | `BoardManagement.tsx` | `MENU_SYSTEM_BOARD` | `GET/POST/PUT/DELETE /admin/boards`, `PATCH /{id}/activate` |
| 시스템 관리 › 권한 관리 | `/admin/system/roles` | `RoleManagement/` | `MENU_SYSTEM_ROLE` | `GET/POST/PUT/DELETE /admin/roles`, `GET /admin/roles/permissions` |
| 시스템 관리 › 관리자 계정 | `/admin/system/admins` | `AdminMemberManagement/` | `MENU_SYSTEM_ADMIN` | `GET/POST /admin/members`, `PUT /{id}`, `PATCH /{id}/password|deactivate|activate` |

- 역할별 노출: **모든 관리자 역할** → 대시보드~팝업 관리 6개. GENERAL_ADMIN → + 커뮤니티·회원 중 자유게시판. OPERATION_ADMIN → + 회원 관리. SYSTEM_ADMIN → + 시스템 관리 전체. 그룹 메뉴는 보이는 자식이 하나라도 있을 때만 보인다(`AdminLayout`).
- 없는 `/admin/**` 경로는 대시보드로(`App.tsx` catch-all). 통계·IP·공통코드·내 정보·`/admin/signup`은 7단계에서 삭제.
- 관리자 계정 생성은 시스템 관리 › 관리자 계정에서만. 비밀번호는 거기서 초기화(본인 변경 화면 없음).

## 공통 UI (`admin/components/`)

- `PageHeader`(제목·설명·우측 버튼), `SearchBar`(검색어는 Enter·돋보기·지우기로 적용 — 키 입력마다 요청하지 않음), `ListSummary`("총 N건 (p/P 페이지)"), `RichTextEditor`(CKEditor 공용 설정, 한국어 툴바, 본문 이미지 업로드 `POST /user/files/upload`). 렌더 오류는 `shared/components/ErrorBoundary`가 "화면을 불러오지 못했습니다 + 새로고침"으로 보여 준다.
- 목록은 10건씩(`PAGE_SIZE`), 페이지 상태로 `page&size` 조회. 응답 모양은 백엔드 `PageResponse`(`pageNumber`·`totalElements`…, `shared/api/types.ts`).

## 화면별 메모

- **공지사항·자주묻는질문·자유게시판**(`PostManagement/`): 목록(번호·제목·조회수·작성일·상태·관리), 제목/내용 검색, 작성 모달(제목·본문·공지글 토글). 상세 모달에서 바로 수정. 자유게시판은 회원 글을 보고 삭제하는 용도. **댓글 관리 화면은 없다**(API 모듈 `shared/api/endpoints/comment.ts`만 있음; 댓글은 회원이 비밀번호로 삭제 — [30-게시판](30-게시판.md)).
- **시공사례**(`InteriorManagement/`): 갤러리/리스트 보기 토글, 등록 모달(제목·대표 이미지 업로드·본문·정렬 순서). 카테고리는 URL로 고정되지만 API `PUT`은 `category`를 받아 바꿀 수 있다(블로그 이관 도구용).
- **견적문의**(`InquiryManagement/`): [50-견적문의](50-견적문의.md).
- **팝업 관리**(`PopupManagement/`): 제목·내용(HTML)·크기(W×H)·위치(X,Y)·노출 기간·사용 여부. 홈 팝업 레이어가 `GET /public/popups/active`로 가져간다.
- **회원 관리**(`UserManagement/`): 회원(USER) 목록·검색·가입방식 필터, 수정, 비밀번호 초기화, 차단(비활성)/해제. 비활성 회원은 로그인 불가.
- **컨텐츠 관리**(`ContentManagement/`): `contentKey`로 고정 페이지(`/user/page/:contentKey`)를 만든다. 사용자 화면에 메뉴 링크는 없음(직접 URL) — 개발자용이라 시스템 메뉴.
- **관리자 계정**(`AdminMemberManagement/`): 관리자 3역할 계정 생성·수정·비밀번호 초기화·활성/비활성. 테이블은 가로 스크롤(7단계에서 "관리" 열 잘림 해결).
- **메뉴 관리**(`MenuManagement/`): 관리자/사용자 메뉴 탭, 트리(깊이·정렬·URL·아이콘), 추가·수정·삭제·사용 여부. 아이콘은 `AdminLayout`의 `iconMap`에 있는 이름만 그려진다. **사용자 메뉴(USER)는 DB에 있지만 사용자 헤더는 코드에 고정된 메뉴를 쓴다**(미연동).
- **권한 관리**(`RoleManagement/`): 역할 4개와 권한 매핑(권한 수 배지), 역할 추가·수정·활성/비활성·삭제. SYSTEM_ADMIN·USER는 삭제 버튼 없음.
- **게시판 설정**(`BoardManagement.tsx`): 게시판 코드·이름·설명·정렬·사용 여부. 코드(`notice`·`faq`·`free`)는 라우트와 결합돼 있어 바꾸면 사용자 화면이 깨진다.

## 테스트 체크포인트

- `admin/1234` 로그인 → 사이드메뉴 8항목(대시보드·시공사례·공지사항·자주묻는질문·견적문의·팝업 관리·커뮤니티·회원·시스템 관리), 로고 "수디자인 관리자" (2026-10-12 실측). 트리·권한은 `AdminMenuTreeTest`.
- 공지 등록 → 상세 → 수정 → 삭제가 목록에 반영(2026-10-12 실측). 시공사례 등록(대표 이미지 + 본문)이 사용자 갤러리에 반영([40](40-인테리어-갤러리.md)).
- GENERAL_ADMIN 계정으로 로그인 → 시스템 관리 그룹이 안 보이고 `/admin/system/menus` 직접 접속은 `PermissionGuard`가 막는다. 회원 토큰으로 `/admin/**` 호출 → 403(`SecurityRulesTest`).
- `/admin/signup`·`/admin/statistics` 직접 접속 → 대시보드로.

## 의도적 미구현 / 알려진 문제

- 방문자 통계는 없다(애널리틱스 미연동).
- 관리자 화면에 댓글 관리가 없다(위 메모).
- 사용자 메뉴(USER) 관리가 사용자 헤더에 반영되지 않는다.
- 관리자 본인 비밀번호 변경 화면이 없다(관리자 계정 화면에서 초기화).
