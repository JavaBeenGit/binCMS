# 📋 프로젝트 초기화 설정

> 한 줄 요약: CMS 프로젝트의 기본 구조, 빌드 설정, 공통 설정을 구성한다.

---

## Metadata

| 항목 | 내용 |
|:---|:---|
| **상태** | ✅ Completed |
| **담당자** | @backend_developer |
| **시작일** | 2026-02-01 |
| **예상 완료일** | 2026-02-01 |
| **실제 완료일** | 2026-02-01 |
| **진행률** | 100% |

---

## Overview (개요)

### 목표

- Gradle 기반 Spring Boot 3.x 프로젝트 구조 생성
- 전자정부 프레임워크 4.x 의존성 설정
- Thymeleaf, JPA, MyBatis 통합 설정
- Bounded Context 기반 패키지 구조 정의

### 범위 (Scope)

**포함:**
- build.gradle 설정
- application.yml 환경별 설정
- 공통 설정 클래스 (Security, JPA, MyBatis)
- 디렉토리 구조 생성
- 기본 레이아웃 템플릿

**제외:**
- 도메인별 비즈니스 로직 구현
- 데이터베이스 스키마 생성
- 실제 화면 개발

### 관련 ADR

- [ADR-0001: 전자정부 프레임워크 4.x 채택](../adr/0001-use-egov-framework-4.md)
- [ADR-0002: 전략적 DDD 적용](../adr/0002-adopt-strategic-ddd.md)
- [ADR-0003: Gradle 빌드 도구 채택](../adr/0003-use-gradle-build-tool.md)
- [ADR-0004: Thymeleaf 뷰 템플릿 채택](../adr/0004-use-thymeleaf-view-template.md)
- [ADR-0005: JPA + MyBatis 하이브리드 전략](../adr/0005-use-jpa-mybatis-hybrid.md)

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
- [x] `egov_framework_specialist` - 전자정부 프레임워크 설정
- [x] `database_specialist` - JPA/MyBatis 설정
- [ ] `permission_designer` - 

---

## Technical Design (기술 설계)

### 디렉토리 구조

```
cms/
├── build.gradle
├── settings.gradle
├── gradle/
│   └── wrapper/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── egovframework/
│   │   │       └── cms/
│   │   │           ├── CmsApplication.java
│   │   │           ├── config/
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── JpaConfig.java
│   │   │           │   ├── MyBatisConfig.java
│   │   │           │   ├── WebMvcConfig.java
│   │   │           │   └── EgovConfig.java
│   │   │           ├── common/
│   │   │           │   ├── dto/
│   │   │           │   │   └── ApiResponse.java
│   │   │           │   ├── entity/
│   │   │           │   │   └── BaseEntity.java
│   │   │           │   └── exception/
│   │   │           │       └── GlobalExceptionHandler.java
│   │   │           └── domain/
│   │   │               ├── site/
│   │   │               ├── member/
│   │   │               ├── permission/
│   │   │               ├── board/
│   │   │               ├── content/
│   │   │               └── template/
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-local.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       ├── messages/
│   │       │   └── message-common.properties
│   │       ├── mapper/
│   │       ├── static/
│   │       │   ├── css/
│   │       │   ├── js/
│   │       │   └── images/
│   │       └── templates/
│   │           ├── layout/
│   │           │   └── admin.html
│   │           ├── fragments/
│   │           │   ├── header.html
│   │           │   ├── sidebar.html
│   │           │   └── footer.html
│   │           └── admin/
│   └── test/
│       └── java/
│           └── egovframework/
│               └── cms/
└── docs/
    ├── agent/
    ├── adr/
    └── plans/
```

---

## Tasks (작업 목록)

### Phase 1: 빌드 설정 (예상: 30분)

- [x] Task 1.1: settings.gradle 생성
- [x] Task 1.2: build.gradle 생성 (의존성 설정)
- [x] Task 1.3: gradle wrapper 설정

### Phase 2: 애플리케이션 설정 (예상: 30분)

- [x] Task 2.1: CmsApplication.java 메인 클래스
- [x] Task 2.2: application.yml 기본 설정
- [x] Task 2.3: application-local.yml (H2 DB)
- [x] Task 2.4: application-dev.yml
- [x] Task 2.5: application-prod.yml

### Phase 3: 공통 설정 클래스 (예상: 1시간)

- [x] Task 3.1: SecurityConfig.java
- [x] Task 3.2: JpaConfig.java (Auditing 포함)
- [x] Task 3.3: MyBatisConfig.java
- [x] Task 3.4: WebMvcConfig.java
- [x] Task 3.5: EgovConfig.java
- [x] Task 3.6: MessageConfig.java

### Phase 4: 공통 컴포넌트 (예상: 30분)

- [x] Task 4.1: BaseEntity.java (JPA 공통 엔티티)
- [x] Task 4.2: ApiResponse.java (표준 응답)
- [x] Task 4.3: PageResponse.java (페이지네이션)
- [x] Task 4.4: GlobalExceptionHandler.java
- [x] Task 4.5: message-common.properties

### Phase 5: Thymeleaf 레이아웃 (예상: 30분)

- [x] Task 5.1: layout/admin.html
- [x] Task 5.2: fragments/header.html
- [x] Task 5.3: fragments/sidebar.html
- [x] Task 5.4: fragments/footer.html
- [x] Task 5.5: static/css/admin.css
- [x] Task 5.6: static/js/admin.js
- [x] Task 5.7: admin/index.html (대시보드)
- [x] Task 5.8: login.html
- [x] Task 5.9: AdminController.java

---

## Success Criteria (완료 기준)

이 계획은 다음 조건을 모두 충족할 때 완료됩니다:

- [x] `./gradlew bootRun` 정상 실행 가능한 코드 준비
- [x] http://localhost:8080 접속 가능한 Controller 설정
- [x] H2 Console 접속 가능 (local 프로파일 설정 완료)
- [x] Thymeleaf 레이아웃 렌더링 템플릿 생성
- [x] Spring Security 로그인 페이지 템플릿 생성

---

## History (변경 이력)

| 일자 | 변경 내용 | 작성자 |
|:---|:---|:---|
| 2026-02-01 | 최초 작성 | @backend_developer |
| 2026-02-01 | 전체 Phase 완료 - 프로젝트 초기화 완성 | @backend_developer |
