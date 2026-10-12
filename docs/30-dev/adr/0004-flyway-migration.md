# 0004. 스키마는 Flyway가 소유하고, 물리명은 소문자 스네이크로 한다

- **Status**: accepted
- **Date**: 2026-10-12
- **Deciders**: 사용자

## Context

지금까지 스키마는 `ddl-auto: update`가, 기준 데이터(역할·권한·메뉴·게시판·관리자 계정)와 샘플 콘텐츠는 777줄짜리 `DataInitializer`가, 과거 컬럼 변경은 `RoleMigrationConfig`(자체 `DataSource` 빈 + JdbcTemplate DDL)가 각각 심었다. 운영 DB가 생기면 되돌리기 어려운 구조라 그 전에 바꿔야 했다(설계서 §4 4단계).

또 하나 확인된 사실: 코드의 `@Table(name = "TB_MEMBERS")` 같은 대문자 선언은 Spring Boot 기본 명명 전략(`CamelCaseToUnderscoresNamingStrategy`)이 **소문자로 변환**해 실제 테이블은 `tb_members`다. Windows MySQL은 대소문자를 구분하지 않아 드러나지 않았지만, Linux MySQL(Testcontainers·운영)에서는 수기 SQL의 대소문자가 어긋나면 "테이블 없음"이 된다.

## Decision

1. **Flyway가 스키마와 기준 시드를 소유한다.** `spring.flyway.locations=classpath:db/migration`, 모든 프로파일 `ddl-auto: validate`. 공유된 뒤의 `V{n}__*.sql`은 수정하지 않고 새 버전을 추가한다.
2. **물리명은 소문자 스네이크**(`tb_members`, `role_code`, `uk_members_lgn_id`, `idx_posts_board_id`, `fk_posts_boards`). 명명 전략은 바꾸지 않는다(선택지 a). 엔티티의 대문자 선언은 그대로 두되 새 코드는 소문자로 선언한다. 규칙 전문은 [db-naming.md](../db-naming.md).
3. **V1은 Hibernate가 만들던 DDL을 정리한 것**(mysqldump → 제약명 규칙화, AUTO_INCREMENT 카운터 제거, 유니크와 겹치는 인덱스 제거). **V2는 운영에도 필요한 기준 데이터만**: 역할 4·권한 16·역할권한 31·게시판 3·메뉴 30. 샘플 콘텐츠는 넣지 않는다(형 블로그 글로 대체 — 4-1단계).
4. **관리자 계정은 `AdminAccountInitializer`**(ApplicationRunner)가 만든다. BCrypt 해시를 SQL에 박지 않기 위해서다. 관리자 역할 계정이 하나도 없을 때만 `app.admin.initial-password`(`ADMIN_INITIAL_PASSWORD`)로 `admin`을 생성하고, 값이 비어 있으면 **기동을 실패**시킨다. 기본값 `1234`는 `local`·`test` 프로파일에만 있다.
5. `DataInitializer`·`RoleMigrationConfig`는 삭제한다. 자체 `DataSource` 빈이 사라져 Spring 기본 자동 구성을 쓴다.

## Consequences

### 좋아지는 것
- 빈 DB에서 기동하면 Flyway만으로 운영 가능한 상태가 된다. 통합 테스트가 매번 Linux MySQL에서 V1~V3을 적용하므로 마이그레이션 자체가 테스트된다.
- 운영 비밀번호가 코드에 없다.

### 나빠지는 것 / 트레이드오프
- 기존 로컬 DB(Flyway 이력 없음)는 그대로 쓸 수 없다. `docker compose down -v`로 비우고 올린다. 운영 DB는 아직 없어 baseline 전략을 두지 않았다.
- 엔티티의 `@Index`·`@Table(indexes=...)` 선언은 `validate` 모드에서 아무것도 만들지 않는 문서용이 됐다. 인덱스는 Flyway SQL이 정본이다.
- `validate`는 테이블·컬럼·타입만 본다. 인덱스·제약 누락은 테스트나 운영에서 드러난다.

### 후속 작업
- 4-1단계: 블로그 이관은 API 또는 `db/local/V900__*.sql`(local 전용 위치)로.
- 8단계: 운영 배포 시 `ADMIN_INITIAL_PASSWORD` 환경변수 필수 항목으로 runbook에.

## Considered Alternatives

### Option b — 명명 전략을 `PhysicalNamingStrategyStandardImpl`로 바꿔 대문자 물리명
- Pros: 코드 선언과 DB가 글자 그대로 일치. the-empty-map과 같은 방식.
- Cons: 기존 로컬 DB·`RoleMigrationConfig`·이미 커밋된 소문자 SQL과 전부 어긋남. 얻는 것이 "보기 좋음"뿐이라 기각.

### Option c — Liquibase
- Pros: XML/YAML 체인지셋, 롤백 지원.
- Cons: 1인 프로젝트에 과함. SQL 그대로 쓰는 Flyway가 단순.
