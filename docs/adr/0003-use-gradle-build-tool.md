# ADR-0003: Gradle 빌드 도구 채택

> 한 문장으로 요약: CMS 프로젝트의 빌드 도구로 Gradle (Groovy DSL)을 사용한다.

---

## Metadata

| 항목 | 내용 |
|:---|:---|
| **상태** | 🟢 Accepted |
| **작성일** | 2026-02-01 |
| **작성자** | @system_architect |
| **검토자** | @egov_framework_specialist |
| **관련 ADR** | [ADR-0001](0001-use-egov-framework-4.md) |
| **Agent Chain** | `ARCHITECTURE_CHAIN` |

---

## Context (맥락)

### 현재 상황

- 전자정부 프레임워크 4.x + Spring Boot 3.x 기반 CMS 프로젝트 시작
- 빌드 도구 선택 필요 (Maven vs Gradle)
- 향후 멀티모듈 구조 (Bounded Context 별 모듈화) 예정

### 해결해야 할 문제

- 빌드 속도 및 개발 생산성
- 멀티모듈 프로젝트 관리 용이성
- 전자정부 프레임워크 호환성

### 제약 조건

- 전자정부 프레임워크 Maven 저장소 접근 필요
- 팀원 대부분 Maven 경험 위주

---

## Decision (결정)

**우리는 Gradle (Groovy DSL)을 빌드 도구로 선택한다.**

### 핵심 결정 사항

1. **Gradle 8.x** 버전 사용
2. **Groovy DSL** 사용 (Kotlin DSL 대비 레퍼런스 풍부)
3. 전자정부 Maven 저장소 Gradle에서 접근

### 적용 범위

- 전체 CMS 프로젝트 빌드
- 멀티모듈 구성 시 루트 및 서브모듈

---

## Alternatives Considered (검토한 대안)

### Option A: Maven

**설명:**
- 전자정부 프레임워크 공식 가이드 기준 빌드 도구
- XML 기반 선언적 구조

**장점:**
- 전자정부 공식 예제 풍부
- 팀원 익숙함
- 안정적인 생태계

**단점:**
- XML 설정 장황함
- 빌드 속도 느림 (매번 전체 빌드)
- 멀티모듈 시 설정 복잡

**선택하지 않은 이유:**
- Spring Boot 3.x에서 Gradle 권장
- 개발 생산성 (증분 빌드, 병렬 처리) 차이

---

## Consequences (결과)

### 긍정적 결과 ✅

- **빌드 속도 향상**: 증분 빌드, 빌드 캐시로 개발 사이클 단축
- **간결한 설정**: Groovy DSL로 가독성 향상
- **멀티모듈 용이**: Bounded Context 별 모듈화 시 설정 간편
- **Spring Boot 호환**: 공식 권장 빌드 도구

### 부정적 결과 / 트레이드오프 ⚠️

- 전자정부 공식 가이드가 Maven 중심
- 팀원 Gradle 학습 필요

### 리스크 🔴

| 리스크 | 영향도 | 대응 방안 |
|:---|:---:|:---|
| Gradle 버전 호환성 이슈 | 낮음 | Gradle Wrapper 사용 |
| 전자정부 의존성 충돌 | 중간 | 의존성 exclude 설정 |

---

## Implementation (구현 가이드)

### build.gradle 기본 설정

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.0'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'egovframework.cms'
version = '1.0.0'
sourceCompatibility = '17'

repositories {
    mavenCentral()
    maven { url 'https://maven.egovframe.go.kr/maven/' }
}

ext {
    egovVersion = '4.2.0'
}

dependencies {
    // eGovFrame Core
    implementation "org.egovframe.rte:org.egovframe.rte.ptl.mvc:${egovVersion}"
    implementation "org.egovframe.rte:org.egovframe.rte.fdl.cmmn:${egovVersion}"
    
    // Spring Boot
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
}

// 의존성 충돌 방지
configurations.configureEach {
    exclude group: 'javax.servlet', module: 'servlet-api'
}
```

---

## References (참고 자료)

- [Gradle 공식 문서](https://docs.gradle.org/)
- [Spring Boot Gradle Plugin](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/)
- [전자정부 프레임워크 4.x](https://www.egovframe.go.kr/)

---

## History (변경 이력)

| 일자 | 변경 내용 | 작성자 |
|:---|:---|:---|
| 2026-02-01 | 최초 작성 (Agent 분석 기반) | @system_architect |
| 2026-02-01 | 검토 완료, Accepted | @egov_framework_specialist |
