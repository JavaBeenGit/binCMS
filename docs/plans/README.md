# 📝 Work Plans (작업 계획)

> 기능 개발, 리팩토링, 마이그레이션 등의 작업 계획을 관리합니다.

---

## What is Work Plan?

**작업 계획(Work Plan)**은 특정 기능이나 모듈 개발을 위한 상세 실행 계획입니다.
ADR이 "무엇을, 왜"라면, Plan은 "어떻게, 언제"를 다룹니다.

### ADR vs Plan

| 구분 | ADR | Plan |
|:---|:---|:---|
| **목적** | 의사결정 기록 | 실행 계획 |
| **초점** | Why, What | How, When |
| **수명** | 영구 보존 | 완료 후 이동 |
| **범위** | 아키텍처/기술 선택 | 기능/모듈 개발 |

---

## Directory Structure (디렉토리 구조)

```
plans/
  ├── README.md          # 이 파일
  ├── TEMPLATE.md        # 계획 템플릿
  ├── active/            # 🔄 진행 중인 계획
  ├── completed/         # ✅ 완료된 계획
  └── archived/          # 📦 취소/보류된 계획
```

---

## Plan Status (상태)

| 상태 | 폴더 | 설명 |
|:---:|:---|:---|
| 🔄 **Active** | `active/` | 현재 진행 중인 계획 |
| ✅ **Completed** | `completed/` | 성공적으로 완료된 계획 |
| 📦 **Archived** | `archived/` | 취소되거나 보류된 계획 |

---

## Active Plans (진행 중)

| 계획 | 담당자 | 시작일 | 예상 완료 | 진행률 |
|:---|:---:|:---:|:---:|:---:|
| [회원 인증 모듈](active/2024-02-member-auth.md) | @홍길동 | 2024-02-01 | 2024-02-15 | 30% |

---

## Completed Plans (완료)

| 계획 | 담당자 | 기간 |
|:---|:---:|:---:|
| - | - | - |

---

## How to Write Plan (작성 방법)

### 1. 새 계획 생성

```bash
# 파일명 형식: YYYY-MM-제목.md
# 예시: 2024-02-member-auth.md
```

### 2. 템플릿 복사

[TEMPLATE.md](TEMPLATE.md) 파일을 복사하여 `active/` 폴더에 작성합니다.

### 3. 진행 중 업데이트

- 체크박스([ ] / [x])로 진행 상황 추적
- 주요 변경 시 History 섹션 업데이트

### 4. 완료 시 이동

```bash
# 완료 시
mv active/2024-02-member-auth.md completed/

# 취소/보류 시
mv active/2024-02-member-auth.md archived/
```

---

## Naming Convention (명명 규칙)

```
YYYY-MM-기능명.md

예시:
2024-01-project-init.md          # 프로젝트 초기 설정
2024-02-member-auth.md           # 회원 인증 모듈
2024-02-board-crud.md            # 게시판 CRUD
2024-03-permission-rbac.md       # RBAC 권한 체계
2024-03-multi-site-tenant.md     # 멀티사이트 테넌트
```

---

## Plan Lifecycle (생명주기)

```
┌─────────────────────────────────────────────────────────────┐
│                      Plan Lifecycle                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   📝 Draft                                                   │
│      │                                                       │
│      ▼                                                       │
│   🔄 Active (active/)                                        │
│      │                                                       │
│      ├──────────────────┬─────────────────┐                  │
│      │                  │                 │                  │
│      ▼                  ▼                 ▼                  │
│   ✅ Completed       📦 Archived       🔄 Revised            │
│   (completed/)       (archived/)       (active/)             │
│                       - 취소             - 범위 변경          │
│                       - 보류             - 일정 변경          │
│                       - 대체됨                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration with ADR

Plan 작성 중 아키텍처 결정이 필요한 경우:

1. **ADR 먼저 작성** - 기술/아키텍처 결정을 ADR로 문서화
2. **Plan에서 참조** - `Related ADRs` 섹션에 링크

```markdown
## Related ADRs

- [ADR-0001: 전자정부 프레임워크 4.x 채택](../adr/0001-use-egov-framework-4.md)
- [ADR-0003: RBAC 권한 체계 적용](../adr/0003-implement-rbac-permission.md)
```

---

## Tips

1. **작게 시작** - 2주 이내 완료 가능한 단위로 분할
2. **체크리스트 활용** - 진행 상황 시각화
3. **리스크 식별** - 미리 예상되는 문제점 기록
4. **정기 업데이트** - 최소 주 1회 진행률 업데이트
5. **완료 후 이동** - 완료된 계획은 반드시 `completed/`로 이동

---

## When to Write Plan (언제 작성하는가?)

Plan 작성이 필요한 경우:

- ✅ 새로운 모듈/기능 개발 (3일 이상 소요)
- ✅ 대규모 리팩토링
- ✅ 데이터 마이그레이션
- ✅ 외부 시스템 연동
- ✅ 성능 개선 프로젝트

Plan 작성이 불필요한 경우:

- ❌ 단순 버그 수정
- ❌ 1-2일 내 완료 가능한 작은 기능
- ❌ 코드 정리/포맷팅
