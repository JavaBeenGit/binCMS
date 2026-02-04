# 📋 Architecture Decision Records (ADR)

> 프로젝트의 주요 아키텍처 의사결정을 기록하고 추적합니다.

---

## What is ADR?

**ADR (Architecture Decision Record)**은 소프트웨어 아키텍처에 대한 중요한 의사결정을 문서화하는 방법입니다.

### 왜 ADR을 작성하는가?

1. **맥락 보존** - "왜 이렇게 결정했지?" 에 대한 답변
2. **온보딩 가속** - 신규 팀원이 프로젝트 히스토리 이해
3. **일관성 유지** - 과거 결정과 충돌하는 새 결정 방지
4. **재논의 방지** - 이미 검토된 대안들을 다시 논의하는 시간 절약

---

## ADR Status (상태)

| 상태 | 설명 |
|:---:|:---|
| 🟡 **Proposed** | 제안됨 - 검토 대기 중 |
| 🟢 **Accepted** | 승인됨 - 적용 중 |
| 🔴 **Deprecated** | 폐기됨 - 더 이상 유효하지 않음 |
| ⚫ **Superseded** | 대체됨 - 다른 ADR로 교체됨 |

---

## ADR Index (목록)

| # | 제목 | 상태 | 일자 |
|:---:|:---|:---:|:---:|
| [0001](0001-use-egov-framework-4.md) | 순수 Spring Boot 채택 | 🟢 Accepted | 2026-02-04 |
| [0002](0002-adopt-strategic-ddd.md) | 전략적 DDD 적용 | 🟢 Accepted | 2024-01-15 |
| [0003](0003-use-gradle-build-tool.md) | Gradle 빌드 도구 채택 | 🟢 Accepted | 2026-02-01 |
| [0004](0004-use-thymeleaf-view-template.md) | React 프론트엔드 채택 | 🟢 Accepted | 2026-02-04 |
| [0005](0005-use-jpa-mybatis-hybrid.md) | JPA + MyBatis 하이브리드 전략 | 🟢 Accepted | 2026-02-01 |
| [0006](0006-adopt-spa-architecture.md) | SPA 아키텍처 채택 | 🟢 Accepted | 2026-02-04 |

---

## How to Write ADR (작성 방법)

### 1. 새 ADR 생성

```bash
# 파일명 형식: NNNN-짧은-설명.md
# 예시: 0004-use-redis-for-session.md
```

### 2. 템플릿 복사

[TEMPLATE.md](TEMPLATE.md) 파일을 복사하여 작성합니다.

### 3. 필수 섹션

| 섹션 | 설명 |
|:---|:---|
| **Title** | 결정 사항을 한 문장으로 |
| **Status** | 현재 상태 |
| **Context** | 왜 이 결정이 필요한가? |
| **Decision** | 무엇을 결정했는가? |
| **Consequences** | 결과 및 트레이드오프 |

### 4. 선택 섹션

| 섹션 | 설명 |
|:---|:---|
| **Alternatives** | 검토했지만 선택하지 않은 대안들 |
| **References** | 참고 자료 |

---

## Naming Convention (명명 규칙)

```
NNNN-동사-목적어-형용사.md

예시:
0001-use-egov-framework-4.md        # ~를 사용하다
0002-adopt-strategic-ddd.md          # ~를 채택하다
0003-implement-rbac-permission.md    # ~를 구현하다
0004-replace-session-with-jwt.md     # ~를 ~로 교체하다
0005-deprecate-legacy-api.md         # ~를 폐기하다
```

---

## When to Write ADR (언제 작성하는가?)

ADR 작성이 필요한 경우:

- ✅ 새로운 프레임워크/라이브러리 도입
- ✅ 아키텍처 패턴 선택 (DDD, Clean Architecture 등)
- ✅ 데이터베이스 설계 방식 결정
- ✅ API 설계 원칙 수립
- ✅ 보안 정책 결정
- ✅ 배포/인프라 전략 선택
- ✅ 기존 결정을 번복하거나 변경할 때

ADR 작성이 불필요한 경우:

- ❌ 단순 버그 수정
- ❌ 코드 리팩토링 (아키텍처 변경 없이)
- ❌ 라이브러리 버전 업그레이드 (breaking change 없이)
- ❌ 일상적인 기능 개발

---

## Tips

1. **짧게 작성** - 1-2페이지가 적당
2. **결정 시점에 작성** - 나중에 기억나지 않음
3. **대안 기록** - 검토한 다른 옵션들도 기록
4. **업데이트** - 상태 변경 시 Superseded by 링크 추가

---

## References

- [Michael Nygard - Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
