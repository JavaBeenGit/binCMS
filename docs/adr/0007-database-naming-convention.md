# ADR-0007: 데이터베이스 테이블 명명 규칙

## Status
Accepted

## Date
2026-02-05

## Context
데이터베이스 테이블과 컬럼의 명명 규칙을 표준화하여 일관성을 유지하고, 데이터베이스 객체를 쉽게 식별할 수 있도록 해야 합니다.

## Decision

### 테이블 명명 규칙
- **프리픽스**: 모든 테이블 이름 앞에 `TB_` 접두사를 붙인다
- **대소문자**: 대문자와 언더스코어(_) 사용
- **복수형**: 테이블명은 복수형 사용
- **예시**: 
  - Member 엔티티 → `TB_MEMBERS`
  - Board 엔티티 → `TB_BOARDS`
  - Post 엔티티 → `TB_POSTS`

### 컬럼 명명 규칙
- **대소문자**: 대문자와 언더스코어(_) 사용
- **공통 컬럼**:
  - 등록자: `REG_NO`
  - 등록일시: `REG_DT`
  - 수정자: `MOD_NO`
  - 수정일시: `MOD_DT`
  - 삭제여부: `DEL_YN`
  - 사용여부: `USE_YN`
- **예시**:
  - email → `EMAIL`
  - phoneNumber → `PHONE_NUMBER`
  - createdDate → `REG_DT`

### 시퀀스 명명 규칙
- **형식**: `SEQ_테이블명`
- **예시**: `SEQ_MEMBERS`, `SEQ_BOARDS`

### 인덱스 명명 규칙
- **형식**: `IDX_테이블명_컬럼명`
- **예시**: `IDX_MEMBERS_EMAIL`

## Consequences

### Positive
- 데이터베이스 객체 타입을 프리픽스로 쉽게 구분 가능
- 일관된 명명 규칙으로 가독성 향상
- 대기업 SI 프로젝트 표준과 유사하여 협업 용이
- 테이블과 시퀀스 이름 충돌 방지

### Negative
- JPA 엔티티의 Java 명명 규칙과 차이가 있어 `@Table`, `@Column` 어노테이션 필수
- 테이블명이 다소 길어질 수 있음

## Implementation
```java
@Entity
@Table(name = "TB_MEMBERS")
public class Member extends BaseEntity {
    
    @Column(name = "EMAIL")
    private String email;
    
    @Column(name = "PHONE_NUMBER")
    private String phoneNumber;
}
```

## References
- 전자정부 표준프레임워크 명명 규칙
- Oracle Database Naming Conventions
