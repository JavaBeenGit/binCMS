# ADR-0001: 순수 Spring Boot 채택

> 한 문장으로 요약: CMS 개발에 전자정부 프레임워크 없이 순수 Spring Boot를 사용한다.

---

## Metadata

| 항목 | 내용 |
|:---|:---|
| **상태** | 🟢 Accepted |
| **작성일** | 2026-02-04 |
| **작성자** | @아키텍트 |
| **검토자** | @팀장, @시니어개발자 |
| **관련 ADR** | - |
| **대체 ADR** | 기존 "전자정부 프레임워크 4.x 채택" 결정 변경 |

---

## Context (맥락)

### 현재 상황

- 민간 CMS 개발 프로젝트 착수
- 다중 사이트 지원, 권한 관리, 게시판 등 표준 CMS 기능 필요
- React 프론트엔드와 통합된 현대적 아키텍처 구성

### 해결해야 할 문제

- 최신 Spring 생태계 완전 활용
- 유지보수성과 개발 생산성을 갖춘 기술 스택 선정
- 불필요한 의존성 최소화
- React SPA와의 효율적인 통합

### 제약 조건

- Java 21+ 지원 필요 (최신 LTS)
- Spring Boot 3.x 생태계 완전 활용
- RESTful API 중심 아키텍처

---

## Decision (결정)

**우리는 전자정부 프레임워크 없이 순수 Spring Boot를 선택한다.**

### 핵심 결정 사항

1. **Spring Boot 3.3.x** 사용 (2026년 최신 안정 버전)
2. **Java 21** 사용 (LTS)
3. **Gradle** 빌드 도구 사용
4. **Spring Data JPA** + **QueryDSL** 데이터 접근 계층
5. **Spring Security 6.x** 보안 프레임워크

### 적용 범위

- 전체 CMS 백엔드 개발
- REST API (Spring Web)
- 프론트엔드는 별도 React 애플리케이션

---

## Alternatives Considered (검토한 대안)

### Option A: 전자정부 프레임워크 4.x

**설명:**
- 전자정부 표준프레임워크 4.x (Spring Boot 기반)
- 공공 SI 표준 준수

**장점:**
- 공공 프로젝트 감리 기준 충족
- ID Generator, Property Service 등 유틸리티 제공
- 공공기관 레퍼런스 존재

**단점:**
- 불필요한 의존성 포함
- eGovFrame Maven 저장소 의존
- 일부 컴포넌트와 Spring Boot 충돌 가능성
- 최신 Spring 기능 활용 제약
- React SPA 아키텍처와 맞지 않음

**선택하지 않은 이유:**
- 민간 프로젝트로 전자정부 표준 불필요
- 현대적 SPA 아키텍처와 불필요한 결합

---

### Option B: Spring Framework (Boot 없이)

**설명:**
- Spring Framework만 사용 (Spring Boot 미사용)

**장점:**
- 세밀한 제어 가능

**단점:**
- 많은 수동 설정 필요
- 개발 생산성 저하
- Auto-configuration 부재

**선택하지 않은 이유:**
- Spring Boot의 생산성 이점을 포기할 이유 없음

---

## Consequences (결과)

### 긍정적 결과 ✅

- **최신 Spring 생태계 완전 활용**: 모든 Spring Boot 기능 제약 없이 사용
- **Auto-configuration 완전 활용**: 설정 최소화, 개발 생산성 극대화
- **의존성 최소화**: 필요한 라이브러리만 선택적 추가
- **방대한 레퍼런스**: Spring Boot 공식 문서 및 커뮤니티 활용
- **Java 21 + Spring Boot 3.x**: 최신 기술, 장기 지원 보장
- **Virtual Threads (Loom)**: Java 21의 최신 기능 활용 가능
- **React 통합 용이**: REST API 중심 아키텍처로 프론트엔드 완전 분리

### 부정적 결과 / 트레이드오프 ⚠️

- 일부 유틸리티 직접 구현 필요 (ID Generator 등)
- 공공 프로젝트 전환 시 전자정부 프레임워크 추가 필요

### 리스크 🔴

| 리스크 | 영향도 | 대응 방안 |
|:---|:---:|:---|
| 유틸리티 직접 구현 | 낮음 | UUID, Snowflake 등 검증된 라이브러리 활용 |
| 공공 프로젝트 전환 | 중간 | 필요 시 전자정부 프레임워크 추가 가능한 구조 유지 |

---

## Implementation (구현 가이드)

### 적용 방법

1. Spring Initializr로 프로젝트 생성 (또는 Gradle 직접 설정)
2. 필요한 Spring Boot Starter 의존성 추가
3. `application.yml` 설정

### 예시 코드

```groovy
// build.gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.0'
    id 'io.spring.dependency-management' version '1.1.5'
}

java {
    sourceCompatibility = '21'
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot Starters
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    
    // QueryDSL
    implementation 'com.querydsl:querydsl-jpa:5.1.0:jakarta'
    annotationProcessor 'com.querydsl:querydsl-apt:5.1.0:jakarta'
    annotationProcessor 'jakarta.persistence:jakarta.persistence-api'
    
    // Database
    runtimeOnly 'com.h2database:h2'
    runtimeOnly 'org.postgresql:postgresql'
    
    // Utilities
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    
    // Test
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
}
```

---

## References (참고 자료)

- [Spring Boot 3.3 Documentation](https://docs.spring.io/spring-boot/docs/3.3.x/reference/html/)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/reference/)
- [Spring Security 6.x Documentation](https://docs.spring.io/spring-security/reference/6.3/index.html)
- [QueryDSL Reference](http://querydsl.com/static/querydsl/latest/reference/html/)
- [Java 21 Features](https://openjdk.org/projects/jdk/21/)

---

## History (변경 이력)

| 일자 | 변경 내용 | 작성자 |
|:---|:---|:---|
| 2026-02-04 | 전자정부 프레임워크 → 순수 Spring Boot로 변경 | @아키텍트 |
| 2026-02-04 | 검토 완료, Accepted | @팀장 |
