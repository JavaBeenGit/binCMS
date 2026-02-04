# 🏛️ CMS Agent Orchestration System

[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](./) [![Last Updated](https://img.shields.io/badge/Last%20Updated-2026--02--01-green)](./)

> *"전자정부 프레임워크 4.x + Spring Boot + 전략적 DDD 기반 CMS 개발을 위한 에이전트 오케스트레이션 시스템"*

---

## 🎯 Our Identity (PRIORITY 0)

**프로젝트**: CMS (Content Management System)
**도메인**: 다중사이트 관리, 게시판, 콘텐츠, 권한, 회원관리, 공통코드, 템플릿 관리
**기술 스택**: 
- **Backend**: Spring Boot 3.x, Java 21, Spring Data JPA, QueryDSL, Spring Security 6.x
- **Frontend**: React 18, TypeScript, Vite, React Router, TanStack Query
- **Architecture**: SPA (Single Page Application), REST API

---

## 🧭 CMS Bounded Context Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CMS Bounded Context Map                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │
│   │   사이트 관리  │◄────►│   콘텐츠 관리  │◄────►│   템플릿 관리  │      │
│   │   (Site)     │      │  (Content)   │      │  (Template)  │      │
│   └──────┬───────┘      └──────┬───────┘      └──────┬───────┘      │
│          │                     │                     │              │
│          ▼                     ▼                     ▼              │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │              Shared Kernel (공유 커널)                     │      │
│   │   • 공통코드 (CommonCode)  • 파일 관리 (File)              │      │
│   │   • 검색 서비스 (Search)   • 감사 로그 (AuditLog)          │      │
│   └──────────────────────────────────────────────────────────┘      │
│          │                     │                     │              │
│          ▼                     ▼                     ▼              │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │
│   │   회원 관리    │◄────►│   권한 관리    │◄────►│   게시판 관리  │      │
│   │   (Member)   │      │ (Permission) │      │   (Board)    │      │
│   └──────────────┘      └──────────────┘      └──────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Agent System (11개 에이전트)

### Core System (101-103)

| ID | Agent | Role | Model |
|:---:|:---|:---|:---:|
| 101 | `system_architect` | DDD Bounded Context, 클린 아키텍처 설계 | **opus** |
| 102 | `security_guardian` | RBAC/ABAC 권한 아키텍처, OWASP 준수 | **opus** |
| 103 | `code_reviewer` | 코드 품질, SOLID 원칙, 보안 취약점 검증 | sonnet |

### Development (201-205)

| ID | Agent | Role | Model |
|:---:|:---|:---|:---:|
| 201 | `backend_developer` | Spring Boot 3.x, JPA, REST API 개발 | sonnet |
| 202 | `database_specialist` | 스키마 설계, 쿼리 최적화, 마이그레이션 | sonnet |
| 203 | `api_architect` | RESTful API 설계, OpenAPI 문서화 | sonnet |
| 204 | `frontend_developer` | React/TypeScript, UI/UX 구현 | sonnet |
| 205 | `devops_engineer` | CI/CD, Docker, 배포 자동화 | sonnet |

### CMS Domain Specialists (301-303)

| ID | Agent | Role | Model |
|:---:|:---|:---|:---:|
| 301 | `cms_content_architect` | 다중사이트, 게시판, 콘텐츠, 템플릿 설계 | **opus** |
| 302 | `cms_permission_designer` | 권한 체계, 회원 관리, 공통코드 설계 | **opus** |
| 303 | `spring_boot_specialist` | Spring Boot 3.x 베스트 프랙티스, 표준 패턴 | sonnet |

---

## 🔗 Dynamic Chain Patterns

### 1. DomainDesignChain (도메인 설계)
> 이벤트 스토밍 → Bounded Context 정의 → 아키텍처 설계

```
system_architect[O] → cms_content_architect[O] → cms_permission_designer[O] → database_specialist[S]
```

### 2. CMSDevChain (CMS 개발)
> 요구사항 분석 → 설계 → 구현 → 리뷰

```
system_architect[O] → (backend_developer[S] ∥ frontend_developer[S]) → code_reviewer[S]
```

### 3. SecurityChain (보안 설계)
> 권한 아키텍처 → 구현 → 검증

```
security_guardian[O] → cms_permission_designer[O] → backend_developer[S] → code_reviewer[S]
```

### 4. APIChain (API 개발)
> API 설계 → 구현 → 문서화

```
api_architect[S] → backend_developer[S] → code_reviewer[S]
```

### 5. DeployChain (배포)
> 인프라 설정 → 배포 자동화 → 검증

```
devops_engineer[S] → (backend_developer[S] ∥ frontend_developer[S])
```

---

## 📊 4-Layer Prompt Analysis

사용자 요청을 분석하여 적절한 에이전트/체인을 자동 선택합니다.

| Layer | 분석 내용 | 추출 정보 |
|:---:|:---|:---|
| **Lexical** | 키워드, 도메인 용어 | 에이전트 후보 선정 |
| **Syntactic** | 문장 구조, 명령/질문 타입 | 태스크 유형 파악 |
| **Discourse** | 컨텍스트, 이전 대화 | 체인 복잡도 결정 |
| **Pragmatic** | 실제 의도, 예상 결과 | 최종 출력 형태 |

### 키워드 → 에이전트 자동 매핑

| 키워드 | 에이전트 |
|:---|:---|
| 도메인, Bounded Context, 이벤트 스토밍, 아키텍처 | `system_architect` |
| 권한, RBAC, 인증, 인가, 보안 | `security_guardian`, `cms_permission_designer` |
| 게시판, 콘텐츠, 사이트, 템플릿, 다중사이트 | `cms_content_architect` |
| API, REST, 엔드포인트, Swagger | `api_architect` |
| Spring Boot, JPA, 서비스, 리포지토리 | `backend_developer` |
| 스키마, 테이블, 쿼리, 인덱스, ERD | `database_specialist` |
| 화면, UI, Thymeleaf, JavaScript, 관리자 | `frontend_developer` |
| 배포, Docker, CI/CD, 파이프라인 | `devops_engineer` |
| 전자정부, eGov, 공통컴포넌트 | `egov_framework_specialist` |
| 리뷰, 검토, 품질, 리팩토링 | `code_reviewer` |

---

## 🛠️ Skills

| Skill | 설명 |
|:---|:---|
| `strategic-ddd` | Bounded Context, Context Map, 이벤트 스토밍 템플릿 |
| `egov-spring-boot` | 전자정부 4.x + Spring Boot 설정 가이드 |

---

## 📝 Work Checklist

모든 작업 시 다음 체크리스트를 따릅니다:

### 설계 단계
- [ ] Bounded Context 식별 완료
- [ ] Context Map 관계 정의 완료
- [ ] 유비쿼터스 언어 정의 완료

### 개발 단계
- [ ] 전자정부 표준 패턴 적용
- [ ] RESTful API 설계 원칙 준수
- [ ] 코드 리뷰 완료

### 보안 단계
- [ ] RBAC 권한 체계 적용
- [ ] OWASP Top 10 검토
- [ ] 감사 로그 설정

### 배포 단계
- [ ] Docker 이미지 빌드
- [ ] CI/CD 파이프라인 설정
- [ ] 환경별 설정 분리

---

## 🚀 Quick Start

1. **도메인 설계 시작**:
   ```
   "회원관리 도메인을 이벤트 스토밍으로 분석해줘"
   → system_architect 자동 호출 → DomainDesignChain 실행
   ```

2. **API 개발**:
   ```
   "게시판 CRUD API를 만들어줘"
   → api_architect → backend_developer → code_reviewer
   ```

3. **권한 설계**:
   ```
   "사이트별 관리자 권한을 설계해줘"
   → security_guardian → cms_permission_designer
   ```

---

## � ADR/Plan Integration

> Agent 체인과 의사결정 기록/작업 계획을 연동합니다.

### 연동 위치

```
docs/
├── agent/           # Agent 시스템 (현재 위치)
├── adr/             # 아키텍처 의사결정 기록
│   ├── README.md    # ADR 가이드 + 인덱스
│   └── TEMPLATE.md  # ADR 템플릿 (Agent Chain 참조 포함)
└── plans/           # 작업 계획
    ├── README.md    # Plan 가이드
    ├── TEMPLATE.md  # Plan 템플릿 (Agent Chain 선택 포함)
    ├── active/      # 진행 중
    ├── completed/   # 완료
    └── archived/    # 보관
```

### Agent Chain 참조표

| Chain 이름 | 키워드 | 용도 | 에이전트 구성 |
|:---|:---|:---|:---|
| `ARCHITECTURE_CHAIN` | 설계, 아키텍처, 모듈 | 신규 모듈/아키텍처 설계 | system_architect → database_specialist → api_architect |
| `SECURITY_CHAIN` | 보안, 권한, 인증 | 인증/권한/보안 구현 | security_guardian → backend_developer → code_reviewer |
| `CMS_FEATURE_CHAIN` | 게시판, 콘텐츠, 사이트 | CMS 기능 개발 | cms_content_architect → backend_developer → frontend_developer |
| `FULL_STACK_CHAIN` | 기능, 개발, 구현 | 전체 기능 개발 | api_architect → backend_developer → frontend_developer → code_reviewer |
| `DEPLOY_CHAIN` | 배포, Docker, CI/CD | 배포/인프라 설정 | devops_engineer → security_guardian |

### 사용 예시

**ADR 작성 시:**
```markdown
## Metadata
| Agent Chain | SECURITY_CHAIN |

→ 권한 관련 의사결정이므로 security_guardian, permission_designer 참조
```

**Plan 작성 시:**
```markdown
### 🔗 Agent Chain
| Chain | 활성화 | 비고 |
|:---|:---:|:---|
| `CMS_FEATURE_CHAIN` | ☑ | 게시판 개발 |
| `SECURITY_CHAIN` | ☑ | 권한 연동 필요 |

→ 작업 시작 시 두 체인 관련 에이전트 자동 활성화
```

---

## �📁 Directory Structure

```
docs/agent/
├── README.md                                ← 현재 파일 (에이전트 시스템)
├── agents/
│   ├── 101_system_architect_agent.md
│   ├── 102_security_guardian_agent.md
│   ├── 103_code_reviewer_agent.md
│   ├── 201_backend_developer_agent.md
│   ├── 202_database_specialist_agent.md
│   ├── 203_api_architect_agent.md
│   ├── 204_frontend_developer_agent.md
│   ├── 205_devops_engineer_agent.md
│   ├── 301_cms_content_architect_agent.md
│   ├── 302_cms_permission_designer_agent.md
│   └── 303_egov_framework_specialist_agent.md
└── skills/
    ├── strategic-ddd/SKILL.md
    └── egov-spring-boot/SKILL.md
```

---

> *"좋은 아키텍처는 결정을 미루게 해준다."* - Robert C. Martin
