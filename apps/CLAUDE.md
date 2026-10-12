# CLAUDE.md — apps/ (코드 레이어 진입 안내)

이 파일은 **코드(백엔드 + 프론트엔드) 작업**의 진입 안내서다. 루트 [`../CLAUDE.md`](../CLAUDE.md) §2에서 코드 요청이 이리로 온다. 결정의 **정본은 ADR·컨벤션 문서**이고, 이 문서는 그것을 이 스택에 맞게 요약하고 어디를 볼지 가리킨다 — ADR 내용을 베끼지 않는다.

## 1. 정체 — 무엇이 어디서 도나

| 영역 | 스택 | 포트 | 비고 |
|------|------|------|------|
| `backend/` | Spring Boot 3.3 · Java 21(Gradle toolchain 자동) · Gradle 8.7 · JPA + QueryDSL · JWT | 8080 | 단일 모듈, 패키지 `com.bincms` |
| `frontend/` | React 18 · Vite 5 · TypeScript strict · React Router · TanStack Query · Zustand · antd(관리자) · CKEditor 5 | 3000 | `/api`·`/uploads`는 Vite 프록시 → 8080 |
| DB | MySQL 8 (Docker compose `backend/docker-compose.yml`, 3307) | 3307 | 네이티브 3306도 가능 ([dev-setup](../docs/30-dev/guides/dev-setup.md) §2) |

스택 근거: [ADR-0001](../docs/30-dev/adr/0001-tech-stack.md). 관리자 UI가 React인 이유: [ADR-0002](../docs/30-dev/adr/0002-admin-react-spa.md).

## 2. 절대 규칙 (어기면 리뷰 리젝트)

- **API 접두어 4종만**: `/api/v1/admin/**`(관리자 3역할) · `/api/v1/user/**`(로그인 회원) · `/api/v1/public/**`(익명) · `/api/v1/auth/**`. 새 컨트롤러는 이 중 하나로 시작한다. 서버가 역할을 강제하고 401/403을 `ApiResponse` JSON으로 돌려준다 ([ADR-0003](../docs/30-dev/adr/0003-auth-jwt.md)). 프론트 `PermissionGuard`는 메뉴 노출용일 뿐 보안 장치가 아니다.
- **비밀값 하드코딩·커밋 금지.** 로컬은 `backend/application-secret.yml`(git 제외, 예시 `application-secret.example.yml`), 운영은 환경변수. GitHub 푸시 보호가 평문 키 커밋을 거부한다.
- **동작 변경과 구조 변경(이동·리네임)을 한 커밋에 섞지 않는다.**
- **DB 오브젝트 이름은 소문자 스네이크** — [db-naming.md](../docs/30-dev/db-naming.md). 새 테이블·컬럼은 Flyway SQL이 정본이고 엔티티의 `@Index` 선언은 문서용이다([ADR-0004](../docs/30-dev/adr/0004-flyway-migration.md)).
- **테스트는 공유 DB에 붙지 않는다.** 통합 테스트는 Testcontainers(MySQL) — `AbstractIntegrationTest`를 상속.
- **절대 주소 금지**: 프론트는 상대경로 `/api/...`만. `localhost:8080` 하드코딩 금지.

## 3. 백엔드 컨벤션 (요약 — 전체는 [conventions.md](../docs/30-dev/conventions.md))

- 계층 `Controller → Service → Repository`, 패키지는 **도메인 기반** `com.bincms.domain.{도메인}.{controller|service|repository|entity|dto}`. 공통은 `com.bincms.common`, 설정은 `com.bincms.config`.
- 컨트롤러는 접두어별로 분리: `AdminXxxController`(`/admin`), `PublicXxxController`(`/public`), `UserXxxController`(`/user`).
- **DTO ↔ Entity 분리**(엔티티를 컨트롤러 밖으로 노출 금지), **생성자 주입만**(`@RequiredArgsConstructor`).
- **표준 응답 엔벨로프** `ApiResponse<T>` `{ success, data, message, error, timestamp }`, 목록은 `PageResponse<T>`. 오류는 `BusinessException(ErrorCode)` → `GlobalExceptionHandler`. 오류를 조용히 삼키지 않는다.
- 엔티티는 `BaseEntity`(감사 컬럼) 상속, `@Builder` + `protected` 기본 생성자, 상태 변경은 의미 있는 메서드(`activate()`, `update(...)`)로.

## 4. 프론트엔드 컨벤션 (요약)

- 폴더: `src/admin/`(관리자 화면·레이아웃), `src/user/`(사용자 화면·레이아웃·컴포넌트), `src/shared/`(`api/`·`stores/`·`components/`·`constants/`·`utils/`). **기능별 응집** — 타입별 폴더(`pages/`, `layouts/`)를 루트에 두지 않는다.
- import는 **`@/` 절대경로**(`@/shared/api/endpoints/post`). 같은 폴더의 css·형제 파일만 `./`. `../`는 쓰지 않는다.
- 서버 상태는 **React Query**(`useQuery`/`useMutation`), 클라 전역은 **Zustand**(`shared/stores/authStore`=회원, `adminAuthStore`=관리자). 직접 fetch 후 `useState`에 담지 않는다.
- API 호출은 `shared/api/client.ts`(axios, 토큰 자동 첨부, 401→로그인 이동, 403→안내)를 통해서만. 엔드포인트는 `shared/api/endpoints/*.ts`에 도메인별로.
- UI: 관리자는 antd, 사용자는 자체 CSS(파일명 = 컴포넌트명). CKEditor는 `47.4.0` 고정(LTS 47.7+는 GPL 키 거부). `package-lock.json`은 커밋 — `npm ci`로 설치.
- 타입: `shared/api/types.ts` + 각 endpoints 파일의 `interface`(수기). OpenAPI 자동 생성은 목표(5단계).

## 5. 빌드 · 기동 · 테스트

- **전체 기동**: 루트 [`../dev.ps1`](../dev.ps1) — Docker MySQL + 백엔드 + 프론트를 각 새 창에서. 상세·네이티브 DB·알려진 문제는 [dev-setup.md](../docs/30-dev/guides/dev-setup.md).
- 백엔드만: `cd apps/backend && DB_PORT=3307 ./gradlew.bat bootRun` (PowerShell: `$env:DB_PORT=3307`).
- 프론트만: `cd apps/frontend && npm ci && npm run dev`.
- **테스트**: `apps/backend/gradlew.bat test` (Docker 필요). 회귀 기준은 `gradlew.bat build` + `npm run build` + `node scripts/check-doc-links.mjs` — CI([`.github/workflows/ci.yml`](../.github/workflows/ci.yml))가 PR마다 같은 것을 돌린다.
- 로컬 관리자 `admin/1234`(`AdminAccountInitializer`, local 기본값). 스키마·시드는 Flyway `db/migration/`이 소유 — 테이블을 바꾸려면 새 `V{n}__*.sql`을 추가하고 `gradlew.bat test`로 validate를 확인한다.

## 6. 커밋 / 협업

- 앱 코드·`docs/30-dev/`는 `[개발]`, CI·배포는 `[운영]`. 형식과 브랜치 규칙은 루트 [`../CLAUDE.md`](../CLAUDE.md) §5.
- 화면·API의 사용자 가시 동작을 바꾸면 [`docs/10-product/sitemap.md`](../docs/10-product/sitemap.md)(5단계부터는 `features/` 가이드)를 같은 브랜치에서 고친다.
