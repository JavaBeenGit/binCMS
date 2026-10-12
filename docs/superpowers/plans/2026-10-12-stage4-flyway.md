# 4단계 스키마 관리(Flyway) — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스키마와 핵심 시드를 Flyway 마이그레이션으로 관리하고(`ddl-auto: validate`), 코드로 스키마·샘플을 심던 `DataInitializer`·`RoleMigrationConfig`를 없앤다. 빈 DB에서 기동하면 Flyway만으로 테이블·역할·권한·메뉴·게시판이 생기고 관리자로 로그인된다.

**Architecture:** `V1__init.sql`은 현재 Hibernate가 생성한 DDL(mysqldump)을 정리한 것(물리명 **소문자**, 제약명 규칙화, AUTO_INCREMENT 카운터 제거). `V2__seed_core.sql`은 운영에도 필요한 기준 데이터(역할 4·권한 16·역할권한 31·게시판 3·메뉴 30). 관리자 계정은 BCrypt가 필요하므로 `AdminAccountInitializer`(ApplicationRunner)가 `app.admin.initial-password`로 최초 1회 생성. 통합 테스트는 Flyway가 만든 스키마 위에서 돌아 Linux MySQL에서 V1·V2를 검증한다.

**Tech Stack:** Flyway 10(Spring Boot 3.3 BOM) + `flyway-mysql`, MySQL 8.4, Testcontainers.

**Spec:** [`docs/superpowers/specs/2026-10-12-project-restructure-design.md`](../specs/2026-10-12-project-restructure-design.md) §4 4단계, §8-1.

## Global Constraints

- 브랜치 `build/flyway-도입`(refactor/apps-구조-정리에서 분기). 커밋 `[개발] build|feat|docs|remove: ...`.
- **물리명은 소문자 스네이크**(ADR-0004로 결정). `@Table/@Column`의 대문자 선언은 Spring 명명 전략이 소문자로 바꾸므로 코드 수정 없이 유지.
- 샘플 콘텐츠(인테리어·게시글·팝업 예시)는 시드하지 않는다(사용자 결정: 형 블로그 글로 대체).
- 공유된 뒤의 `V{n}__*.sql`은 수정 금지. 지금은 첫 공유 전이라 V1·V2를 자유롭게 고친다.
- 로컬 Docker DB는 Flyway 이력이 없으므로 `docker compose down -v`로 비우고 다시 올린다(운영 DB 없음).

## Review Focus

- Hibernate `validate`가 enum(`category`, `menu_type`)·`bit(1)`·`longtext`·`datetime(6)` 타입을 V1과 비교해 통과해야 한다. → Task 1 테스트(컨텍스트 로딩 = validate 통과).
- 빈 DB 기동 → `admin/1234` 로그인 → 관리자 메뉴 21개·사용자 메뉴 9개·게시판 3개. → `FlywayMigrationTest` + 실기동.
- `ADMIN_INITIAL_PASSWORD`를 주지 않은 운영 기동은 **거부**(기본값은 local·test 프로파일에만). → Task 1 Runner 로직 + 테스트.
- 기존 Docker DB(이력 없음)에 그대로 기동하면 Flyway가 명확한 오류로 멈춰야 한다(조용히 baseline 하지 않음). → Task 3 실기동에서 확인 후 `down -v`.

---

### Task 1: Flyway 도입 (RED → GREEN)

**Files:**
- Create: `apps/backend/src/test/java/com/bincms/db/FlywayMigrationTest.java` (RED)
- Modify: `apps/backend/build.gradle` (`flyway-core`, `flyway-mysql`)
- Modify: `apps/backend/src/main/resources/application.yml` (flyway 설정, `ddl-auto: validate` 전 프로파일, `app.admin.initial-password`)
- Modify: `apps/backend/src/test/resources/application-test.yml` (`ddl-auto` 줄 제거, `app.admin.initial-password: 1234`)
- Create: `apps/backend/src/main/resources/db/migration/V1__init.sql`, `V2__seed_core.sql`
- Create: `apps/backend/src/main/java/com/bincms/config/AdminAccountInitializer.java`
- Delete: `apps/backend/src/main/java/com/bincms/config/DataInitializer.java`, `RoleMigrationConfig.java`

- [ ] RED: `FlywayMigrationTest` — `flyway_schema_history`에 버전 1·2 성공 행, `tb_roles` 4건·`tb_permissions` 16건·`tb_role_permissions` 31건·`tb_boards` 3건·`tb_menus` 30건(ADMIN 21·USER 9), `admin` 회원이 SYSTEM_ADMIN. 실행 → 컨텍스트/테이블 없음으로 실패.
- [ ] V1·V2 생성(덤프 → 정리 스크립트), 의존성·설정, Runner 작성, 초기화 클래스 삭제.
- [ ] GREEN: `gradlew.bat test` 전부(기존 `SecurityRulesTest` 7 + 신규).
- [ ] 커밋 2개: `[개발] build: Flyway 도입 — V1 스키마·V2 기준 시드, ddl-auto validate` / `[개발] remove: DataInitializer·RoleMigrationConfig 삭제, 관리자 계정 Runner로 대체`.

### Task 2: 문서

- [ ] ADR-0004 `flyway-migration`: Flyway 채택, 물리명 소문자 결정(선택지 a), 시드 범위, 관리자 비밀번호 환경변수.
- [ ] `db-naming.md` 전면 개정: 소문자 규칙, `@Index` 선언은 문서용(validate는 인덱스를 만들지 않음), 예외 목록 → V1에서 정리된 결과로 교체.
- [ ] `dev-setup.md`: 기동 전 `down -v`, `ADMIN_INITIAL_PASSWORD`, 시드 설명(`DataInitializer` 문구 제거). `conventions.md`·`apps/CLAUDE.md`의 목표(4단계) 문구 갱신. `CLAUDE.md` §7.
- [ ] 커밋 `[개발] docs: Flyway 전환을 ADR-0004·db-naming·가이드에 반영`.

### Task 3: 실기동 검증 + push

- [ ] 기존 Docker DB에 그대로 기동 → Flyway 오류로 중단 확인(로그) → `docker compose down -v && up -d --wait` → 기동 → 로그인·메뉴·게시판·공개 API 확인 → 공지 작성 1건(스키마 쓰기 확인).
- [ ] `gradlew.bat build` 0, 링크 검사 0 → push.
