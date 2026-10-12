# 0003. 인증은 JWT Bearer, 역할은 SYSTEM/OPERATION/GENERAL_ADMIN + USER

- **Status**: accepted (3단계에서 권한 강제 규칙을 이 문서에 개정 예정)
- **Date**: 2026-10-12
- **Deciders**: 사용자

## Context

현행 코드: `POST /api/v1/auth/login` → `LoginResponse { accessToken, tokenType: "Bearer", member }`. `JwtTokenProvider`가 subject=loginId, claim `role`=역할 코드로 24시간(local) 토큰을 발급하고, `JwtAuthenticationFilter`가 `Authorization: Bearer`를 읽어 `ROLE_<role>` 권한 하나를 부여한다. 세션은 STATELESS, CSRF 비활성.

역할(`TB_ROLES.ROLE_CODE`): `SYSTEM_ADMIN`(전체), `OPERATION_ADMIN`(시스템 메뉴 제외), `GENERAL_ADMIN`(기본 관리), `USER`(회원). 역할↔권한(`TB_PERMISSIONS.PERM_CODE` = `MENU_*`) 매핑은 `TB_ROLE_PERMISSIONS`. 프론트 `PermissionGuard`가 메뉴 권한으로 라우트를 가린다.

**문제**: `SecurityConfig`가 `/api/v1/admin/**`를 포함해 거의 모든 경로를 `permitAll`로 열어 두어, 서버는 권한을 강제하지 않는다.

## Decision

- 인증 방식은 **JWT Bearer를 유지**한다(세션 전환은 프론트 전체 수정 대비 이득 없음).
- 역할 모델은 **두 축**이다: 관리자 축(`SYSTEM_ADMIN`·`OPERATION_ADMIN`·`GENERAL_ADMIN` 3코드, 모두 `isAdmin()`, 시스템 메뉴는 `SYSTEM_ADMIN`만)과 회원 축(`USER`). 설계서 §4 3단계의 "ADMIN과 USER 두 축"은 이 뜻이며, 관리자 3코드를 하나로 합치지 않는다. 세부 메뉴 권한은 기존 `Permission` 기반으로 유지.
- **서버 권한 강제(3단계 목표)**: URL 접두어로 요구 권한이 결정된다.

  | 접두어 | 요구 |
  |---|---|
  | `/api/v1/admin/**` | `ROLE_SYSTEM_ADMIN` 또는 `ROLE_OPERATION_ADMIN` 또는 `ROLE_GENERAL_ADMIN` |
  | `/api/v1/user/**` | 인증(아무 역할) |
  | `/api/v1/public/**`, `/api/v1/auth/login`, `/api/v1/auth/signup`, `/uploads/**`, `/api/v1/health` | 익명 허용 |

  현재 `/api/v1/{boards,posts,comments,menus,files,inquiries}/**`처럼 접두어 없는 관리자 엔드포인트는 3단계에서 `/api/v1/admin/...`으로 **경로 통일**한다(설계서 §4 3단계, 사용자 결정 2026-10-12). **예외**: `/api/v1/contents/**`(`ContentController`의 GET 목록·카테고리·`key/{contentKey}`)는 사용자 화면 `/user/page/:contentKey`(`ContentPage.tsx`, `publicContentApi`)가 비로그인으로 호출하는 공개 API이므로 `/api/v1/public/contents/...`로 옮긴다. 관리자용은 이미 `/api/v1/admin/contents`(`AdminContentController`)에 있다.

## Consequences

### 좋아지는 것
- 접두어만 보면 권한이 드러나 `SecurityConfig`가 짧아진다.

### 나빠지는 것 / 트레이드오프
- JWT는 서버에서 강제 만료가 안 된다 → 운영 토큰 만료 1시간(prod 설정 유지), 탈퇴·차단은 `ACTIVE` 플래그를 필터에서 확인(3단계).
- CSRF 비활성은 Bearer 헤더 방식이라 허용. 쿠키로 바꾸면 재검토.

### 후속 작업
- 3단계: `SecurityConfig` 재작성, 경로 통일, 보안 규칙 MockMvc 테스트, 비밀값 환경변수화.

## Considered Alternatives

### Option A — Spring Security 세션 쿠키 + 폼 로그인 (the-empty-map 방식)
- Pros: 강제 로그아웃·CSRF 기본 보호.
- Cons: 프론트 인증 저장소·axios 인터셉터·OAuth 콜백 전면 수정.
