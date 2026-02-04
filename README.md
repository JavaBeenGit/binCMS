# binCMS

> React + Spring Boot 기반 현대적인 CMS (Content Management System)

---

## 📋 프로젝트 개요

다중 사이트 지원, 게시판, 콘텐츠 관리, 권한 관리 등을 제공하는 엔터프라이즈급 CMS 시스템

### 주요 기능

- 🏢 다중 사이트 관리 (Multi-Site)
- 📝 게시판 시스템 (Board)
- 📄 콘텐츠 관리 (Content)
- 👥 회원 관리 (Member)
- 🔐 권한 관리 (Permission)
- 🎨 템플릿 시스템 (Template)

---

## 🚀 기술 스택

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.3.0
- **ORM**: Spring Data JPA + QueryDSL 5.1.0
- **Security**: Spring Security 6.x
- **Database**: H2 (개발), PostgreSQL (운영)
- **Build Tool**: Gradle

### Frontend
- **Library**: React 18.3
- **Language**: TypeScript 5.4
- **Build Tool**: Vite 5.2
- **State Management**: Zustand, TanStack Query
- **UI Framework**: Ant Design 5.15
- **Routing**: React Router 6.23

### Architecture
- **Pattern**: SPA (Single Page Application)
- **API**: RESTful API
- **Authentication**: JWT (JSON Web Token)

---

## 📁 프로젝트 구조

```
binCMS/
├── backend/                 # Spring Boot API
│   ├── src/main/java/com/bincms/
│   │   ├── CmsApplication.java
│   │   ├── config/         # 설정 (Security, CORS, JPA, QueryDSL)
│   │   ├── common/         # 공통 DTO, Entity, Exception
│   │   └── domain/         # 도메인별 패키지
│   ├── src/main/resources/
│   │   └── application.yml
│   └── build.gradle
│
├── frontend/                # React SPA
│   ├── src/
│   │   ├── admin/          # 관리자 화면
│   │   ├── user/           # 사용자 화면
│   │   ├── shared/         # 공통 컴포넌트
│   │   ├── api/            # API 클라이언트
│   │   └── types/          # TypeScript 타입
│   ├── package.json
│   └── vite.config.ts
│
└── docs/                    # 문서
    ├── adr/                # Architecture Decision Records
    ├── agent/              # Agent 시스템
    └── plans/              # 작업 계획
```

---

## 🛠️ 개발 환경 설정

### 필수 요구사항

- Java 21 이상
- Node.js 20 이상
- Git

### 1. 저장소 클론

```bash
git clone <repository-url>
cd binCMS
```

### 2. 백엔드 실행

```bash
cd backend

# Windows
gradlew.bat bootRun

# Linux/Mac
./gradlew bootRun
```

백엔드 서버: http://localhost:8080

### 3. 프론트엔드 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드 서버: http://localhost:3000

### 4. 동작 확인

브라우저에서 http://localhost:3000 접속 → Health Check 정보 확인

---

## 🔧 빌드 및 배포

### 백엔드 빌드

```bash
cd backend
./gradlew build

# JAR 파일 생성 위치
# backend/build/libs/bincms-0.0.1-SNAPSHOT.jar
```

### 프론트엔드 빌드

```bash
cd frontend
npm run build

# 빌드 결과 위치
# frontend/dist/
```

---

## 📊 주요 엔드포인트

| 엔드포인트 | 메소드 | 설명 |
|:---|:---:|:---|
| `/api/v1/health` | GET | Health Check |
| `/h2-console` | - | H2 Database Console (개발 환경) |

---

## 📚 문서

- [ADR (Architecture Decision Records)](docs/adr/README.md)
- [Agent System](docs/agent/README.md)
- [작업 계획](docs/plans/README.md)

### 주요 ADR

- [ADR-0001: 순수 Spring Boot 채택](docs/adr/0001-use-egov-framework-4.md)
- [ADR-0004: React 프론트엔드 채택](docs/adr/0004-use-thymeleaf-view-template.md)
- [ADR-0006: SPA 아키텍처 채택](docs/adr/0006-adopt-spa-architecture.md)

---

## 🗄️ 데이터베이스

### H2 Console (개발 환경)

- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (없음)

---

## 🔐 보안

### 기본 인증 정보 (개발 환경)

- Username: `admin`
- Password: `admin`

**⚠️ 운영 환경에서는 반드시 변경하세요!**

---

## 🧪 테스트

### 백엔드 테스트

```bash
cd backend
./gradlew test
```

### 프론트엔드 테스트

```bash
cd frontend
npm run test
```

---

## 📝 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.

---

## 👥 기여

기여는 언제나 환영합니다! Pull Request를 보내주세요.

---

## 📞 문의

프로젝트 관련 문의사항은 Issue를 통해 남겨주세요.
