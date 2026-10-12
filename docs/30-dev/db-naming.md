# DB 오브젝트 명명 규칙

> 정본. JPA `@Table`/`@Column`·네이티브 SQL·Flyway SQL(4단계) 모두 이 규칙을 따른다. 2026-02-05 ADR-0007(삭제됨)에서 이관, 2026-10-12 현재 코드로 검증.

## 테이블

- 접두어 `TB_` + **대문자 스네이크** + **복수형**. 예: `TB_MEMBERS`, `TB_BOARDS`, `TB_POSTS`, `TB_INTERIORS`, `TB_ROLE_PERMISSIONS`.
- 엔티티 클래스는 단수(`Member`) ↔ 테이블은 복수(`TB_MEMBERS`).

## 컬럼

- 대문자 스네이크. 예: `EMAIL`, `PHONE_NUMBER`, `THUMBNAIL_URL`.
- PK는 `ID`(BIGINT, IDENTITY).
- FK는 `참조테이블단수_ID`. 예: `ROLE_ID`, `BOARD_ID`.
- 접미사 규칙:
  - 여부 `_YN` (`USE_YN`, `DEL_YN`; 값 `'Y'`/`'N'`, `CHAR(1)`)
  - 일시 `_DT` (`REG_DT`, `MOD_DT`)
  - 코드 `_CODE` (`ROLE_CODE`, `PERM_CODE`, `BOARD_CODE`)
  - 순서 `SORT_ORDER`, 카운트 `_COUNT` (`VIEW_COUNT`)
- 공통 감사 컬럼(`BaseEntity` 상속 테이블): `REG_DT`(등록일시, not null), `MOD_DT`(수정일시, not null), `REG_NO`(등록자 loginId, varchar 100), `MOD_NO`(수정자). 현재 `EmailVerification`·`RolePermission`은 `BaseEntity`를 상속하지 않아 감사 컬럼이 없다.
- 약어는 기존 것만 쓴다: `LGN_ID`(로그인 ID), `REG`/`MOD`(등록/수정), `PERM`(권한). 새 약어를 만들지 않는다.

## 인덱스·제약

| 종류 | 형식 | 예 |
|---|---|---|
| 인덱스 | `IDX_테이블명(접두어 제외)_컬럼` | `IDX_INTERIORS_CATEGORY` |
| 유니크 | `UK_테이블명_컬럼` | `UK_MEMBERS_LGN_ID` |
| FK | `FK_자식테이블_부모테이블` | `FK_MEMBERS_ROLES` |

(현재 코드는 유니크를 `@Column(unique = true)`로, FK를 JPA 기본 이름으로 생성한다. `Role`·`Permission`은 여기에 `@Index(unique = true)`까지 겹쳐 유니크가 이중 정의돼 있다. 4단계 Flyway `V1__init.sql`에서 위 이름으로 정리하는 것이 목표.)

## enum

- Java enum은 `@Enumerated(EnumType.STRING)`, 컬럼은 `VARCHAR(20~30)`. 예: `CATEGORY` ← `InteriorCategory.ONSITE`.

## 현재 예외 (고칠 것, 4단계)

2026-10-12 엔티티 grep 결과. Hibernate가 선언된 이름을 그대로 일관되게 쓰므로 지금은 동작하지만, Linux MySQL(권장 Docker 경로 포함)은 테이블명 대소문자를 구분하므로 수기 SQL·Flyway에서 섞어 쓰면 깨진다. 4단계 `V1__init.sql`에서 통일한다.

- `Inquiry` — `@Table(name = "tb_inquiries")` **소문자**. → `TB_INQUIRIES`.
- `EmailVerification` — 인덱스 `idx_email_verifications_email`, `idx_email_verifications_email_code` **소문자**. → `IDX_EMAIL_VERIFICATIONS_EMAIL`, `IDX_EMAIL_VERIFICATIONS_EMAIL_CODE`.
- `RolePermission` — 인덱스 `IDX_RP_ROLE_ID`, `IDX_RP_PERM_ID`가 테이블명을 `RP`로 축약. → `IDX_ROLE_PERMISSIONS_ROLE_ID`, `IDX_ROLE_PERMISSIONS_PERM_ID`.
- `Member` — 인덱스 `IDX_MEMBERS_LOGIN_ID`인데 컬럼은 `LGN_ID`. → `IDX_MEMBERS_LGN_ID`.
- `Board` — 인덱스 `IDX_BOARDS_CODE`인데 컬럼은 `BOARD_CODE`. → `IDX_BOARDS_BOARD_CODE`.
- `Permission` — 인덱스 `IDX_PERMISSIONS_CODE`인데 컬럼은 `PERM_CODE`. → `IDX_PERMISSIONS_PERM_CODE`.
