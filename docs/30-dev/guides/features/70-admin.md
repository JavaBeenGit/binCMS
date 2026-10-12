# 70. 관리자 (`/admin/**`)

로그인·레이아웃·권한 코드는 [20-로그인-인증](20-로그인-인증.md)·[00-공통](00-공통.md). 모든 API는 `/api/v1/admin/**`(관리자 역할 필수). 화면 파일은 `apps/frontend/src/admin/pages/`.

| 메뉴 | URL | 화면 파일 | 프론트 권한 | 주요 API |
|---|---|---|---|---|
| 대시보드 | `/admin` | `Dashboard.tsx` | 로그인만 | `GET /admin/dashboard/summary` → 대기 문의(빨간 배지, 클릭 시 문의 관리)·시공사례·게시글·회원 수, 60초마다 갱신 |
| 게시글 관리 › 공지/FAQ/자유 | `/admin/posts/{notice,faq,free}` | `PostManagement.tsx` | `MENU_POST`(free는 매핑 없음) | `GET/POST /admin/posts`, `PUT/DELETE /admin/posts/{id}`, `GET /admin/posts/search`, 댓글 `GET/DELETE /admin/comments/...` |
| 게시글 관리 › 견적문의 | `/admin/posts/qna` | `InquiryManagement.tsx` | `MENU_POST` | [50-견적문의](50-견적문의.md) |
| 컨텐츠 관리 | `/admin/contents` | `ContentManagement.tsx` | `MENU_CONTENT` | `GET/POST/PUT/DELETE /admin/contents`, `PATCH .../activate|deactivate` |
| 인테리어 관리 › 3종 | `/admin/interiors/{onsite,self-tip,story}` | `InteriorManagement.tsx` | `MENU_INTERIOR` | `GET/POST/PUT/DELETE /admin/interiors`, `GET /category/{c}`, `GET /search` |
| 사용자 관리 | `/admin/users` | `UserManagement.tsx` | `MENU_USER` | `GET /admin/users`, `PUT /{id}`, `PATCH /{id}/password|deactivate|activate` |
| 팝업 관리 | `/admin/popups` | `PopupManagement.tsx` | `MENU_POPUP` | `GET/POST/PUT/DELETE /admin/popups`, `PATCH .../activate|deactivate` |
| 시스템 › 메뉴 관리 | `/admin/system/menus` | `MenuManagement.tsx` | `MENU_SYSTEM_MENU` | `GET /admin/menus`, `GET /type/{ADMIN|USER}`, `POST/PUT/DELETE`, `PATCH /{id}/activate` |
| 시스템 › 관리자 회원 | `/admin/system/admins` | `AdminMemberManagement.tsx` | `MENU_SYSTEM_ADMIN` | `GET/POST /admin/members`, `PUT /{id}`, `PATCH /{id}/password|deactivate|activate` |
| 시스템 › 게시판 설정 | `/admin/system/boards` | `BoardManagement.tsx` | `MENU_SYSTEM_BOARD` | `GET/POST/PUT/DELETE /admin/boards`, `PATCH /{id}/activate` |
| 시스템 › 권한 관리 | `/admin/system/roles` | `RoleManagement.tsx` | `MENU_SYSTEM_ROLE` | `GET/POST/PUT/DELETE /admin/roles`, `GET /admin/roles/permissions` |
| 통계 / IP / 공통코드 / 내 정보 | `/admin/statistics`, `/admin/system/ips`, `/admin/system/codes`, `/admin/profile` | `App.tsx` 인라인 | — | "개발 예정" 텍스트만 |

## 화면별 메모

- **게시글 관리**: 목록(번호·제목·조회수·작성일·상태·관리), 제목/내용 검색, 작성 모달(제목·CKEditor 본문·공지글 토글). 수정·삭제·보기 버튼. 자유게시판 탭에서는 회원 글과 댓글(비밀번호 없이 삭제)을 관리.
- **인테리어 관리**: 갤러리/리스트 보기 토글, 등록 모달(제목·대표 이미지 업로드·CKEditor·정렬 순서). 카테고리는 URL로 고정되지만 API `PUT`은 `category`를 받아 바꿀 수 있다(블로그 이관 도구용).
- **팝업 관리**: 제목·내용(HTML)·크기(W×H)·위치(X,Y)·노출 기간·사용 여부. 홈 팝업 레이어가 `GET /public/popups/active`로 가져간다.
- **컨텐츠 관리**: `contentKey`로 고정 페이지(`/user/page/:contentKey`)를 만든다. 사용자 화면에 메뉴 링크는 없음(직접 URL).
- **사용자 관리**: 회원(USER) 목록·검색·가입방식 필터, 수정, 비밀번호 초기화, 차단(비활성)/해제. 비활성 회원은 로그인 불가.
- **관리자 회원 관리**: 관리자 3역할 계정 생성·수정·비밀번호 초기화·활성/비활성. 테이블이 가로로 넘쳐 "관리" 열이 잘림(7단계 정리).
- **메뉴 관리**: 관리자/사용자 메뉴 탭, 트리(깊이·정렬·URL·아이콘), 추가·수정·삭제·사용 여부. **사용자 메뉴(USER)는 DB에 있지만 사용자 헤더는 코드에 고정된 메뉴를 쓴다**(미연동).
- **권한 관리**: 역할 4개와 권한 매핑(권한 수 배지), 역할 추가·수정·활성/비활성·삭제. SYSTEM_ADMIN·USER는 삭제 버튼 없음.
- **게시판 설정**: 게시판 코드·이름·설명·정렬·사용 여부. 코드(`notice`·`faq`·`free`)는 라우트와 결합돼 있어 바꾸면 사용자 화면이 깨진다.

## 테스트 체크포인트

- `admin/1234` 로그인 → 사이드메뉴 8개(대시보드·게시글·통계·컨텐츠·인테리어·사용자·팝업·시스템). 각 목록 화면이 콘솔 401/403 없이 뜬다(2026-10-12 실측).
- 공지 작성·인테리어 등록이 사용자 화면에 반영([30](30-게시판.md)·[40](40-인테리어-갤러리.md)).
- 회원 토큰으로 `/admin/**` 호출 → 403(`SecurityRulesTest`).

## 의도적 미구현 / 알려진 문제

- 방문자 통계는 없다(애널리틱스 미연동).
- 통계·IP·공통코드·내 정보 메뉴는 플레이스홀더 → 7단계에서 삭제(설계서 §8-1).
- 사용자 메뉴(USER) 관리가 사용자 헤더에 반영되지 않는다.
- 관리자 화면 파일이 400~650줄로 큼 → 7단계 분할.
