# DB 오브젝트 명명 규칙

> 정본. Flyway SQL(`apps/backend/src/main/resources/db/migration/`)·네이티브 SQL·새 엔티티 선언 모두 이 규칙을 따른다. 2026-10-12 ADR-0004로 **소문자 스네이크**를 물리명으로 확정(그 전 문서는 대문자였으나 실제 DB는 처음부터 소문자였다).

## 왜 소문자인가

Spring Boot 기본 명명 전략(`CamelCaseToUnderscoresNamingStrategy`)이 `@Table(name = "TB_MEMBERS")`를 `tb_members`로 바꿔 생성한다. Linux MySQL은 테이블명 대소문자를 구분하므로 수기 SQL은 반드시 소문자로 쓴다. 기존 엔티티의 대문자 선언은 동작에 영향이 없어 그대로 두되, **새 선언은 소문자로** 한다.

## 테이블

- 접두어 `tb_` + 소문자 스네이크 + **복수형**. 예: `tb_members`, `tb_boards`, `tb_posts`, `tb_interiors`, `tb_role_permissions`.
- 엔티티 클래스는 단수(`Member`) ↔ 테이블은 복수(`tb_members`).
- 테이블 `COMMENT`에 한국어 이름을 적는다(V1 참고).

## 컬럼

- 소문자 스네이크. 예: `email`, `phone_number`, `thumbnail_url`.
- PK는 `id`(bigint, AUTO_INCREMENT). 예외: `tb_email_verifications.verification_id`(기존 — 바꾸지 않는다).
- FK는 `참조테이블단수_id`. 예: `role_id`, `board_id`, `post_id`, `parent_id`(자기참조).
- 접미사:
  - 여부 `_yn` (`use_yn`, `notice_yn`; `varchar(1)` `'Y'`/`'N'`). 불리언 컬럼(`active`, `email_verified`, `verified`)은 `bit(1)` — 새 컬럼은 둘 중 `_yn`을 쓴다.
  - 일시 `_dt` (`reg_dt`, `mod_dt`, `start_dt`, `end_dt`), 시각 `_at`은 기존 `tb_email_verifications`에만 있다(새로 쓰지 않는다).
  - 코드 `_code` (`role_code`, `perm_code`, `board_code`), 순서 `sort_order`, 카운트 `_count` (`view_count`).
- 공통 감사 컬럼(`BaseEntity` 상속 테이블): `reg_dt`·`mod_dt`(not null), `reg_no`·`mod_no`(등록·수정자 loginId, varchar 100). `tb_email_verifications`·`tb_role_permissions`는 상속하지 않는다.
- 약어는 기존 것만: `lgn_id`(로그인 ID), `reg`/`mod`, `perm`. 새 약어를 만들지 않는다.
- enum 컬럼은 MySQL `enum('A','B')` 타입(Hibernate 6가 `@Enumerated(STRING)`를 그렇게 만든다). 값 추가는 `ALTER TABLE ... MODIFY` 마이그레이션.

## 인덱스·제약 (V1에 적용된 규칙)

| 종류 | 형식 | 예 |
|---|---|---|
| 유니크 | `uk_<table>_<col>[_<col>]` | `uk_members_lgn_id`, `uk_role_permissions_role_id_perm_id` |
| 인덱스 | `idx_<table>_<col>[_<col>]` | `idx_posts_board_id`, `idx_files_ref_type_ref_id` |
| FK | `fk_<child>_<parent>`(자기참조는 `fk_<table>_parent`) | `fk_posts_boards`, `fk_comments_parent` |

`<table>`은 `tb_` 접두어를 뺀 이름. 유니크가 있는 컬럼에 같은 컬럼의 일반 인덱스를 또 두지 않는다.

## 엔티티 선언과의 관계

- `ddl-auto: validate`는 **테이블·컬럼·타입만** 검사한다. 엔티티의 `@Index`·`indexes = {...}`·`unique = true`는 아무것도 만들지 않는 문서용이다. **인덱스·제약의 정본은 Flyway SQL**이다.
- 새 테이블을 만들 때: (1) `V{n}__*.sql`에 위 규칙으로 DDL, (2) 엔티티는 소문자 `@Table`/`@Column`, (3) `gradlew.bat test`로 validate 통과 확인.

## 마이그레이션 파일

- `V{n}__{설명}.sql` (언더스코어 2개, 설명은 영문 소문자 스네이크). 현재 `V1__init`, `V2__seed_core`.
- 공유된 파일은 수정하지 않는다. 데이터 보정도 새 버전으로.
- local 전용(샘플 등)은 `db/local/`에 두고 `spring.flyway.locations`에 프로파일별로 추가한다(아직 사용 안 함).
