# ADR-0006: SPA (Single Page Application) 아키텍처 채택

> 한 문장으로 요약: 프론트엔드와 백엔드를 완전히 분리하여 React SPA + Spring Boot REST API 아키텍처로 개발한다.

---

## Metadata

| 항목 | 내용 |
|:---|:---|
| **상태** | 🟢 Accepted |
| **작성일** | 2026-02-04 |
| **작성자** | @system_architect |
| **검토자** | @frontend_developer, @backend_developer |
| **관련 ADR** | [ADR-0001](0001-use-egov-framework-4.md), [ADR-0004](0004-use-thymeleaf-view-template.md) |
| **Agent Chain** | `FULL_STACK_CHAIN` |

---

## Context (맥락)

### 현재 상황

- React 프론트엔드 + Spring Boot 백엔드 기술 스택 확정
- 사용자 화면과 관리자 화면 모두 React로 개발
- 프론트엔드/백엔드 분리 아키텍처 설계 필요

### 해결해야 할 문제

- 프론트엔드와 백엔드 간 명확한 책임 분리
- API 설계 원칙 수립
- 인증/인가 처리 방식 결정
- 배포 전략 수립
- 개발 환경 구성

### 제약 조건

- RESTful API 표준 준수
- 보안 요구사항 충족 (OWASP)
- 확장 가능한 아키텍처

---

## Decision (결정)

**우리는 프론트엔드와 백엔드를 완전히 분리한 SPA 아키텍처를 채택한다.**

### 핵심 결정 사항

1. **프론트엔드**: React 18 + TypeScript + Vite
   - 독립적인 프로젝트로 관리
   - SPA (Single Page Application)
   - CSR (Client Side Rendering)

2. **백엔드**: Spring Boot 3.x
   - REST API만 제공 (`@RestController`)
   - Stateless 서버 (JWT 기반 인증)
   - JSON 응답만 반환

3. **통신**: RESTful API
   - HTTP/HTTPS 프로토콜
   - JSON 데이터 포맷
   - CORS 설정 필수

4. **배포**: 독립 배포
   - 프론트엔드: Nginx 정적 파일 서빙
   - 백엔드: JAR 실행 또는 컨테이너

### 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                     SPA Architecture                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐                    ┌─────────────────┐   │
│   │   React SPA     │                    │  Spring Boot    │   │
│   │  (Port 3000)    │◄──── HTTP ───────►│   REST API      │   │
│   │                 │    (CORS)          │  (Port 8080)    │   │
│   │  - React 18     │                    │                 │   │
│   │  - TypeScript   │                    │  - @RestController│   │
│   │  - Vite         │                    │  - Spring Security│   │
│   │  - React Router │                    │  - Spring Data JPA│   │
│   │  - TanStack Query│                   │  - QueryDSL     │   │
│   └─────────────────┘                    └────────┬────────┘   │
│           │                                       │            │
│           │                                       │            │
│           ▼                                       ▼            │
│   ┌─────────────────┐                    ┌─────────────────┐   │
│   │  Static Files   │                    │   PostgreSQL    │   │
│   │   (Nginx)       │                    │   Database      │   │
│   └─────────────────┘                    └─────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 적용 범위

- 전체 CMS 애플리케이션
- 사용자 화면 + 관리자 화면

---

## Alternatives Considered (검토한 대안)

### Option A: Monolithic SSR (Server Side Rendering)

**설명:**
- Spring Boot + Thymeleaf 모노리틱 아키텍처
- 서버에서 HTML 렌더링

**장점:**
- 단순한 아키텍처
- SEO 최적화 용이
- 배포 단순

**단점:**
- 프론트/백엔드 결합도 높음
- 독립적 확장 어려움
- 현대적 프론트엔드 기술 활용 제한

**선택하지 않은 이유:**
- 프론트엔드 기술 발전 속도에 대응 어려움
- 팀 분리 및 병렬 개발 제약

---

### Option B: GraphQL API

**설명:**
- React + GraphQL (Apollo Client)
- Spring Boot + GraphQL Java

**장점:**
- 유연한 쿼리
- Over-fetching 방지
- 타입 안정성

**단점:**
- 학습 곡선
- REST 대비 복잡한 설정
- 캐싱 전략 복잡

**선택하지 않은 이유:**
- CMS 특성상 REST API로 충분
- 팀의 GraphQL 경험 부족

---

### Option C: BFF (Backend for Frontend) 패턴

**설명:**
- React → Node.js BFF → Spring Boot
- 프론트엔드 전용 중간 서버 추가

**장점:**
- 프론트엔드 최적화된 API
- SSR 지원 용이

**단점:**
- 추가 서버 관리 부담
- 아키텍처 복잡도 증가
- Node.js 추가 학습 필요

**선택하지 않은 이유:**
- 초기 프로젝트에 과도한 복잡성
- 직접 REST API로 충분히 대응 가능

---

## Consequences (결과)

### 긍정적 결과 ✅

- **독립적 개발**: 프론트/백엔드 팀 병렬 개발 가능
- **독립적 배포**: 프론트엔드만 업데이트 또는 백엔드만 업데이트 가능
- **독립적 확장**: 트래픽에 따라 프론트/백엔드 개별 스케일링
- **기술 선택 자유**: 각 레이어에 최적 기술 독립적 선택
- **테스트 용이성**: API 테스트와 UI 테스트 분리
- **재사용성**: REST API를 모바일 앱에서도 재사용 가능

### 부정적 결과 / 트레이드오프 ⚠️

- CORS 설정 및 관리 필요
- 두 개의 프로젝트 관리 (빌드, 배포)
- 초기 설정 복잡도 증가
- SEO 최적화 추가 작업 필요

### 리스크 🔴

| 리스크 | 영향도 | 대응 방안 |
|:---|:---:|:---|
| CORS 보안 이슈 | 중간 | 명확한 Origin 화이트리스트 관리 |
| API 버전 관리 | 중간 | URL 버전 관리 (/api/v1) |
| 네트워크 레이턴시 | 낮음 | API 응답 캐싱, 번들 최적화 |

---

## Implementation (구현 가이드)

### 1. 프로젝트 구조

```
cms/
├── backend/              # Spring Boot
│   ├── src/
│   ├── build.gradle
│   └── application.yml
│
└── frontend/             # React
    ├── src/
    ├── package.json
    └── vite.config.ts
```

### 2. REST API 설계 원칙

**URL 구조:**
```
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{sub-resource}

예시:
GET    /api/v1/members          # 목록 조회
GET    /api/v1/members/123      # 상세 조회
POST   /api/v1/members          # 등록
PUT    /api/v1/members/123      # 수정
DELETE /api/v1/members/123      # 삭제
```

**응답 포맷:**
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-02-04T10:00:00Z"
}
```

### 3. CORS 설정

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

```yaml
# application-local.yml
cors:
  allowed-origins:
    - http://localhost:3000

# application-prod.yml
cors:
  allowed-origins:
    - https://cms.example.com
```

### 4. JWT 인증 처리

**백엔드:**
```java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        // 인증 처리
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        return ResponseEntity.ok(new TokenResponse(accessToken, refreshToken));
    }
}
```

**프론트엔드:**
```typescript
// src/api/auth.ts
export const login = async (credentials: LoginRequest): Promise<TokenResponse> => {
  const response = await axios.post('/api/v1/auth/login', credentials);
  
  // 토큰 저장
  localStorage.setItem('accessToken', response.data.accessToken);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  
  return response.data;
};

// src/api/axios.ts
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 5. 개발 환경 프록시 설정

```typescript
// frontend/vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

### 6. 배포 구조

**개발 환경:**
```
Frontend: http://localhost:3000 (Vite Dev Server)
Backend:  http://localhost:8080 (Spring Boot)
```

**운영 환경:**
```
┌────────────────────┐
│   Nginx (Port 80)  │
├────────────────────┤
│  /          → React Static Files  │
│  /api/*     → Backend Proxy       │
└────────────────────┘
          │
          ├─→ React (Static)
          └─→ Spring Boot:8080
```

---

## References (참고 자료)

- [RESTful API Design Best Practices](https://restfulapi.net/)
- [JWT (JSON Web Token) Specification](https://jwt.io/)
- [CORS (Cross-Origin Resource Sharing)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [React SPA Best Practices](https://react.dev/learn)

---

## History (변경 이력)

| 일자 | 변경 내용 | 작성자 |
|:---|:---|:---|
| 2026-02-04 | 최초 작성 | @system_architect |
| 2026-02-04 | 검토 완료, Accepted | @팀장 |
