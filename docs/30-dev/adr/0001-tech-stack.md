# 0001. 기술 스택: React SPA + Spring Boot 3 + MySQL, Gradle

- **Status**: accepted
- **Date**: 2026-10-12 (코드는 2026-02부터 이 스택으로 작성됨. 재정비 시점에 사후 기록)
- **Deciders**: 사용자

## Context

2026-02에 "AI를 모를 때" 만든 코드가 이미 13개 도메인·23개 화면으로 동작한다. 재정비(설계서 `docs/superpowers/specs/2026-10-12-project-restructure-design.md`)는 제자리 정비(A안)로 결정됐으므로, 스택은 **현행을 사실대로 기록**하고 바꾸지 않는다. 이전 ADR 7개는 전자정부 프레임워크·Thymeleaf·MyBatis 등 실제 코드와 다른 전제를 담고 있어 전부 폐기했다.

## Decision

| 축 | 결정 |
|----|------|
| 플랫폼 | 반응형 웹. 사용자(`/user/**`)와 관리자(`/admin/**`)가 한 SPA |
| 프론트엔드 | React 18 + Vite 5 + TypeScript 5 (strict) |
| 프론트 상태 | 서버 상태 TanStack Query 5 / 전역 Zustand 4 / 라우팅 React Router 6 |
| UI | 관리자 Ant Design 5 (→ ADR-0002) / 사용자 자체 CSS |
| 에디터 | CKEditor 5 (게시글·콘텐츠·인테리어 본문) |
| 백엔드 | Spring Boot 3.3, Java 21 (Gradle toolchain 자동 다운로드), Gradle 8.7, Lombok |
| 데이터 접근 | Spring Data JPA + QueryDSL 5 |
| DB | MySQL 8 (local). PostgreSQL 드라이버도 의존성에 있으나 사용 안 함 |
| 스키마 | Flyway(`db/migration`) + `ddl-auto: validate`, 물리명 소문자 (→ ADR-0004, 2026-10-12) |
| 인증 | JWT Bearer (→ ADR-0003) |
| 소셜 로그인 | 카카오·네이버·구글 OAuth code 교환을 서버가 수행 |
| 메일 | Spring Mail (Gmail SMTP) — 이메일 인증 코드 |
| 파일 | 로컬 디스크 업로드, `/uploads/**` 정적 서빙 |
| API 응답 | `ApiResponse<T>` `{ success, data, message }` + `PageResponse<T>`, 전역 `GlobalExceptionHandler` |
| 테스트 | 현재 0개 → **목표(3·5단계)**: JUnit 5 + MockMvc + Testcontainers(MySQL) |
| 패키지 매니저 | npm, `package-lock.json` 커밋(2026-10-12 — CKEditor 버전 사고 이후), 설치는 `npm ci` |
| 배포 | 미정 → ADR-0005(8단계) |

## Consequences

### 좋아지는 것
- 동작하는 코드를 그대로 쓴다. 문서와 코드가 일치한다.

### 나빠지는 것 / 트레이드오프
- PostgreSQL·H2 설정 잔재가 `application.yml`에 남아 있다(3단계에서 정리).
- OAuth·메일 비밀값은 `application-secret.yml`(git 제외) 또는 환경변수에서 읽는다(2026-10-12, GitHub 푸시 보호 대응). 유출됐던 키의 재발급은 3단계.
- 사용자 화면과 관리자 화면의 스타일 체계가 둘(자체 CSS vs antd)이다. 한 SPA 번들이라 사용자 화면에도 antd가 실린다 — 6단계에서 번들 분리 여부 검토.

### 후속 작업
- 4단계 Flyway, 3단계 보안·비밀값, 8단계 배포 ADR.

## Considered Alternatives

### Option A — the-empty-map처럼 Thymeleaf SSR 관리자 + Maven 멀티모듈
- Pros: 관리자 화면·API를 한 출처에서 서빙, 세션 인증 단순.
- Cons: 11개 관리자 화면을 다시 써야 한다. 1인 프로젝트에 비용 과다. (ADR-0002)
