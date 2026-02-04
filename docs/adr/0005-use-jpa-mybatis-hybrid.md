# ADR-0005: JPA + MyBatis 하이브리드 데이터 접근 전략

> 한 문장으로 요약: 데이터 접근 계층에서 JPA를 주력으로, MyBatis를 복잡 쿼리용 보조로 병행 사용한다.

---

## Metadata

| 항목 | 내용 |
|:---|:---|
| **상태** | 🟢 Accepted |
| **작성일** | 2026-02-01 |
| **작성자** | @database_specialist |
| **검토자** | @system_architect, @backend_developer |
| **관련 ADR** | [ADR-0001](0001-use-egov-framework-4.md), [ADR-0002](0002-adopt-strategic-ddd.md) |
| **Agent Chain** | `ARCHITECTURE_CHAIN` |

---

## Context (맥락)

### 현재 상황

- CMS 도메인: 게시판, 회원, 권한, 사이트, 콘텐츠, 템플릿
- 다양한 데이터 접근 패턴 공존
  - 단순 CRUD (게시글, 회원)
  - 복잡한 통계/리포트 (게시판별 통계, 회원 활동)
  - 동적 검색 조건 (다중 필터)
  - 다중 사이트 데이터 격리

### 해결해야 할 문제

- DDD 도메인 모델과 데이터 접근 계층 일관성
- 복잡한 쿼리 요구사항 대응
- 개발 생산성과 성능 최적화 균형

### 제약 조건

- 전자정부 프레임워크 4.x 호환 (JPA, MyBatis 모두 지원)
- 단일 DataSource 사용

---

## Decision (결정)

**우리는 JPA를 주력(70%)으로, MyBatis를 보조(30%)로 병행 사용한다.**

### 핵심 결정 사항

1. **Spring Data JPA**: 엔티티 CRUD, 도메인 모델 중심 개발
2. **QueryDSL**: JPA 기반 타입 세이프 동적 쿼리 (3개 조건 이하)
3. **MyBatis**: 통계/리포트, 복잡 조인, 배치 처리
4. **규칙**: 같은 테이블을 JPA와 MyBatis에서 동시에 수정 금지

### 적용 비율

| 기술 | 비율 | 사용 영역 |
|:---|:---:|:---|
| JPA (Spring Data) | 70% | CRUD, 연관관계 조회, Auditing |
| MyBatis | 30% | 통계, 리포트, 동적 검색, 배치 |

---

## Alternatives Considered (검토한 대안)

### Option A: JPA 단독 + QueryDSL

**설명:**
- Spring Data JPA + QueryDSL로 모든 쿼리 처리

**장점:**
- 기술 스택 단일화
- 도메인 모델 일관성 최대화
- 타입 세이프 쿼리

**단점:**
- 복잡한 통계 쿼리 표현 한계
- Native Query 사용 시 JPA 장점 상실
- 배치 대량 처리 성능 이슈

**선택하지 않은 이유:**
- CMS 특성상 통계/리포트 쿼리 다수 예상

---

### Option B: MyBatis 단독

**설명:**
- 전자정부 프레임워크 기본 데이터 접근 방식

**장점:**
- SQL 직접 제어로 최적화 용이
- 전자정부 레퍼런스 풍부
- 학습 곡선 낮음

**단점:**
- CRUD 반복 코드 증가
- 도메인 모델과 괴리
- Auditing, 변경 감지 수동 구현

**선택하지 않은 이유:**
- DDD 전략과 부합하지 않음 (ADR-0002)

---

## Consequences (결과)

### 긍정적 결과 ✅

- **역할 분리**: CRUD는 JPA, 복잡 쿼리는 MyBatis로 최적화
- **도메인 일관성**: JPA Entity로 도메인 모델 표현
- **Auditing 자동화**: `@CreatedBy`, `@CreatedDate` 활용
- **실용적 선택**: 대부분의 대규모 프로젝트에서 검증된 패턴

### 부정적 결과 / 트레이드오프 ⚠️

- 두 기술 모두 학습 필요
- 트랜잭션/캐시 동기화 주의
- 명확한 사용 가이드라인 필요

### 리스크 🔴

| 리스크 | 영향도 | 대응 방안 |
|:---|:---:|:---|
| 1차 캐시 불일치 | 중간 | 같은 테이블 동시 접근 금지 |
| 트랜잭션 롤백 불완전 | 낮음 | 중요 작업은 단일 기술 사용 |
| 기술 혼용 복잡도 | 중간 | 사용 가이드라인 문서화 |

---

## Implementation (구현 가이드)

### 의존성 설정

```groovy
dependencies {
    // JPA
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    
    // QueryDSL
    implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
    annotationProcessor 'com.querydsl:querydsl-apt:5.0.0:jakarta'
    
    // MyBatis
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'
}
```

### 패키지 구조

```
egovframework.cms.domain.board/
├── entity/
│   └── Post.java               # JPA Entity
├── repository/
│   └── PostRepository.java     # Spring Data JPA
├── mapper/
│   └── PostMapper.java         # MyBatis Mapper
└── service/
    └── PostServiceImpl.java    # JPA + MyBatis 조합 사용
```

### 기술 선택 가이드라인

| 상황 | 권장 기술 |
|:---|:---|
| 단일 엔티티 CRUD | **JPA** |
| 연관 엔티티 조회 (1-2개 조인) | **JPA** (Fetch Join) |
| 3개 이상 테이블 조인 | **MyBatis** |
| 동적 검색 (3개 조건 이하) | **JPA** (QueryDSL) |
| 동적 검색 (4개 조건 이상) | **MyBatis** |
| 통계/집계/리포트 | **MyBatis** |
| 배치 대량 처리 | **MyBatis** |
| 페이징 + 정렬 | **JPA** (Pageable) |

### JPA 예시 (CRUD)

```java
// PostRepository.java
public interface PostRepository extends JpaRepository<Post, Long> {
    
    @EntityGraph(attributePaths = {"member", "board"})
    Page<Post> findByBoardBoardIdAndStatus(Long boardId, PostStatus status, Pageable pageable);
}
```

### MyBatis 예시 (통계)

```xml
<!-- StatisticsMapper.xml -->
<select id="getBoardMonthlyStats" resultType="BoardStatsResult">
    SELECT 
        b.board_id,
        b.board_name,
        DATE_FORMAT(p.created_at, '%Y-%m') AS month,
        COUNT(p.post_id) AS post_count,
        SUM(p.view_count) AS total_views
    FROM cms_board b
    LEFT JOIN cms_post p ON b.board_id = p.board_id
    WHERE b.site_id = #{siteId}
    GROUP BY b.board_id, month
    ORDER BY month DESC
</select>
```

---

## References (참고 자료)

- [Spring Data JPA 공식 문서](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [QueryDSL Reference](http://querydsl.com/static/querydsl/latest/reference/html/)
- [MyBatis-Spring-Boot-Starter](https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/)

---

## History (변경 이력)

| 일자 | 변경 내용 | 작성자 |
|:---|:---|:---|
| 2026-02-01 | 최초 작성 (Agent 분석 기반) | @database_specialist |
| 2026-02-01 | 검토 완료, Accepted | @system_architect |
