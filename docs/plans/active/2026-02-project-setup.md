# 📋 프로젝트 초기 설정 (React + Spring Boot)

> 한 줄 요약: React + Spring Boot SPA 아키텍처 기반 CMS 프로젝트의 기본 구조와 환경을 설정한다.

---

## Metadata

| 항목 | 내용 |
|:---|:---|
| **상태** | 🔄 Active |
| **담당자** | @backend_developer, @frontend_developer |
| **시작일** | 2026-02-04 |
| **예상 완료일** | 2026-02-05 |
| **실제 완료일** | - |
| **진행률** | 0% |

---

## Overview (개요)

### 목표

> React + Spring Boot 기반 CMS 프로젝트의 초기 개발 환경을 구축한다.

- 백엔드 Spring Boot 프로젝트 구조 생성
- 프론트엔드 React 프로젝트 구조 생성
- 개발 환경 설정 및 통합
- 기본 공통 설정 구성

### 범위 (Scope)

**포함:**
- backend/ 디렉토리 구조 생성
- frontend/ 디렉토리 구조 생성
- build.gradle 설정 (Java 21, Spring Boot 3.3.x)
- package.json 설정 (React 18, TypeScript, Vite)
- 기본 설정 파일 (application.yml, vite.config.ts)
- CORS 설정
- 프록시 설정
- Git ignore 설정

**제외:**
- 도메인별 비즈니스 로직
- 데이터베이스 스키마
- 실제 화면 개발
- 배포 설정

### 관련 ADR

- [ADR-0001: 순수 Spring Boot 채택](../adr/0001-use-egov-framework-4.md)
- [ADR-0003: Gradle 빌드 도구 채택](../adr/0003-use-gradle-build-tool.md)
- [ADR-0004: React 프론트엔드 채택](../adr/0004-use-thymeleaf-view-template.md)
- [ADR-0006: SPA 아키텍처 채택](../adr/0006-adopt-spa-architecture.md)

### 🔗 Agent Chain

> 이 작업에 활성화할 에이전트 체인을 선택합니다.

| Chain | 활성화 | 비고 |
|:---|:---:|:---|
| `ARCHITECTURE_CHAIN` | ☑ | 프로젝트 구조 설계 |
| `SECURITY_CHAIN` | ☐ | - |
| `CMS_FEATURE_CHAIN` | ☐ | - |
| `FULL_STACK_CHAIN` | ☑ | 전체 설정 구현 |
| `DEPLOY_CHAIN` | ☐ | - |

**개별 에이전트 추가 활성화:**
- [x] `backend_developer` - Spring Boot 설정
- [x] `frontend_developer` - React 설정
- [x] `database_specialist` - DB 설정
- [ ] `permission_designer` - 

---

## Background (배경)

### 현재 상황

- 새로운 CMS 프로젝트 시작
- 기술 스택 결정 완료 (React + Spring Boot)
- ADR 문서 작성 완료
- 빈 src/ 디렉토리만 존재

### 문제점

- 개발 환경이 구축되지 않음
- 프로젝트 구조가 정의되지 않음
- 빌드 도구 설정 필요
- 개발 워크플로우 수립 필요

### 기대 효과

- 명확한 프로젝트 구조로 개발 효율성 향상
- 프론트엔드/백엔드 독립 개발 가능
- 표준화된 개발 환경으로 협업 용이

---

## Technical Design (기술 설계)

### 프로젝트 구조

```
binCMS/
├── README.md
├── .gitignore
├── docs/
│   ├── adr/
│   ├── agent/
│   └── plans/
│
├── backend/                          # Spring Boot API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── bincms/
│   │   │   │           ├── CmsApplication.java
│   │   │   │           ├── config/
│   │   │   │           │   ├── SecurityConfig.java
│   │   │   │           │   ├── WebConfig.java
│   │   │   │           │   ├── JpaConfig.java
│   │   │   │           │   └── QueryDslConfig.java
│   │   │   │           ├── common/
│   │   │   │           │   ├── dto/
│   │   │   │           │   │   ├── ApiResponse.java
│   │   │   │           │   │   └── PageResponse.java
│   │   │   │           │   ├── entity/
│   │   │   │           │   │   └── BaseEntity.java
│   │   │   │           │   └── exception/
│   │   │   │           │       ├── GlobalExceptionHandler.java
│   │   │   │           │       └── BusinessException.java
│   │   │   │           └── domain/
│   │   │   │               ├── member/
│   │   │   │               ├── board/
│   │   │   │               ├── site/
│   │   │   │               ├── content/
│   │   │   │               └── permission/
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-local.yml
│   │   │       ├── application-dev.yml
│   │   │       ├── application-prod.yml
│   │   │       └── static/
│   │   └── test/
│   │       └── java/
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradle/
│
└── frontend/                         # React SPA
    ├── src/
    │   ├── admin/                   # 관리자 화면
    │   │   ├── pages/
    │   │   ├── components/
    │   │   ├── layouts/
    │   │   └── App.tsx
    │   ├── user/                    # 사용자 화면
    │   │   ├── pages/
    │   │   ├── components/
    │   │   ├── layouts/
    │   │   └── App.tsx
    │   ├── shared/                  # 공통
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── utils/
    │   │   └── constants/
    │   ├── api/
    │   │   ├── client.ts
    │   │   └── endpoints/
    │   ├── types/
    │   ├── main.tsx
    │   └── vite-env.d.ts
    ├── public/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    └── .env.local
```

### 주요 컴포넌트

| 컴포넌트 | 설명 | 파일 경로 |
|:---|:---|:---|
| CmsApplication | Spring Boot 메인 클래스 | backend/src/main/java/.../CmsApplication.java |
| WebConfig | CORS 설정 | backend/src/main/java/.../config/WebConfig.java |
| ApiResponse | 공통 API 응답 DTO | backend/src/main/java/.../common/dto/ApiResponse.java |
| BaseEntity | JPA 공통 엔티티 | backend/src/main/java/.../common/entity/BaseEntity.java |
| main.tsx | React 진입점 | frontend/src/main.tsx |
| vite.config.ts | Vite 설정 | frontend/vite.config.ts |

### 기술 스택

**Backend:**
- Java 21
- Spring Boot 3.3.0
- Spring Data JPA
- QueryDSL 5.1.0
- H2 Database (개발), PostgreSQL (운영)
- Lombok

**Frontend:**
- React 18.3.0
- TypeScript 5.4.0
- Vite 5.2.0
- React Router 6.22.0
- TanStack Query 5.28.0
- Axios 1.6.0
- Ant Design 5.15.0

---

## Tasks (작업 목록)

### Phase 1: 디렉토리 구조 생성 (예상: 30분)

- [ ] Task 1.1: backend/ 디렉토리 구조 생성
- [ ] Task 1.2: frontend/ 디렉토리 구조 생성
- [ ] Task 1.3: .gitignore 파일 작성

### Phase 2: 백엔드 설정 (예상: 1시간)

- [ ] Task 2.1: build.gradle 작성
- [ ] Task 2.2: settings.gradle 작성
- [ ] Task 2.3: CmsApplication.java 메인 클래스 작성
- [ ] Task 2.4: application.yml 기본 설정
- [ ] Task 2.5: WebConfig (CORS) 설정
- [ ] Task 2.6: SecurityConfig 기본 설정
- [ ] Task 2.7: JpaConfig 설정
- [ ] Task 2.8: QueryDslConfig 설정

### Phase 3: 프론트엔드 설정 (예상: 1시간)

- [ ] Task 3.1: package.json 작성
- [ ] Task 3.2: tsconfig.json 작성
- [ ] Task 3.3: vite.config.ts 작성 (프록시 설정)
- [ ] Task 3.4: index.html 작성
- [ ] Task 3.5: main.tsx 작성
- [ ] Task 3.6: API 클라이언트 설정 (axios)
- [ ] Task 3.7: 기본 라우팅 설정

### Phase 4: 공통 코드 작성 (예상: 1시간)

- [ ] Task 4.1: ApiResponse.java (공통 응답 DTO)
- [ ] Task 4.2: BaseEntity.java (JPA 공통 엔티티)
- [ ] Task 4.3: GlobalExceptionHandler.java
- [ ] Task 4.4: BusinessException.java
- [ ] Task 4.5: React 공통 컴포넌트 (Layout, ErrorBoundary)
- [ ] Task 4.6: React 공통 hooks (useApi, useAuth)

### Phase 5: 테스트 및 실행 (예상: 30분)

- [ ] Task 5.1: 백엔드 빌드 및 실행 테스트
- [ ] Task 5.2: 프론트엔드 빌드 및 실행 테스트
- [ ] Task 5.3: 프록시 통신 테스트 (CORS)
- [ ] Task 5.4: Health Check API 작성 및 테스트
- [ ] Task 5.5: README.md 업데이트 (설치 및 실행 가이드)

---

## Timeline (일정)

```
Day 1 (2026-02-04): ████████████████ Phase 1-3
Day 2 (2026-02-05): ████████████████ Phase 4-5
```

| 일차 | 기간 | 목표 | 산출물 |
|:---:|:---|:---|:---|
| 1 | 2026-02-04 | 프로젝트 구조 생성 및 기본 설정 | 디렉토리, 빌드 파일, 설정 파일 |
| 2 | 2026-02-05 | 공통 코드 작성 및 테스트 | 공통 클래스, Health Check API |

---

## Dependencies (의존성)

### 선행 조건

- [x] ADR 문서 작성 완료
- [ ] Java 21 설치
- [ ] Node.js 20+ 설치
- [ ] Git 설치

### 후속 작업

- 첫 번째 도메인 선택 및 개발 계획 수립
- 데이터베이스 스키마 설계
- 인증/인가 시스템 구현

---

## Risks & Mitigations (리스크 및 대응)

| 리스크 | 발생 확률 | 영향도 | 대응 방안 |
|:---|:---:|:---:|:---|
| CORS 설정 오류 | 중간 | 높음 | 명확한 Origin 설정, 테스트 |
| 빌드 도구 버전 충돌 | 낮음 | 중간 | Gradle Wrapper 사용 |
| TypeScript 타입 오류 | 낮음 | 낮음 | strict 모드로 초기부터 타입 관리 |

---

## Success Criteria (완료 기준)

- [ ] 백엔드 서버가 정상 실행됨 (Port 8080)
- [ ] 프론트엔드 서버가 정상 실행됨 (Port 3000)
- [ ] Health Check API 호출 성공
- [ ] 프록시를 통한 API 통신 성공
- [ ] 빌드 오류 없음
- [ ] README.md에 실행 가이드 작성됨

---

## Notes (메모)

### 개발 환경 포트

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`
- Database (H2): `http://localhost:8080/h2-console`

### 유용한 명령어

```bash
# Backend
cd backend
./gradlew bootRun

# Frontend
cd frontend
npm install
npm run dev

# Build
cd backend && ./gradlew build
cd frontend && npm run build
```

---

## History (변경 이력)

| 일자 | 변경 내용 | 작성자 | 진행률 |
|:---|:---|:---|:---:|
| 2026-02-04 | 최초 작성 | @backend_developer | 0% |
