# 코딩 컨벤션 — binCms

> 2026-10-12 현재 코드에서 관찰되는 규칙을 적고, 아직 지켜지지 않는 것은 **목표(N단계)**로 표시한다. 결정 배경은 [`adr/`](adr/). 요약본은 [`apps/CLAUDE.md`](../../apps/CLAUDE.md).

## 백엔드 (Spring Boot 3.3 · JPA · QueryDSL)

### 구조
- 계층: `Controller → Service → Repository`. 서비스가 트랜잭션 경계(`@Transactional`, 조회는 `readOnly = true`).
- 패키지: `com.bincms.domain.{도메인}.{controller|service|repository|entity|dto}`. 도메인 13개(board, post, comment, content, popup, interior, inquiry, file, email, oauth, member, role, menu). 공통(`common`: dto·entity·exception·security·controller), 설정(`config`).
- 컨트롤러 이름·경로는 접두어와 1:1: `AdminXxxController` → `/api/v1/admin/xxx`, `PublicXxxController` → `/api/v1/public/xxx`, `UserXxxController` → `/api/v1/user/xxx`. 인증은 `AuthController` → `/api/v1/auth`.

### API 계약
- 응답은 항상 `ApiResponse<T>`: `{ success, data, message, error, timestamp }`. 성공 `ApiResponse.success(data[, message])`, 실패는 예외로 던지고 `GlobalExceptionHandler`가 `ApiResponse.error(code, message)`로 변환.
- 목록은 `PageResponse<T>`(`content, pageNumber, pageSize, totalElements, totalPages, ...`). 페이징 파라미터 `page`(0부터)·`size`.
- 오류 코드는 `ErrorCode` enum(`C001`~ 공통, `MB`·`CO`·… 도메인 접두). 인증 없음 `C004`(401), 권한 없음 `C005`(403).
- 요청 DTO는 `@Valid` + Bean Validation(`@NotBlank`, `@Pattern`). 검증 실패는 400.
- 엔티티를 컨트롤러 응답에 직접 쓰지 않는다. `XxxResponse.from(entity)` 정적 팩토리.

### 코드 스타일
- Lombok: 엔티티 `@Getter @NoArgsConstructor(access = PROTECTED)` + `@Builder` 생성자. DTO는 `@Getter @NoArgsConstructor`(요청) / `@Getter @Builder`(응답). 의존성은 `@RequiredArgsConstructor` 생성자 주입만.
- 엔티티 상태 변경은 의미 있는 메서드(`activate()`, `deactivate()`, `update(...)`, `increaseViewCount()`)로. setter 없음.
- 공통 감사 컬럼은 `BaseEntity`(`regDt`, `modDt`, `regNo`, `modNo`; `AuditConfig`의 `AuditorAware`가 JWT principal(loginId)을 넣음).
- 로그는 `@Slf4j`. 사용자 입력·토큰을 로그에 남기지 않는다.
- **목표(4단계)**: 스키마는 Flyway. 지금은 `ddl-auto: update` + `DataInitializer`.
- **목표(5단계)**: 핵심 서비스 단위·통합 테스트. 지금은 `SecurityRulesTest`뿐.

### 보안
- JWT Bearer, STATELESS, CSRF 비활성(헤더 인증이라 허용). 규칙은 [ADR-0003](adr/0003-auth-jwt.md).
- 비밀값은 `application-secret.yml`(git 제외) 또는 환경변수. `application.yml`에는 `${KEY:}` 플레이스홀더만.

## 프론트엔드 (React 18 · Vite 5 · TypeScript)

### 구조
```
src/
├── admin/     layouts/AdminLayout · pages/*Management.tsx · pages/auth/{Login,Signup}
├── user/      layouts/UserLayout · pages/* · components/*
├── shared/    api/{client.ts,types.ts,endpoints/*} · stores/{authStore,adminAuthStore} · components · constants · utils
├── App.tsx    라우트 정의(관리자 /admin/**, 사용자 /user/**)
└── main.tsx   QueryClientProvider
```
- import는 `@/` 절대경로. 같은 폴더의 css·형제 컴포넌트만 `./`. `../` 금지.
- 화면 파일명 = 컴포넌트명(PascalCase). css는 같은 이름으로 옆에.

### 상태·데이터
- 서버 상태: React Query. 쿼리 키는 `['도메인', 식별자/파라미터]`. 변경 후 `invalidateQueries`.
- 전역 상태: Zustand(`persist`로 토큰 보관). 회원과 관리자 스토어가 분리돼 있고 `client.ts`가 현재 경로(`/admin` 여부)로 토큰을 고른다.
- API 엔드포인트는 `shared/api/endpoints/<도메인>.ts`에 `xxxApi` 객체로. 경로는 접두어 포함 상대경로(`/admin/posts`, `/public/posts`, `/user/posts`).

### UI
- 관리자: antd 5(`Table`·`Form`·`Modal`·`message`). 사용자: 자체 CSS, antd는 `message`·`Dropdown` 등 최소.
- 에디터: CKEditor 5 `47.4.0` 고정, `licenseKey: 'GPL'`, 이미지 업로드는 `shared/utils/ckEditorUploadAdapter.ts` → `/api/v1/user/files/upload`.
- **목표(5단계)**: ESLint 설정 파일 추가(현재 `npm run lint` 실패), OpenAPI 타입 자동 생성.
- **목표(6단계)**: 번들 분리(antd·CKEditor를 관리자 청크로), 공개 페이지 프리렌더·메타태그.

## 테스트

- 백엔드: JUnit 5 + MockMvc + Testcontainers(MySQL 8.4). `AbstractIntegrationTest` 상속, `test` 프로파일(`src/test/resources/application-test.yml`), 시드된 `admin/1234`로 토큰 획득. Docker 필요. 공유 DB 금지.
- 프론트: 단위 테스트 없음. 빌드(`tsc`) + 실기동 검증(Playwright MCP, 5단계 `verify` 스킬).
- CI: PR마다 백엔드 `build`(테스트 포함)·프론트 `build`·문서 링크 검사.

## Git

- 브랜치 `type/한국어-케밥케이스`, 커밋 `[분류] type: 설명`, main 직접 커밋 금지. 전문은 루트 [`CLAUDE.md`](../../CLAUDE.md) §5.
- 동작 변경과 구조 변경은 커밋 분리. 이동은 `git mv`.
