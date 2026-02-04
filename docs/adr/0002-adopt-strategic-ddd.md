# ADR-0002: 전략적 DDD 적용

> 한 문장으로 요약: CMS 도메인 설계에 전략적 DDD(Bounded Context, Context Map)만 적용하고, 전술적 DDD는 적용하지 않는다.

---

## Metadata

| 항목 | 내용 |
|:---|:---|
| **상태** | 🟢 Accepted |
| **작성일** | 2024-01-15 |
| **작성자** | @아키텍트 |
| **검토자** | @팀장, @시니어개발자 |
| **관련 ADR** | [ADR-0001](0001-use-egov-framework-4.md) |

---

## Context (맥락)

### 현재 상황

- CMS 프로젝트 도메인 설계 방법론 선정 필요
- 다중 사이트, 게시판, 콘텐츠, 권한, 회원관리 등 복잡한 도메인
- 팀 내 DDD 경험 수준이 다양함

### 해결해야 할 문제

- 도메인 경계 명확화 (어디까지가 어떤 모듈?)
- 팀원 간 용어 통일 (같은 개념을 다른 용어로 부르는 문제)
- 모듈 간 의존성 관리

### 제약 조건

- 프로젝트 일정 (3개월)
- 팀원 DDD 학습 곡선 고려
- 과도한 설계 복잡성 지양

---

## Decision (결정)

**우리는 전략적 DDD만 적용하고, 전술적 DDD는 적용하지 않는다.**

### 핵심 결정 사항

1. **Bounded Context** 정의 - 도메인 경계 명확화
2. **Context Map** 작성 - 모듈 간 관계 시각화
3. **Ubiquitous Language** 정립 - 용어 사전 작성
4. **Event Storming** 활용 - 텍스트 기반 템플릿 사용

### 적용하지 않는 것

- Aggregate, Entity, Value Object 패턴
- Repository 패턴 (Spring Data JPA 표준 사용)
- Domain Event / Event Sourcing
- CQRS

### 적용 범위

- 프로젝트 초기 도메인 분석 단계
- 모듈 분리 기준 수립
- API 설계 시 도메인 경계 참조

---

## Alternatives Considered (검토한 대안)

### Option A: 전술적 DDD까지 전면 적용

**설명:**
- Aggregate, Entity, Value Object, Domain Event 등 전술적 패턴 적용
- Hexagonal Architecture 또는 Clean Architecture 병행

**장점:**
- 도메인 로직 캡슐화 강화
- 테스트 용이성 향상
- 비즈니스 규칙 명확한 표현

**단점:**
- 학습 곡선 높음
- 개발 속도 저하
- 과도한 추상화로 코드 복잡성 증가

**선택하지 않은 이유:**
- 3개월 일정에 학습 + 적용 어려움
- CMS 특성상 CRUD 중심이라 과도한 복잡성

---

### Option B: DDD 미적용 (전통적 3-Tier)

**설명:**
- Controller - Service - Repository 3계층 아키텍처
- 기능 중심 패키지 구조

**장점:**
- 단순하고 익숙함
- 빠른 개발 가능

**단점:**
- 도메인 경계 불명확
- 모듈 간 의존성 복잡해질 수 있음
- 용어 혼란 가능성

**선택하지 않은 이유:**
- 다중 사이트 등 복잡한 요구사항에서 도메인 경계 필요

---

## Consequences (결과)

### 긍정적 결과 ✅

- **도메인 경계 명확화** - Site, Member, Board, Content 등 Context 분리
- **용어 통일** - Ubiquitous Language로 팀 커뮤니케이션 개선
- **적절한 복잡성** - 전술적 DDD 미적용으로 개발 속도 유지
- **모듈화 기반** - 향후 마이크로서비스 전환 용이

### 부정적 결과 / 트레이드오프 ⚠️

- 전술적 DDD 패턴의 이점 (도메인 로직 캡슐화) 미활용
- 복잡한 비즈니스 규칙 표현 시 Service 레이어에 집중될 수 있음

### 리스크 🔴

| 리스크 | 영향도 | 대응 방안 |
|:---|:---:|:---|
| Context 경계 잘못 설정 | 중간 | 초기 이벤트 스토밍으로 충분한 분석 |
| 용어 사전 미사용 | 낮음 | 코드 리뷰 시 용어 검토 포함 |

---

## Implementation (구현 가이드)

### Bounded Context 정의

```
CMS Bounded Contexts:
├── Site Context        # 사이트 관리, 도메인 설정
├── Member Context      # 회원 가입/인증
├── Permission Context  # 역할/권한 관리
├── Board Context       # 게시판/게시글
├── Content Context     # 콘텐츠/페이지
├── Template Context    # 레이아웃/템플릿
└── Shared Kernel       # 공통코드, 파일, 감사로그
```

### 패키지 구조

```
egovframework.cms/
├── site/           # Site Context
├── member/         # Member Context
├── permission/     # Permission Context
├── board/          # Board Context
├── content/        # Content Context
├── template/       # Template Context
└── common/         # Shared Kernel
```

### 이벤트 스토밍 도구

- `docs/agent/skills/strategic-ddd/SKILL.md` 템플릿 활용
- 텍스트 기반 이벤트 스토밍 (Miro/FigJam 미사용)

---

## References (참고 자료)

- Eric Evans, *Domain-Driven Design* (2003)
- Vaughn Vernon, *Implementing Domain-Driven Design* (2013)
- [Strategic Domain-Driven Design](https://www.infoq.com/articles/ddd-contextmapping/)
- [Event Storming](https://www.eventstorming.com/)

---

## History (변경 이력)

| 일자 | 변경 내용 | 작성자 |
|:---|:---|:---|
| 2024-01-15 | 최초 작성 | @아키텍트 |
| 2024-01-16 | 검토 완료, Accepted | @팀장 |
