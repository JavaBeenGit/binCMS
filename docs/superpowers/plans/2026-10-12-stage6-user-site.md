# 6단계 사용자 화면 — SEO · 알림 · 브랜드 · 번들 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 납품 가능한 사용자 화면: 진짜 로고·업체 정보, 검색엔진이 읽을 수 있는 메타·사이트맵·상세 딥링크, 새 견적문의 알림(메일 + 대시보드), 관리자 코드가 사용자 번들에 섞이지 않게 분리, 마이페이지 가드.

**Architecture:** 새 라이브러리 없이 간다. 메타는 작은 훅(`usePageMeta`)으로 `document.title`·`meta[name=description]`을 갱신, `robots.txt`는 정적, `sitemap.xml`은 백엔드가 생성(공개 라우트 + 인테리어 상세). 인테리어 상세는 `/user/interior/:category/:id` 라우트로 모달을 연다. 문의 알림은 `InquiryService.createInquiry` 뒤 `InquiryNotifier`(@Async)가 메일 발송, 실패해도 접수는 성공. 대시보드는 `GET /api/v1/admin/dashboard/summary`. 번들은 `React.lazy`로 관리자 페이지·CKEditor 페이지를 분리.

**프리렌더(검색엔진용 정적 HTML)는 이 단계에서 하지 않는다** — 도구 선택(Playwright 기반 자체 스크립트 vs 정적 사이트 생성기)과 CI 브라우저 설치 비용이 결정 사항이라 설계서 후속 항목으로 남긴다. 메타·사이트맵·딥링크만으로도 Google은 색인하고, 네이버는 블로그 원문이 이미 있다.

**Tech Stack:** React Router 6, Spring Mail, Testcontainers, Playwright MCP(검증).

**Spec:** [`docs/superpowers/specs/2026-10-12-project-restructure-design.md`](../specs/2026-10-12-project-restructure-design.md) §4 6단계, §8-1 6행.

## Global Constraints

- 브랜치 `feat/사용자-화면-개선`(docs/기능-가이드에서 분기).
- 업체 정보는 **형의 블로그에 공개된 값**(수디자인 · 인천광역시 계양구 계양대로 195 네오빌딩 1층 · 0507-1464-7321)을 쓰고, 모르는 값(대표명·사업자번호·이메일)은 **표시하지 않는다**(가짜 값 금지). 대표 확인 후 바꿀 수 있게 한 곳(`shared/constants/business.ts`)에 모은다.
- 기능 가이드 동수정(`features/10,40,50,60,70`).
- 백엔드 변경은 통합 테스트로 고정.

## Review Focus

- 로고 이미지가 저장소(`apps/frontend/public/`)에 있어야 새 PC·운영에서도 보인다. → Task 1.
- `/user/interior/onsite/123` 직접 접속 시 모달이 열리고, 닫으면 목록 URL로 돌아가며, 없는 id는 목록으로. → Task 2 Playwright.
- 메일 설정이 없거나 발송이 실패해도 문의 접수는 2xx. → Task 3 테스트(notify-to 비움) + MockBean 테스트(발송 호출).
- 사용자 첫 화면 JS가 관리자 청크를 받지 않아야 한다(네트워크 요청에 `admin-*.js` 없음). → Task 4.

---

### Task 1: 로고 · 업체 정보 · 파비콘

- [ ] 블로그 프로필 로고(`240511_logo_Circle.png`)를 받아 `apps/frontend/public/logo.png`(원본)·`favicon.png`(아이콘)로. 헤더·푸터 `<img src="/logo.png">`, `index.html` 파비콘 교체.
- [ ] `shared/constants/business.ts`: 상호·주소·전화·네이버 블로그·네이버 예약 URL. 푸터·견적문의 Contact 카드가 이 상수를 쓴다. 이메일 카드는 삭제(값 없음), 대신 "네이버 블로그" 링크.
- [ ] `business.md` 갱신(표시 중인 값 = 블로그 공개 정보, 대표 확인 전), 커밋 `[디자인] design: 블로그 로고·공개 업체 정보 적용`.

### Task 2: SEO — 메타 · robots · sitemap · 상세 딥링크

- [ ] `index.html`: `<title>수디자인 — 인테리어 시공·셀프 인테리어</title>`, description, og:title/description/image(`/logo.png`), `lang=ko`.
- [ ] `shared/utils/usePageMeta.ts`: `usePageMeta(title, description)` — 홈·갤러리 3종·공지·FAQ·자유게시판·견적문의·상세(제목) 적용.
- [ ] 라우트 `/user/interior/:category/:id` (`App.tsx`): `InteriorGalleryPage`가 `useParams().id`로 상세를 열고(`GET /public/interiors/{id}`), 닫으면 `navigate('/user/interior/{category}')`. 카드 클릭도 URL 이동으로 통일. 없는 id → 메시지 후 목록.
- [ ] `public/robots.txt`(`Disallow: /admin`, `Sitemap: /sitemap.xml`), 백엔드 `GET /sitemap.xml`(`SitemapController`, permitAll `/sitemap.xml` 추가): 정적 URL 9개 + `useYn=Y` 인테리어 상세. 베이스 URL은 `app.site.base-url`(`SITE_BASE_URL`, local 기본 `http://localhost:3000`). 테스트: 200 + `<urlset>` + 생성한 인테리어 URL 포함.
- [ ] 커밋 `[개발] feat: 페이지 메타·robots·sitemap.xml·인테리어 상세 딥링크`.

### Task 3: 견적문의 알림 + 대시보드 실제 집계

- [ ] RED: `InquiryNotifyTest` — `@MockBean JavaMailSender`, notify-to 설정 시 접수 후 `send` 1회 호출; notify-to 비면 호출 없음·접수 2xx.
- [ ] `app.inquiry.notify-to: ${INQUIRY_NOTIFY_TO:}`; `InquiryNotifier`(@Async, `@EnableAsync` 설정) — 제목 "[수디자인] 새 견적문의: {이름}", 본문에 연락처·유형·예산·장소·내용·관리자 링크. 예외는 로그만.
- [ ] RED: `DashboardSummaryTest` — `GET /api/v1/admin/dashboard/summary` → `{members, posts, interiors, pendingInquiries}` 숫자. 구현 `AdminDashboardController` + 각 리포지토리 `count`.
- [ ] `Dashboard.tsx`: 더미 0 → 요약 API. "오늘 방문자" 카드를 "대기 문의"(빨간 배지, 클릭 시 `/admin/posts/qna`)로.
- [ ] 커밋 2개: `[개발] feat: 새 견적문의 메일 알림` / `[개발] feat: 관리자 대시보드 실제 집계(대기 문의 포함)`.

### Task 4: 번들 분리

- [ ] `App.tsx`: 관리자 11 페이지 + `AdminLayout` + 관리자 로그인/가입 + `FreeBoardPage`(CKEditor)를 `React.lazy` + `<Suspense fallback>`. `vite.config.ts` manualChunks에 `editor: ['ckeditor5', '@ckeditor/ckeditor5-react']` 추가.
- [ ] `npm run build` 전후 청크 크기 기록(계획서 끝 표). 사용자 홈 로드 시 네트워크에 `ckeditor`·관리자 청크 없음(Playwright `list_network_requests`).
- [ ] 커밋 `[개발] perf: 관리자·에디터 코드를 지연 로딩 청크로 분리`.

### Task 5: 마이페이지 가드 · 모바일 확인 · 문서

- [ ] `MyPage.tsx`: 토큰 없으면 `/user/login`으로. 가이드 60 갱신.
- [ ] Playwright 360px: 홈·갤러리·상세 딥링크·견적문의 스크린샷, 가로 스크롤 없음.
- [ ] 가이드 10·40·50·60·70, `business.md`, `dev-setup.md`(환경변수 `INQUIRY_NOTIFY_TO`·`SITE_BASE_URL`), `CLAUDE.md` §7, 설계서 §8-1 6행에 "프리렌더는 후속" 기록. 링크 검사 → 커밋 → push.

## 번들 크기 (Task 4에서 기록)

| 시점 | 사용자 첫 화면 JS | 비고 |
|---|---|---|
| 전 | (기록) | |
| 후 | (기록) | |
