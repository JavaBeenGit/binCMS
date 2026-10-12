# 설계서 — binCms 재정비 (수디자인 인테리어 홈페이지)

> 작성 2026-10-12. 상태: **승인됨** (2026-10-12, 사용자).
> 목적: "AI를 모를 때 만든" 현재 저장소를 the-empty-map 수준의 지침·문서·Git 규율을 갖춘 납품용 프로젝트로 제자리에서 재정비한다.

## 1. 배경과 목표

### 1-1. 무엇을 만드는가

- **제품**: 인테리어 업체 "수디자인(BIN INTERIOR)" 홈페이지 + 관리자 백오피스.
- **고객**: 사용자의 친형(업체 대표). **운영자도 형 한 명** — 비개발자가 혼자 관리자 화면으로 운영한다.
- **개발자**: 사용자 1명 + Claude. 디자이너 없음, 시안 없음.
- **마감**: 없음. 품질과 운영 안정성이 우선.

### 1-2. 현재 상태 (2026-10-12 main 기준)

- 백엔드 Spring Boot 3.3 / Java 21 / Gradle / JPA + QueryDSL / JWT, MySQL. 도메인 13개(board, post, comment, content, popup, interior, inquiry, file, email, oauth, member, role, menu).
- 프론트 React 18 + Vite + TS + Ant Design + Zustand + TanStack Query. 사용자 화면 12개, 관리자 화면 11개.
- 코드 약 1.9만 줄, 테스트 0, CI 없음, CLAUDE.md 없음.

### 1-3. 해결할 문제 (우선순위)

1. `application.yml`에 OAuth secret·메일 비밀번호·JWT secret 평문 커밋 — **재발급과 환경변수화는 3단계에서 처리**(사용자 결정: 당장은 보류).
2. `SecurityConfig`가 `/api/v1/admin/**` 포함 거의 전 경로를 `permitAll` — 권한이 프론트 가드에만 의존.
3. 문서가 다른 프로젝트(전자정부·다중사이트 CMS·11개 에이전트)를 설명함. ADR 파일명과 내용이 모순.
4. `ddl-auto: update` + 777줄 `DataInitializer`가 스키마와 시드를 코드로 관리. 마이그레이션 없음.
5. 프론트 폴더 깊이 불일치(`pages/admin` vs `user/pages`), 관리자 화면 파일당 400~650줄.
6. 테스트·린트·CI 없음. 업로드 경로가 특정 PC 절대경로.

### 1-4. 목표 상태

- 루트 `CLAUDE.md`가 진입 안내서 역할을 하고, 세부 규칙은 하위 문서가 단일 출처.
- `docs/`가 번호 영역 체계로 정리되고, 모든 문서가 **현재 코드**를 설명한다.
- Git은 브랜치 작업 + `[분류] type: 설명` 커밋 + 명시 요청 시 push.
- 화면별 기능 가이드(`features/`)와 `verify` 스킬로 실기동 검증이 가능.
- 보안·스키마·배포가 납품 가능한 수준.

### 1-5. 범위 밖 (하지 않는 것)

- 새 저장소 생성·코드 이식(B안). 저장소명 `binCms`·패키지 `com.bincms` 유지.
- 관리자 UI를 Thymeleaf로 전환(the-empty-map 방식). **관리자는 React + antd 유지**(이미 11개 화면이 동작).
- 퍼블리싱 워크스페이스(`_publish/`)·`20-design/` 영역. 디자이너가 없으므로 두지 않는다.
- `90-internal/`. 1인 프로젝트라 비공개 구역이 필요 없다. 필요해지면 그때 추가.
- 다중 사이트·템플릿 시스템 등 README에만 있던 미구현 기능.
- 커밋 이력 재작성(`filter-repo`). 유출된 키는 재발급으로 무효화한다.

## 2. 접근: A안 "제자리 재정비"

기존 저장소에서 단계별 브랜치로 진행한다. **각 단계는 독립적으로 main에 머지 가능**하고, 머지 시점마다 앱이 기동된다. 단계 간 순서는 뒤 단계가 앞 단계의 결과(경로·규칙)를 전제로 하기 때문에 고정한다.

## 3. 목표 구조

### 3-1. 저장소

```
binCms/
├── CLAUDE.md                  # 진입 안내서 (라우팅·Git·컨벤션 피드백)
├── CLAUDE.local.md            # (git 제외) 개인 규칙 자리
├── README.md                  # 제품 소개·기동 방법 (현재 코드 기준으로 재작성)
├── .claude/
│   ├── rules/git-branch.md    # 매 세션 자동 로드되는 Git 규칙
│   └── skills/verify/SKILL.md # 실기동 검증 레시피
├── apps/
│   ├── CLAUDE.md              # 코드 레이어 진입 안내
│   ├── backend/               # (기존 backend/ 이동, Gradle)
│   └── frontend/              # (기존 frontend/ 이동)
├── docs/
│   ├── README.md              # 영역 안내·명명 규칙·깊이 ≤ 3
│   ├── 00-common/             # 업체 정보(business.md), 용어집
│   ├── 10-product/            # 사이트맵, 기능 목록, 요구사항
│   ├── 30-dev/
│   │   ├── adr/               # 0000-template + 새 번호 체계
│   │   ├── conventions.md
│   │   ├── db-naming.md
│   │   ├── guides/
│   │   │   ├── dev-setup.md
│   │   │   ├── features/      # 화면별 기능 가이드
│   │   │   └── admin-manual.md  # 운영자(형)용 관리자 사용법
│   │   └── runbook/           # 배포·백업·장애 대응
│   └── superpowers/{specs,plans}/
├── dev.ps1                    # DB + 백엔드 + 프론트 기동
└── .gitignore
```

번호 영역은 the-empty-map과 같은 체계(`00/10/30`)를 쓰되 `20-design`·`90-internal`은 생략한다. 나중에 추가할 때 번호가 비어 있다.

### 3-2. 프론트엔드 폴더

```
apps/frontend/src/
├── admin/      {layouts, pages, components}   # 관리자 (antd)
├── user/       {layouts, pages, components}   # 사용자 (자체 CSS)
├── shared/     {api, stores, components, constants, utils, types}
├── App.tsx / main.tsx
```

- `api/endpoints/*`, `stores/*`, `shared/*`는 `shared/` 아래로 모은다.
- 7단계에서 관리자 화면을 `pages/<domain>/{List,Form}.tsx` + `hooks/use<Domain>.ts`로 분할한다. 2단계에서는 **이동만** 한다.

### 3-3. 백엔드

패키지·계층은 현행 유지(`com.bincms.{common,config,domain.<x>.{controller,dto,entity,repository,service}}`). 바꾸는 것은 다음뿐이다.

- 4단계: `DataInitializer` 삭제 → Flyway SQL.
- 3단계: `SecurityConfig` 재작성, 설정값 환경변수화.

## 4. 단계별 범위

### 0단계 — 기준선 고정 (`chore/기준선-고정`)

- `docker-compose.yml`로 로컬 MySQL 8 기동(포트 3306, DB `bincms`, 계정은 현재 yml과 동일).
- 백엔드 `bootRun`, 프론트 `npm run dev`가 뜨고 홈·관리자 로그인이 되는지 확인. 빌드 실패가 있으면 여기서 고친다.
- 결과를 `docs/30-dev/guides/dev-setup.md` 초안으로 기록.
- **완료 기준**: 깨끗한 클론에서 문서대로 따라 하면 30분 안에 기동.

### 1단계 — 지침 뼈대 (`docs/지침-뼈대`)

- 루트 `CLAUDE.md`: 정체성 한 문단, 라우팅 표(문서 → `docs/README.md`, 코드 → `apps/CLAUDE.md`), 의사소통(한국어, 짧게), Git 규칙(§5), 팀 컨벤션/피드백 누적 절.
- `.claude/rules/git-branch.md`: CLAUDE.md §Git의 실행 사본.
- `docs/README.md`, `docs/00-common/`, `docs/10-product/`, `docs/30-dev/` 골격과 README.
- **삭제**: `docs/agent/` 전체, `docs/plans/` 전체, 기존 ADR 7개(모순·eGov 전제). 살릴 내용(0007 DB 명명 규칙)은 `db-naming.md`로 옮긴 뒤 삭제.
- 새 ADR: `0000-template`, `0001-tech-stack`(현행 스택을 사실대로), `0002-admin-react-spa`(Thymeleaf 아닌 React 유지 근거), `0003-auth-jwt`(현행 JWT + 역할 모델).
- `README.md` 재작성(없는 기능 제거).
- `.project`, `.settings/`(Eclipse 잔재) 삭제, `.gitignore`에 `CLAUDE.local.md` 추가.
- **완료 기준**: 저장소의 모든 문서가 현재 코드와 일치. `CLAUDE.md`만 읽고 다음 작업 위치를 찾을 수 있음.

### 2단계 — 코드 구조 정리 (`refactor/apps-구조-정리`)

- `backend/` → `apps/backend/`, `frontend/` → `apps/frontend/` (`git mv`).
- 프론트 §3-2 구조로 이동. import 경로 수정. `@/` alias 도입(`vite.config.ts` + `tsconfig.json`).
- `apps/CLAUDE.md`: 스택·포트 표, 절대 규칙, 백엔드/프론트 컨벤션 요약, 기동 명령, 커밋 분류.
- `docs/30-dev/conventions.md` 작성(현행 코드에서 관찰되는 규칙을 적고, 바꾸기로 한 것은 "목표"로 표시).
- `dev.ps1` 작성(DB + 백엔드 + 프론트 각 새 창).
- **동작 변경 없음.** `tsc && vite build`, `gradlew build` 통과.
- **완료 기준**: 0단계 기동 확인이 새 경로에서 그대로 재현.

### 3단계 — 보안·설정 (`fix/보안-설정-정비`)

- **권한 모델**: 역할은 관리자 축(현행 `SYSTEM_ADMIN`·`OPERATION_ADMIN`·`GENERAL_ADMIN` 3코드 유지, 기존 세부 Permission 유지)과 회원 축(`USER`) 두 축. 관리자 3코드를 하나로 합치지 않는다(ADR-0003).
  - `/api/v1/admin/**` → `ROLE_ADMIN` 필수. 세부 권한은 기존 `Permission` 기반 메서드 보안(`@PreAuthorize`)으로.
  - `/api/v1/user/**`, `/api/v1/auth/withdraw`, 마이페이지 수정 → 인증 필수.
  - `/api/v1/public/**`, `/api/v1/auth/{login,signup}`, 파일 조회, `/uploads/**` → `permitAll`.
  - 현재 `permitAll`인 `/api/v1/{boards,posts,comments,menus,files,inquiries}/**`는 관리자 전용 엔드포인트이므로 `/api/v1/admin/...`으로 **경로 통일**한다(사용자 결정 2026-10-12). 단 `/api/v1/contents/**`(GET)는 사용자 고정 페이지(`/user/page/:contentKey`)가 비로그인으로 쓰는 공개 API이므로 `/api/v1/public/contents/...`로 옮긴다(2026-10-12 리뷰에서 발견). 결과적으로 API 접두어는 `admin`(관리자)·`user`(로그인 회원)·`public`(비로그인)·`auth`(로그인·가입) 네 가지만 남는다. 프론트 호출부 동시 수정.
  - `h2-console` 규칙 제거(H2 미사용).
- **비밀값**: 카카오·네이버·구글·Gmail·JWT 전부 **재발급** 후 환경변수(`${KAKAO_CLIENT_SECRET}` 등)로. `application.yml`에서 평문 제거. `.env.example` 제공. 로컬 실행은 `application-local.yml`(git 제외)로.
- 업로드 경로 `file.upload-dir`를 환경변수 기본값 `./uploads`로.
- CORS 허용 출처 환경변수화.
- ADR `0003-auth-jwt` 갱신(역할 모델 확정).
- **테스트 첫 도입**: `SecurityConfig` 규칙을 MockMvc로 검증하는 테스트(비로그인 admin API → 401/403, public → 200).
- **완료 기준**: 비로그인으로 관리자 API 호출 시 401. 저장소 어디에도 평문 비밀값 없음.

### 4단계 — 스키마 관리 (`build/flyway-도입`)

- Flyway 도입. `V1__init.sql`은 현재 엔티티가 만든 MySQL 스키마를 덤프해 정리한 것. `ddl-auto: validate`.
- `V2__seed_core.sql`: 역할·권한·관리자 메뉴·게시판 정의·초기 관리자 계정(비밀번호는 환경변수로 주입해 최초 기동 시 설정). 운영에도 필요한 데이터만.
- `DataInitializer`가 심던 가짜 샘플 콘텐츠(인테리어 예시·게시글·팝업)는 **폐기**한다. 실제 샘플은 형이 운영하던 블로그 글을 사용자가 나중에 제공하며, 관리자 화면으로 등록하거나 `V900__sample_data.sql`(local 전용, `spring.flyway.locations` 분기)로 넣는다. 그 시점에 형식을 정한다(사용자 결정 2026-10-12).
- `DataInitializer`·`RoleMigrationConfig` 삭제.
- `docs/30-dev/db-naming.md`(`TB_`·`IDX_`·`UK_`·`FK_`, 대문자 물리명, `_YN`·`_DT` 접미사 등 현행 규칙 명문화). ADR `0004-flyway-migration`.
- **완료 기준**: 빈 DB에서 기동 시 Flyway만으로 스키마·시드가 생성되고 관리자 로그인 가능.

### 5단계 — 기능 가이드 + 검증 (`docs/기능-가이드`)

- `docs/30-dev/guides/features/`: `00-공통`, `10-홈`, `20-로그인-인증`, `30-게시판`(공지·FAQ·자유게시판·댓글), `40-인테리어-갤러리`, `50-견적문의`, `60-마이페이지`, `70-admin`. 형식은 **URL·코드 위치 → 기능 → 사용 API → 테스트 체크포인트 → 의도적 미구현**. 코드에서 확인한 동작만 적는다.
- `.claude/skills/verify/SKILL.md`: 기동·포트·Playwright MCP 드라이브·DB 확인 방법.
- CLAUDE.md §컨벤션에 "기능을 바꾸면 가이드도 같이" 규칙 추가.
- 백엔드 서비스 테스트 추가(Member 가입/로그인, Inquiry 접수, Interior 조회). Testcontainers(MySQL) 사용. 커버리지 목표는 두지 않는다(1인 프로젝트, 핵심 흐름 우선).
- 프론트 ESLint 통과를 완료 조건에 포함(현재 `lint` 스크립트 있음).
- **완료 기준**: `verify` 스킬 절차로 features 체크포인트 전수 통과.

### 6단계 — 사용자 화면 완성도 (`design/사용자-화면-다듬기`)

- 시안 없이 **현재 화면을 다듬는다**(사용자 결정). `frontend-design` 스킬 기준으로 타이포·여백·색 토큰 정리, 모바일 대응, 헤더/푸터 일관성.
- 업체 정보(상호·연락처·주소·로고·소개문)는 형에게 받아 `docs/00-common/business.md`에 기록하고 화면에 반영. 받기 전까지는 현재 문구 유지.
- 견적문의 접수 시 관리자 메일 알림(기존 메일 인프라 재사용).
- 갤러리 이미지: 썸네일 생성 또는 업로드 시 리사이즈, 지연 로딩.
- SEO: 페이지별 `<title>`·meta description, `robots.txt`, `sitemap.xml`.
- 각 변경은 해당 `features/*.md` 동시 갱신.
- **완료 기준**: 모바일(360px)·데스크톱에서 전 화면 깨짐 없음. Lighthouse 접근성·SEO 90 이상.

### 7단계 — 관리자 화면 정리 (`refactor/관리자-화면-분할`)

- 400줄 이상 관리자 페이지를 목록/폼/훅으로 분할(동작 불변).
- 공통 패턴(검색바·테이블·모달 폼) `admin/components/`로 추출.
- `docs/30-dev/guides/admin-manual.md`: **형(비개발자)용** 관리자 사용법 — 게시글 올리기, 시공사례 등록, 문의 확인, 팝업 설정. 스크린샷 포함.
- **완료 기준**: 관리자 페이지 파일 300줄 이하. 형이 매뉴얼만 보고 시공사례 하나를 등록할 수 있음.

### 8단계 — 배포·운영 (`ci/배포-구성`)

- 서버는 이 단계 시작 시 ADR `0005-hosting`으로 결정(후보: 가정용 PC, Oracle Cloud 무료 티어, 저가 VPS). 설계 가정은 **단일 서버 + Docker Compose + nginx**.
- `deploy/`: `Dockerfile.backend`, 프론트 정적 빌드, `docker-compose.prod.yml`, nginx(정적 + `/api` 프록시 + `/uploads`), HTTPS(Let's Encrypt).
- GitHub Actions: PR마다 빌드·테스트·린트. main 머지 시 배포 워크플로(수동 승인).
- `docs/30-dev/runbook/`: 서버 초기 설정, 배포 절차, DB 백업·복구, 로그 위치, 도메인·인증서 갱신.
- **완료 기준**: 형이 실제 도메인으로 접속해 사용. 백업이 자동으로 돌고 복구 절차를 한 번 실연.

## 5. Git 규칙 (CLAUDE.md §Git의 원문이 될 내용)

- `main` 직접 작업·직접 push 금지. 파일 수정 전 `git branch --show-current` 확인, `main`이면 브랜치 먼저.
- 브랜치명 `type/한국어-케밥케이스`. type은 커밋 Type과 동일.
- 커밋 `[분류] type: 설명`.
  - 분류: `[공통]`(루트·`00-common`·설정), `[기획]`(`10-product`), `[개발]`(`apps/`·`30-dev`), `[디자인]`(사용자 화면 스타일), `[운영]`(`deploy/`·runbook·CI).
  - Type: `feat fix docs style design refactor test build ci perf chore rename remove`.
  - 끝에 `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- PR은 선택. 로컬 머지 후 push 허용.
- push·force push·브랜치 삭제·배포는 사용자 명시 요청 시에만. 훅 우회 금지.

## 6. 테스트·검증 전략

- **백엔드**: JUnit 5 + MockMvc + Testcontainers(MySQL). 3단계에서 보안 규칙 테스트로 시작, 5단계에서 핵심 서비스. 공유 DB에 테스트 금지.
- **프론트**: `tsc` + ESLint를 CI 게이트로. 단위 테스트는 두지 않는다(화면 검증은 `verify` 스킬 + Playwright MCP).
- **실기동**: `features/*.md` 체크포인트가 기대값, `verify` 스킬이 절차.
- **단계 완료 판정**: 각 단계의 "완료 기준"을 충족하고, 0단계 기동 확인이 재현될 때.

## 7. 오류·되돌리기

- 각 단계는 별도 브랜치라 머지 전 폐기 가능. 2단계(경로 이동)는 `git mv`만 써서 이력을 보존.
- 4단계 Flyway 전환 전 로컬 DB 덤프를 보관(`backend/db-backup/`, git 제외).
- 3단계 키 재발급은 되돌릴 수 없으므로 새 키를 환경변수에 넣고 기동 확인한 뒤 옛 키를 폐기한다.

## 8. 결정 사항 요약

| 결정 | 선택 | 근거 |
|---|---|---|
| 접근 | A. 제자리 재정비 | 동작하는 13개 도메인 보존, 단계별 머지 |
| 관리자 UI | React + antd 유지 | 이미 11개 화면 동작. Thymeleaf 전환은 비용만 큼 |
| 인증 | JWT 유지 | 현행 동작. 세션 전환은 이득 대비 비용 큼 |
| 스키마 | Flyway + validate | 운영 DB 생기기 전 확정 필요 |
| 디자인 | 현 화면 다듬기 | 시안·디자이너 없음 (사용자 결정) |
| docs 영역 | 00 / 10 / 30 | 20-design·90-internal은 당장 불필요 |
| 테스트 | 백엔드 중심, 프론트는 린트+실기동 | 1인 프로젝트, 핵심 흐름 우선 |
| 비밀값 | 3단계에서 재발급+환경변수화 | 사용자 결정: 당장은 보류 |
| 관리자 API 경로 | `/api/v1/admin/**`로 통일 | 접두어로 권한이 드러나야 SecurityConfig가 단순 |
| 샘플 데이터 | 형의 블로그 글을 사용자가 제공 | 코드 내 가짜 샘플 폐기 |

## 8-1. 개정 (2026-10-12, 0·1단계 실기동 검증 후 — 사용자 승인)

실제로 돌려본 뒤 "형이 쓰는 납품 사이트" 관점에서 순서·범위를 바꾼다. §4의 단계 번호는 유지하되 **실행 순서와 범위**를 아래로 대체한다.

| 순서 | 단계 | 변경 내용 |
|---|---|---|
| 1 | **3단계 보안 + CI** (2단계보다 먼저) | 비로그인 관리자 API 200, 비로그인 글쓰기 500이 실측됐다. 폴더 이동보다 먼저 막는다. **CI를 8단계에서 당겨** PR마다 gradle 빌드·npm 빌드·문서 링크 검사(GitHub Actions). 수동으로 잡은 wrapper 누락·tsc 오류·CKEditor 버전 사고를 자동으로 잡기 위함. |
| 2 | 2단계 구조 정리 | 변경 없음(`apps/` 이동, conventions, dev.ps1). |
| 3 | 4단계 Flyway | 변경 없음. |
| 4 | **4-1단계 블로그 이관(신규)** — 완료(2026-10-12) | 형의 네이버 블로그 `blog.naver.com/willer8046`(63건) 글·이미지를 갤러리로 옮기는 재실행 가능 스크립트([가이드](../../30-dev/guides/blog-import.md)). 로컬 이관 결과 현장시공 40·셀프시공 8·인테리어스토리 15, 이미지 1,052장. 카테고리 매핑(공구/자재→셀프시공, IOT·스케치업→스토리)은 **대표 확인 전 기본값** — 바꾸면 재실행으로 반영. 운영 배포 후 한 번 더 실행. |
| 5 | 5단계 기능 가이드·verify | 변경 없음. |
| 6 | **6단계 사용자 화면 — SEO 핵심** | 순수 SPA라 검색엔진이 빈 페이지를 본다. 공개 페이지(홈·갤러리 목록·상세·공지)를 **빌드 시 프리렌더**하고 페이지별 메타(title·description·og)를 넣는다. 번들(2.7MB) 코드 분리. **견적문의 알림**: 새 문의 시 운영자 메일 + 대시보드 "대기 문의 N건" 배지. 카카오 알림톡은 비용 때문에 보류. **결과(2026-10-12)**: 메타(`usePageMeta`)·robots·`/sitemap.xml`(백엔드 생성, 인테리어 상세 포함)·상세 딥링크·알림 메일·대시보드 집계·지연 로딩(첫 화면 JS 1.4MB→177KB)까지 완료. **빌드 시 프리렌더는 후속 과제** — 상세 63건을 빌드마다 API로 받아 정적 HTML을 만들려면 빌드가 백엔드에 의존하게 되어 8단계 배포 구조가 정해진 뒤 결정. |
| 7 | **7단계 관리자 — 형님용 5개 메뉴** | 기본 노출: 시공사례·공지·FAQ·견적문의·팝업. 메뉴/권한/게시판/관리자계정은 `SYSTEM_ADMIN`만. 통계·IP·공통코드 플레이스홀더와 `/admin/signup`(USER 계정만 만들어져 혼란)은 **삭제**. 화면 분할·운영 매뉴얼은 그대로. **결과(2026-10-12)**: V3 시드로 메뉴 트리 = 운영 6개(대시보드·시공사례·공지·FAQ·견적문의·팝업) + [커뮤니티·회원] + [시스템 관리(SYSTEM_ADMIN)]. 화면 9개를 폴더(index·columns·modal)로 분할(최대 220줄), 공통 컴포넌트 4개, 매뉴얼 `docs/30-dev/guides/admin-manual.md`(스크린샷 7장). 발견·수정: 게시글 페이지 이동 불가, 빈 화면(catch-all·ErrorBoundary), 대시보드 삭제 글 집계, antd 사용 중단 경고. 알려진 문제로 남김: 댓글 관리 화면 없음(기존부터), 관리자 본인 비밀번호 변경 화면 없음. |
| 8 | 8단계 배포 | CI는 이미 있으므로 배포 워크플로·runbook만. |

키 재발급(3단계)은 카카오·네이버·구글 콘솔 접근이 필요해 사용자가 수행한다. 그 전까지 코드는 `application-secret.yml`/환경변수 구조로 준비하고 현재 키로 동작시킨다.

## 9. 다음 단계

이 설계서 승인 후 `writing-plans` 스킬로 **0단계+1단계** 구현 계획을 먼저 작성한다. 2단계 이후는 앞 단계가 머지된 뒤 각각 계획을 쓴다(한 번에 다 쓰면 경로·규칙 변경으로 낡는다).
