# 2단계 구조 정리(apps/) — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `backend/`·`frontend/`를 `apps/` 아래로 옮기고, 프론트 폴더를 `admin/`·`user/`·`shared/` 기능별로 통일하며, `apps/CLAUDE.md`·`conventions.md`·`dev.ps1`을 둔다. **동작 변경 없음.**

**Architecture:** 백엔드는 디렉터리만 이동(`git mv`). 프론트는 파일 이동 + import 경로를 스크립트로 `@/` 절대 경로로 일괄 변환(상대 경로를 파일 위치 기준으로 해석 → 이동표 적용). 검증은 `tsc`(빌드)와 백엔드 통합 테스트, 그리고 로그인·홈 실기동.

**Tech Stack:** git mv, Node 스크립트(1회용, `scripts/`에 두지 않음), Vite alias `@`, PowerShell.

**Spec:** [`docs/superpowers/specs/2026-10-12-project-restructure-design.md`](../specs/2026-10-12-project-restructure-design.md) §3-1·§3-2·§4 2단계.

## Global Constraints

- 브랜치 `refactor/apps-구조-정리`(feat/보안-ci에서 분기). 커밋 `[개발] refactor|docs|build: ...` + 트레일러.
- 코드 동작 변경 금지. 허용되는 코드 변경은 **import 경로와 alias 설정뿐**.
- 이동은 `git mv`로 이력 보존. 파일 내용 변경과 이동을 가능하면 다른 커밋으로(이동 → import 수정).
- git 제외 파일(`backend/application-secret.yml`, `backend/uploads/`, `frontend/node_modules`)은 디렉터리 rename에 따라 함께 이동하는지 확인한다.

## Review Focus

- `.gitignore`의 `backend/...`·`frontend/...` 패턴이 `apps/` 접두어로 바뀌지 않으면 build/·node_modules가 추적된다. → Task 1에서 `git status`로 확인.
- CI 워크플로의 `-p backend`·`working-directory: frontend`·lock 경로. → Task 1.
- 프론트 import 변환이 `./HomePage.css` 같은 같은 폴더 상대 import까지 건드리지 않도록(같은 폴더는 그대로 둠). → Task 2 스크립트 규칙.
- `index.html`의 `/src/main.tsx`, `vite.config.ts`의 alias, `tsconfig.json`의 `paths`·`include`. → Task 2.
- dev-setup·README·CLAUDE.md·사이트맵의 경로 전부. → Task 4 + 링크 검사.

---

### Task 1: `apps/` 이동 + 설정 경로 갱신

- [ ] 브랜치 생성, `git mv backend apps/backend && git mv frontend apps/frontend`.
- [ ] `.gitignore`: `backend/` → `apps/backend/`, `frontend/` → `apps/frontend/`, `!backend/gradle/...` → `!apps/backend/gradle/...`. `git status --short | grep -c "node_modules\|/build/"`가 0.
- [ ] `.github/workflows/ci.yml`: `backend/gradlew`·`-p backend` → `apps/backend/...`, `working-directory: frontend` → `apps/frontend`, `cache-dependency-path: apps/frontend/package-lock.json`.
- [ ] `apps/backend/docker-compose.yml` 주석의 경로, `application-secret.example.yml` 주석 경로.
- [ ] git 제외 파일 확인: `ls apps/backend/application-secret.yml apps/frontend/node_modules | head -2`.
- [ ] 검증: `apps/backend/gradlew.bat compileJava` 0, `cd apps/frontend && npm run build` 0.
- [ ] 커밋 `[개발] refactor: backend·frontend를 apps/ 아래로 이동`.

### Task 2: 프론트 폴더 통일 + import 절대경로화

이동표(`src/` 기준):

| 이전 | 이후 |
|---|---|
| `pages/admin/*` | `admin/pages/*` |
| `pages/auth/*` (관리자 로그인·가입) | `admin/pages/auth/*` |
| `layouts/AdminLayout.*` | `admin/layouts/AdminLayout.*` |
| `api/*` (client.ts, types.ts, endpoints/) | `shared/api/*` |
| `stores/*` | `shared/stores/*` |
| `shared/*` (components, constants, utils) | 그대로 |
| `user/*` | 그대로 |

- [ ] `git mv`로 이동(폴더 단위).
- [ ] `vite.config.ts` alias를 `'@': ./src` 하나로, `tsconfig.json` `paths`를 `"@/*": ["./src/*"]` 하나로.
- [ ] 1회용 Node 스크립트(스크래치 디렉터리)로 모든 `.ts/.tsx`의 `from '../...'`·`from '../../...'` import를 이동표를 거쳐 `@/...`로 변환. 같은 폴더(`./x`) import는 유지. 변환 후 `grep -rn "from '\.\./" src`가 0.
- [ ] `npm run build` 0. 실패하면 오류 목록으로 스크립트를 고치고 재실행(수작업 수정 금지 — 재현 가능해야 함).
- [ ] 커밋 2개: `[개발] refactor: 프론트 폴더를 admin·user·shared로 통일`(이동) → `[개발] refactor: 프론트 import를 @/ 절대경로로 변환`.

### Task 3: `apps/CLAUDE.md` · `conventions.md` · `dev.ps1`

- [ ] `apps/CLAUDE.md`: 스택·포트 표, 절대 규칙(접두어 4종·비밀값·동작/구조 커밋 분리·DB 명명), 백엔드/프론트 컨벤션 요약(현행 사실), 기동·테스트 명령, 커밋 분류 `[개발]`. the-empty-map `apps/CLAUDE.md` 형식을 따르되 내용은 이 코드 기준.
- [ ] `docs/30-dev/conventions.md`: 현행 관찰 규칙(계층·패키지·DTO·`ApiResponse` 엔벨로프·`GlobalExceptionHandler`·React Query/Zustand·`@/` import·antd는 관리자만) + "목표" 표시 항목(OpenAPI 타입 생성, ESLint 설정 — 5단계).
- [ ] `dev.ps1`: Docker compose up → 백엔드(`$env:DB_PORT=3307`)·프론트를 새 창에서.
- [ ] 루트 CLAUDE.md 라우팅 표의 코드 행을 `apps/` + `apps/CLAUDE.md`로.
- [ ] 커밋 `[개발] docs: apps/CLAUDE.md·conventions.md·dev.ps1 추가`.

### Task 4: 문서 경로 동기화 + 검증

- [ ] `README.md`(구조 트리·명령), `docs/30-dev/guides/dev-setup.md`, `docs/10-product/sitemap.md`(코드 경로 열), `docs/00-common/business.md`(출처 경로), ADR-0001(패키지 매니저 행: lock 커밋됨), `scripts/check-doc-links.mjs` SKIP_DIRS에 `apps/frontend/node_modules`는 `node_modules`로 이미 커버.
- [ ] `grep -rn "\bbackend/\|\bfrontend/" README.md CLAUDE.md docs --include=*.md | grep -v "apps/\|superpowers/"` → 0.
- [ ] 전체 검증: `apps/backend/gradlew.bat build`(테스트 포함) 0, `npm run build` 0, 링크 검사 0, 실기동(백엔드·프론트 기동 → 관리자 로그인 → 공지 목록 → 사용자 홈 200).
- [ ] 커밋 `[개발] docs: apps/ 이동에 맞춰 문서 경로 갱신` → push.
