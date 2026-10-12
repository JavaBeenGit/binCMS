# 7단계 — 관리자 정리(형님용 메뉴·플레이스홀더 삭제·화면 분할·운영 매뉴얼) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. 체크박스로 진행을 추적한다.

**Goal:** 관리자를 "형(비개발자 운영자 한 명)"이 매뉴얼만 보고 쓸 수 있게 만든다 — 사이드메뉴를 운영 메뉴 중심으로 줄이고, 개발 예정 플레이스홀더와 `/admin/signup`을 없애고, 400~650줄 화면을 300줄 이하로 나누고, 운영 매뉴얼을 쓴다.

**Architecture:** 메뉴 구조는 DB(`tb_menus`)가 정본이므로 **Flyway V3**로 바꾼다(코드 하드코딩 없음). 권한도 V3에서 정리(플레이스홀더 권한 삭제, 운영 5메뉴를 모든 관리자 역할의 공통 바닥으로). 프론트는 라우트·권한 매핑·레이아웃 정리 + 페이지 폴더 분할(동작 불변). 공통 UI(`PageHeader`·`SearchBar`·`RichTextEditor`)는 `admin/components/`.

**Tech Stack:** Flyway SQL, Spring MockMvc 통합 테스트(Testcontainers), React 18 + antd + TanStack Query, Playwright MCP 실측.

**Spec:** `docs/superpowers/specs/2026-10-12-project-restructure-design.md` §7단계 + §8-1 행 7.
**브랜치:** `refactor/관리자-화면-분할` (base: `feat/사용자-화면-개선`)

## Global Constraints

- 관리자 API 접두어 `/api/v1/admin/**`, 역할 3종(SYSTEM_ADMIN·OPERATION_ADMIN·GENERAL_ADMIN) 유지. URL(라우트)은 바꾸지 않는다 — 메뉴 이름·위치만 바꾼다.
- `ddl-auto: validate` — 스키마 변경 없음(데이터만). 시드 정본은 V2 + V3.
- 관리자 페이지 파일 **300줄 이하**, 동작(호출 API·라벨·메시지·검증) 불변.
- `features/70-admin.md`·`00-공통.md`(권한 코드 수) 동시 갱신. 커밋 `[분류] type: 설명` + Co-Authored-By.

## 결정(Ruling) — 설계서가 비워 둔 부분

- **메뉴 트리(관리자 역할 공통)**: 대시보드 · 시공사례(현장시공/셀프시공 팁/인테리어스토리) · 공지사항 · 자주묻는질문 · 견적문의 · 팝업 관리 → "운영 메뉴". 그 아래 그룹 **커뮤니티·회원**(자유게시판·회원 관리, MENU_POST/MENU_USER) 과 **시스템 관리**(컨텐츠·메뉴·게시판 설정·권한·관리자 계정, SYSTEM_ADMIN만). 컨텐츠 관리(고정 페이지, 직접 URL)는 개발자용이라 시스템으로 옮긴다. — 비용: 운영자가 컨텐츠를 써야 하면 SYSTEM_ADMIN 계정을 쓰거나 권한 관리 화면에서 권한을 주면 된다.
- **GENERAL_ADMIN**에 MENU_INTERIOR·MENU_POPUP 추가: "모든 관리자는 운영 5메뉴를 본다"가 바닥. OPERATION_ADMIN에서 MENU_CONTENT 제거.
- `/admin/posts`(보드 미지정 PostManagement) 라우트·메뉴 URL 삭제 — 어느 메뉴도 안 가리킨다. `/signup`은 `/user/signup`으로.
- 사이드바 로고 "binCMS" → "수디자인 관리자"(접힘: "수"). 헤더 드롭다운 "내 정보"(플레이스홀더) 삭제.
- 운영 매뉴얼 경로는 설계서대로 `docs/30-dev/guides/admin-manual.md`(스크린샷 `docs/30-dev/guides/images/admin/`).

## Review Focus

- V3는 로컬·운영 DB의 id 가 시드와 다를 수 있으므로 id 가 아닌 `menu_url`/`perm_code`/`role_code` 기준으로 UPDATE/DELETE 한다(Task 1 테스트는 이름·URL로 검증).
- 권한 없는 역할(GENERAL_ADMIN)로 로그인했을 때 사이드바가 운영 메뉴만 보이고 `/admin/system/*` 직접 접속은 PermissionGuard 가 막는다(Task 5 실측).
- 분할 후 CKEditor 업로드 어댑터·이미지 업로드(인테리어 대표 이미지)가 그대로 동작한다(Task 5 실측: 공지 본문 이미지 1장 + 인테리어 대표 이미지 1장).
- 페이지네이션·검색·필터 상태가 분할 전과 같다(각 페이지 2페이지 이동·검색 1회).
- `/admin/signup` 직접 접속 결과(라우트 없음 → `*` 라우트 동작) 확인.

---

### Task 1: V3 마이그레이션 — 메뉴·권한 정리 (백엔드, TDD)

**Files:**
- Create: `apps/backend/src/main/resources/db/migration/V3__admin_menu_simplify.sql`
- Create: `apps/backend/src/test/java/com/bincms/admin/AdminMenuTreeTest.java`
- Modify: `apps/backend/src/test/java/com/bincms/db/FlywayMigrationTest.java` (버전 1·2·3, 권한 13·역할권한 27·메뉴 27(ADMIN 18))

- [x] **Step 1 (RED)**: `AdminMenuTreeTest` — `GET /api/v1/admin/menus/type/ADMIN` 최상위 이름이 정확히 `대시보드, 시공사례, 공지사항, 자주묻는질문, 견적문의, 팝업 관리, 커뮤니티·회원, 시스템 관리`; 시스템 관리 자식 `컨텐츠 관리, 메뉴 관리, 게시판 설정, 권한 관리, 관리자 계정`; 커뮤니티·회원 자식 `자유게시판, 회원 관리`; 플레이스홀더 URL 없음. 역할 권한: GENERAL_ADMIN ⊇ {DASHBOARD, POST, INTERIOR, POPUP}, OPERATION_ADMIN ∌ CONTENT, SYSTEM_ADMIN ⊇ SYSTEM_*·CONTENT, `MENU_STATISTICS/SYSTEM_IP/SYSTEM_CODE` 없음. FlywayMigrationTest 기대값을 V3 기준으로 수정.
- [x] **Step 2**: `gradlew.bat test --tests '*AdminMenuTreeTest' --tests '*FlywayMigrationTest'` → FAIL 4건(현재 V2 트리). 2026-10-12 확인.
- [x] **Step 3 (GREEN)**: V3 작성 — 삭제: 권한 3종(+역할권한), 메뉴 3개(menu_url 기준). 이동: 공지·FAQ·견적문의 최상위(아이콘 SoundOutlined/QuestionCircleOutlined/FormOutlined), 인테리어 관리→"시공사례"(sort 2), 팝업(6), `/admin/posts` 부모→"커뮤니티·회원"(TeamOutlined, url NULL, sort 7; 자유게시판 1, 사용자 관리→"회원 관리" 2), 시스템 관리(sort 8; 컨텐츠 1, 메뉴 2, 게시판 설정 3, 권한관리→"권한 관리" 4, 관리자 회원 관리→"관리자 계정" 5). 권한: MENU_CONTENT perm_group SYSTEM·OPERATION_ADMIN에서 제거, GENERAL_ADMIN에 INTERIOR·POPUP 추가.
- [x] **Step 4**: 같은 테스트 → PASS. 전체 `gradlew.bat test` → 24/24 (22 + 2). 2026-10-12 확인.
- [x] **Step 5**: 커밋 `[개발] feat: 관리자 메뉴를 운영자 기준으로 정리(V3) — 플레이스홀더 삭제, 시스템 메뉴는 SYSTEM_ADMIN만`

### Task 2: 프론트 정리 — 플레이스홀더·/admin/signup 삭제, 권한 매핑, 레이아웃

**Files:**
- Modify: `apps/frontend/src/App.tsx` (Signup lazy·`/admin/signup`·`profile`·`statistics`·`system/ips`·`system/codes`·`posts`(보드 미지정) 라우트 삭제, `/signup`→`/user/signup`)
- Delete: `apps/frontend/src/admin/pages/auth/Signup.tsx`(+ 전용 css 있으면)
- Modify: `apps/frontend/src/admin/pages/auth/Login.tsx` (회원가입 링크 제거)
- Modify: `apps/frontend/src/shared/constants/permissions.ts` (statistics/ips/codes/`/admin/posts` 제거, `/admin/posts/free: MENU_POST` 추가)
- Modify: `apps/frontend/src/admin/layouts/AdminLayout.tsx` (내 정보 삭제, iconMap에 SoundOutlined·FormOutlined·QuestionCircleOutlined 추가·삭제 메뉴 아이콘 제거, `convertToMenuItems` useCallback 정리 + eslint 주석 삭제, 로고 "수디자인 관리자")

- [x] **Step 1**: 위 수정. `npx tsc --noEmit && npx eslint src --max-warnings=0` → OK.
- [x] **Step 2**: Playwright: 사이드바 8항목 확인. `/admin/signup` 은 빈 화면이었음(catch-all 라우트 없음) → `*` 라우트 추가(관리자 영역은 대시보드, 그 외는 홈). 로그인 카드 제목 "수디자인 관리자".
- [x] **Step 3**: 커밋 b60c9dd + 7589416

### Task 3: 공통 컴포넌트 + 기준 분할(PostManagement)

**Files:**
- Create: `apps/frontend/src/admin/components/PageHeader.tsx` — `{ title, description?, extra? }` 제목 행.
- Create: `apps/frontend/src/admin/components/SearchBar.tsx` — `{ placeholder, onSearch, children? }` 검색 Input.Search + 필터 슬롯.
- Create: `apps/frontend/src/admin/components/RichTextEditor.tsx` — CKEditor + 공용 설정(툴바·업로드 어댑터·한국어) `{ value, onChange, minHeight? }`. 4개 화면(공지/인테리어/팝업/컨텐츠)의 중복 설정 30줄을 대체.
- Create: `apps/frontend/src/admin/pages/PostManagement/{index.tsx, postColumns.tsx, PostFormModal.tsx, PostDetailModal.tsx}` / Delete: `PostManagement.tsx`

**분할 규칙(모든 페이지 공통):**

```
admin/pages/<Feature>/index.tsx                상태·useQuery/useMutation·핸들러·레이아웃(PageHeader·SearchBar·Table·Pagination). 300줄 이하
admin/pages/<Feature>/<feature>Columns.tsx     export function build<Feature>Columns(handlers): ColumnsType<T>
admin/pages/<Feature>/<Feature>FormModal.tsx   등록/수정 모달. props: { open, mode: 'create' | 'edit', initial?, loading, onSubmit(values), onCancel }
admin/pages/<Feature>/<Feature>DetailModal.tsx 상세(있을 때). props: { item | null, onClose }
admin/pages/<Feature>/<Feature>PasswordModal.tsx 비밀번호 초기화(회원·관리자 계정)
```

`App.tsx`의 `import('@/admin/pages/PostManagement')`는 폴더 `index.tsx`로 그대로 해석된다(수정 불필요).

- [x] **Step 1**: 공통 컴포넌트 4개 작성(ListSummary 추가). RichTextEditor 에 한국어 툴바 번역(`ckeditor5/translations/ko.js`) 추가 — 원래는 영어였다.
- [x] **Step 2**: PostManagement 분할(최대 203줄). tsc·eslint OK. **Ruling**: 분할 중 발견한 결함 2개를 고침 — (1) 게시글 목록 페이지 이동 불가(프론트 `PageResponse` 타입이 Spring Page 모양이라 `pageable` 이 항상 undefined, size 20으로 받으면서 pager 는 10) → 타입을 백엔드 모양으로, page 상태로 10건 조회 (2) 검색이 키 입력마다 요청 → Enter/돋보기로 적용. 비용: 다른 화면이 `pageable` 을 썼다면 깨지지만 grep 결과 PostManagement 만 썼다.
- [x] **Step 3**: Playwright: 공지 등록 → 상세 → 수정 → 삭제 확인(본문 이미지 업로드는 Task 5 시공사례에서). **발견**: 관리자 화면에는 댓글 관리가 없다(API 모듈 `comment.ts`만 있고 화면 없음) — 가이드 70 이 틀렸던 것, Task 6 에서 정정. 렌더 오류 시 빈 화면이 되던 것도 발견 → ErrorBoundary 추가.
- [x] **Step 4**: 커밋 4c1a01b

### Task 4: 나머지 8개 화면 분할 (서브에이전트 병렬, Task 3 패턴)

| 페이지 | 줄 | 분할 |
|---|---|---|
| InteriorManagement | 647 | index · interiorColumns · InteriorFormModal(대표 이미지 Upload + RichTextEditor) · InteriorDetailModal · InteriorGalleryGrid |
| PopupManagement | 539 | index · popupColumns · PopupFormModal(RichTextEditor, RangePicker) · PopupDetailModal |
| ContentManagement | 512 | index · contentColumns · ContentFormModal(RichTextEditor) · ContentDetailModal |
| RoleManagement | 507 | index · roleColumns · RoleFormModal(권한 체크) · RoleDetailModal |
| AdminMemberManagement | 489 | index · adminMemberColumns · AdminMemberFormModal · AdminMemberPasswordModal (+ 테이블 가로 스크롤로 "관리" 열 잘림 해결) |
| InquiryManagement | 458 | index · inquiryColumns · InquiryDetailModal · InquiryStatusModal · InquiryMemoModal · inquiryLabels.ts(STATUS/TYPE/BUDGET_MAP) |
| UserManagement | 440 | index · userColumns · UserFormModal · UserPasswordModal · UserDetailModal |
| MenuManagement | 426 | index · menuColumns · MenuFormModal |

- [x] **Step 1**: 에이전트 3개(각 2~3페이지)에 Task 3 결과물(공통 컴포넌트·PostManagement 폴더)을 기준 예시로 주고 분할. 제약: 동작 불변, ≤300줄, 자기 폴더만 수정, 끝나면 `npx tsc --noEmit`·`npx eslint src/admin/pages/<Feature>`.
- [x] **Step 2**: tsc·eslint OK, 최대 220줄(index), BoardManagement 300 그대로. 에이전트 보고의 의도적 차이: 검색 Enter 적용·trim, 제목 행 PageHeader 통일(견적문의 통계 카드가 제목 아래로), 폼 리셋 시점(열릴 때), 팝업/컨텐츠 에디터 높이 300 유지. 시공사례 검색 시 1페이지로 리셋(에이전트 제안 반영). RoleManagement 는 페이지네이션이 없어 `총 N건` 인라인 유지.
- [x] **Step 3**: 커밋 36eeb29

### Task 5: 전 화면 실측 (Playwright) + 매뉴얼용 스크린샷

- [x] 시공사례: 등록(대표 이미지 logo.png 업로드 + 본문, 정렬 1) → 공개 API 41건·마지막 페이지(sortOrder asc, id desc — 비우면 0이라 새 글이 앞) → 검색 "테스트" 4건 → 수정 → 삭제 → 3건. (2026-10-12)
- [x] 견적문의: 공개 API 로 1건 접수 → 목록(대기 1) → 상세 → 상태 처리중(카드 대기 0·처리중 1) → 메모 저장(API 로 adminMemo 확인). 대시보드 배지는 아래에서 확인.
- [x] 팝업: 등록(10/12~10/14, 500×400) → 홈에서 뜸("하루동안 열지 않기"·닫기) → 사용 스위치 끔 → `/public/popups/active` 빈 배열·홈에 안 뜸 → 삭제 → 0건. (2026-10-12)
- [x] FAQ·자유게시판·회원·컨텐츠·메뉴·게시판 설정·권한·관리자 계정: 목록 로드 + 등록 모달 열기(필드 확인) 완료. 관리자 계정은 1건 생성(sooadmin). 메뉴·권한 모달에서 콘솔 오류 1건씩 = antd 사용 중단 경고(`Tabs.TabPane`, `Card bodyStyle`, 원본부터 있던 것) → 수정.
- [x] GENERAL_ADMIN 계정 `sooadmin`(관리자 계정 화면에서 생성, 로컬 DB) 로그인 → 사이드바 7항목(시스템 관리 없음, 커뮤니티·회원은 자유게시판만) → `/admin/system/menus` 직접 접속 → PermissionGuard 가 대시보드로 돌려보냄. 대시보드 "대기 중인 견적문의 0"(처리중으로 바꾼 뒤)·"게시글 0"(삭제 글 제외) 확인. (2026-10-12)
- [x] 스크린샷(1280px) 7장 → `docs/30-dev/guides/images/admin/01~07`
- [x] 발견한 결함은 아래 "실측 결과"에 기록하고 수정(각각 커밋).

### Task 6: 운영 매뉴얼 · 가이드 · 현황 · push

- [x] `docs/30-dev/guides/admin-manual.md` — **형(비개발자)용**: 접속·로그인, 화면 구성, 시공사례 올리기(사진 포함, 순서대로), 공지/FAQ 쓰기, 견적문의 확인·상태·메모, 팝업 띄우기/내리기, 자주 묻는 문제(비밀번호를 잊었을 때 → 개발자에게, 사진이 안 올라갈 때 → 10MB·확장자). 스크린샷 삽입. 개발 용어 금지.
- [x] `features/70-admin.md` 표 재작성(새 트리·폴더 경로·권한), `00-공통.md` 권한 코드 13개·역할권한 27행, `20-로그인-인증.md`·`10-product/sitemap.md`의 `/admin/signup` 제거, `dev-setup.md` V3 언급.
- [x] `CLAUDE.md` §7(7단계 완료, 다음 8단계), 설계서 §8-1 행 7 결과, 이 계획서 결과.
- [ ] `node scripts/check-doc-links.mjs` → 0, 백엔드 `gradlew.bat test` 24/24, 프론트 lint·build OK.
- [ ] 커밋 `[문서] docs: 운영 매뉴얼(형님용) + 7단계 결과 반영` → `git push -u origin refactor/관리자-화면-분할`

## 실측 결과 (Task 5에서 기록)

- 2026-10-12 공지 CRUD 실측 중 발견: 대시보드 "게시글" 수가 삭제한 글(useYn=N 비활성)까지 셌다 → `countByUseYn("Y")` + `DashboardSummaryTest.postsCountExcludesDeactivated` (RED→GREEN).
