# 0002. 관리자 UI는 React + Ant Design SPA를 유지한다

- **Status**: accepted
- **Date**: 2026-10-12
- **Deciders**: 사용자

## Context

참고 프로젝트(the-empty-map)는 관리자를 Thymeleaf SSR + Bootstrap으로 두고 "admin은 React 아님"을 절대 규칙으로 삼았다. 본 프로젝트는 이미 관리자 11개 화면(대시보드·게시판·게시글·메뉴·관리자회원·권한·콘텐츠·팝업·인테리어·문의·회원)이 React + antd로 동작하고, 운영자는 비개발자 한 명이다.

## Decision

관리자 UI는 **React + Ant Design SPA를 유지**한다. 사용자 화면과 같은 Vite 앱 안에 `/admin/**` 라우트로 둔다.

- 관리자 인증은 `adminAuthStore`(JWT) + `PermissionGuard`(프론트 메뉴 권한 가드). 서버 권한 강제는 ADR-0003(3단계 개정)에서.
- 관리자 화면 파일은 목록·폼·훅으로 분할한다(7단계). 파일당 300줄 이하가 목표.

## Consequences

### 좋아지는 것
- 재작성 비용 0. antd의 테이블·폼·모달로 CRUD 생산성이 높다.

### 나빠지는 것 / 트레이드오프
- 권한이 프론트에만 있으면 뚫린다 → 서버 `ROLE_*` 강제가 필수(3단계).
- 사용자 번들에 antd가 포함된다(6단계에서 code-splitting 검토).

### 후속 작업
- 3단계: `/api/v1/admin/**` 서버 권한 강제.
- 7단계: 화면 분할 + 운영자 매뉴얼.

## Considered Alternatives

### Option A — Thymeleaf SSR로 전환
- Pros: 동일 출처·세션·CSRF 기본 보호. 빌드 단계 없음.
- Cons: 11개 화면 재작성. CKEditor·동적 메뉴 트리 등을 서버 렌더로 다시 구현.

### Option B — 관리자를 별도 Vite 앱으로 분리
- Pros: 번들 분리.
- Cons: 공유 코드(api client·types) 관리 부담. 지금은 code-splitting으로 충분.
