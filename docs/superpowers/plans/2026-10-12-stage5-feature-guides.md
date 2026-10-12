# 5단계 기능 가이드 + 검증 체계 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 화면별 기능 가이드(`docs/30-dev/guides/features/`)를 현재 코드 기준으로 쓰고, `verify` 스킬로 실기동 검증 절차를 고정하며, 핵심 서비스 통합 테스트와 ESLint를 도입해 "기능을 바꾸면 가이드도 같이" 규칙이 작동하게 한다.

**Architecture:** 가이드는 the-empty-map 형식(URL·코드 위치 → 기능 → 사용 API → 테스트 체크포인트 → 의도적 미구현)을 따르되 이 코드에서 확인한 동작만 적는다. `verify` 스킬은 기동·포트·드라이브 방법만 다루고 기대값은 가이드를 가리킨다. 테스트는 기존 `AbstractIntegrationTest` 위에 회원 가입/로그인/탈퇴, 견적문의 접수→관리자 조회, 인테리어 공개 조회(조회수)를 추가한다.

**Tech Stack:** Markdown, Testcontainers 통합 테스트, ESLint 8(.eslintrc.cjs, typescript-eslint + react-hooks + react-refresh — 이미 devDependencies에 있음).

**Spec:** [`docs/superpowers/specs/2026-10-12-project-restructure-design.md`](../specs/2026-10-12-project-restructure-design.md) §4 5단계.

## Global Constraints

- 브랜치 `docs/기능-가이드`(feat/블로그-이관에서 분기). 가이드는 `[개발] docs`, 테스트는 `[개발] test`, ESLint는 `[개발] build`.
- 가이드는 **코드에서 확인한 동작만**. 추측 서술 금지. 확인 못 한 것은 "미확인"으로 표시.
- 여러 메뉴에 걸치는 규칙(응답 엔벨로프·401/403·권한 코드)은 `00-공통.md` 한 곳에만.
- 커버리지 목표 없음(설계서 §6). 핵심 흐름 우선.

## Review Focus

- 사이트맵과 가이드가 같은 사실을 다르게 적으면 안 된다. → Task 1 끝에 사이트맵을 "가이드 색인"으로 축약.
- `verify` 스킬의 명령이 실제로 돌아가야 한다(경로 `apps/`, 포트 3307). → Task 2에서 그대로 실행.
- ESLint `--max-warnings 0`이 CI에서 깨지면 안 된다. → Task 4에서 `npm run lint` 0 확인 후 CI 워크플로에 추가.

---

### Task 1: 기능 가이드 8편 + 색인

- [ ] `features/README.md`(색인·유지보수 규칙·문서 형식), `00-공통.md`(헤더/푸터·API 엔벨로프·401/403·권한 코드·파일 업로드), `10-홈.md`, `20-로그인-인증.md`(관리자/회원 로그인·이메일 가입·소셜·탈퇴), `30-게시판.md`(공지·FAQ·자유게시판·익명 댓글), `40-인테리어-갤러리.md`, `50-견적문의.md`, `60-마이페이지.md`, `70-admin.md`(메뉴별 화면·권한 코드).
- [ ] `docs/10-product/sitemap.md`를 유지하되 각 행에 가이드 링크. `CLAUDE.md` §3 규칙 문구를 "features 가이드"로.
- [ ] 링크 검사 → 커밋.

### Task 2: `verify` 스킬

- [ ] `.claude/skills/verify/SKILL.md`: 기동(Docker 3307·백엔드·프론트, `dev.ps1` 또는 개별), 준비 판정(curl), 드라이브(Playwright MCP, 관리자 admin/1234, 회원은 `POST /api/v1/auth/signup`로 즉석 생성), DB 확인(`docker exec bincms-mysql mysql ...`), 종료, 주의(비밀값 파일 없으면 소셜·메일 비활성, 이력 없는 DB는 `down -v`).
- [ ] 스킬 절차대로 한 번 실행해 health·로그인·가이드 체크포인트 3개를 확인.
- [ ] 커밋.

### Task 3: 핵심 서비스 통합 테스트 (RED → GREEN)

- [ ] `MemberFlowTest`: 가입 → 로그인 → 잘못된 비밀번호 401/400 → 탈퇴(`/auth/withdraw`, 비밀번호 필요) → 탈퇴 후 로그인 실패.
- [ ] `InquiryFlowTest`: 비로그인 접수(`/public/inquiries`) → 관리자 목록에 PENDING → 상태 변경 PATCH → 조회.
- [ ] `InteriorPublicTest`: 관리자 생성 → 공개 목록(카테고리) → 상세 조회 시 `viewCount` 증가, 비활성(`useYn=N`) 글은 공개 목록에서 제외(현재 동작 확인 후 기대값 확정).
- [ ] 실패하는 기대값이 "버그"면 고치고(TDD), "원래 동작"이면 가이드에 적는다.
- [ ] 커밋.

### Task 4: ESLint

- [ ] `apps/frontend/.eslintrc.cjs`(parser typescript-eslint, plugins react-hooks·react-refresh, `@typescript-eslint/no-explicit-any: warn`→ CI 0 경고 정책이므로 위반은 고치거나 규칙을 `off`로 명시). `npm run lint` 0.
- [ ] CI 프론트 잡에 `npm run lint` 추가. dev-setup "알려진 문제"에서 lint 줄 삭제.
- [ ] 커밋 → push.
