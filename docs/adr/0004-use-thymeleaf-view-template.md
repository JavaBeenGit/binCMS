# ADR-0004: React 프론트엔드 채택

> 한 문장으로 요약: CMS 사용자 화면과 관리자 화면 모두 React 단일 기술로 개발한다.

---

## Metadata

| 항목 | 내용 |
|:---|:---|
| **상태** | 🟢 Accepted |
| **작성일** | 2026-02-04 |
| **작성자** | @frontend_developer |
| **검토자** | @system_architect, @backend_developer |
| **관련 ADR** | [ADR-0001](0001-use-egov-framework-4.md) |
| **Agent Chain** | `FULL_STACK_CHAIN` |
| **대체 ADR** | 기존 "Thymeleaf 뷰 템플릿 채택" 결정 변경 |

---

## Context (맥락)

### 현재 상황

- CMS 프론트엔드 개발 착수
- 사용자 화면과 관리자 화면 동일한 기술 스택 필요
- Spring Boot 3.x REST API 기반 백엔드 환경

### 해결해야 할 문제

- 프론트엔드/백엔드 완전 분리
- 풍부한 UX/UI 구현 필요
- 관리자 대시보드 빠른 개발
- 컴포넌트 재사용성 (사용자/관리자 공통 UI)
- 모바일 확장 가능성

### 제약 조건

- 단일 기술 스택으로 유지보수성 확보
- 최신 프론트엔드 생태계 활용

---

## Decision (결정)

**우리는 사용자 화면과 관리자 화면 모두 React로 개발한다.**

### 핵심 결정 사항

1. **React 18.x** 사용 (최신 안정 버전)
2. **TypeScript** 적용 (타입 안정성)
3. **Vite** 빌드 도구 사용 (빠른 개발 경험)
4. **React Admin** 또는 **Ant Design Pro** 관리자 UI 프레임워크
5. **React Router v6** 라우팅
6. **React Query (TanStack Query)** 서버 상태 관리
7. **Zustand** 또는 **Jotai** 클라이언트 상태 관리

### 적용 범위

- CMS 사용자 화면 (프론트 사이트)
- CMS 관리자 대시보드
- Spring Boot는 REST API만 제공 (`@RestController`)

---

## Alternatives Considered (검토한 대안)

### Option A: Thymeleaf (서버 사이드 렌더링)

**설명:**
- Spring Boot + Thymeleaf 서버 사이드 렌더링
- 관리자 화면에만 적용

**장점:**
- Spring Boot 공식 지원
- SEO 친화적
- Spring Security 통합 용이

**단점:**
- 서버 렌더링 오버헤드
- 풍부한 UX 구현 제한
- 사용자 화면과 별도 기술 필요 (React 등)
- 두 가지 기술 스택 유지보수

**선택하지 않은 이유:**
- 사용자/관리자 기술 스택 분리로 유지보수 복잡도 증가
- 컴포넌트 재사용 불가

---

### Option B: Vue.js

**설명:**
- Vue 3 + Composition API
- Vuetify 또는 Element Plus UI 프레임워크

**장점:**
- 낮은 학습 곱선
- 점진적 도입 가능

**단점:**
- React 대비 생태계 작음
- 관리자 대시보드 라이브러리 제한적

**선택하지 않은 이유:**
- React가 더 풍부한 생태계와 커뮤니티 보유

---

### Option C: Next.js (React SSR)

**설명:**
- Next.js로 서버 사이드 렌더링 + React

**장점:**
- SEO 최적화
- React 생태계 활용

**단점:**
- 복잡한 아키텍처
- CMS 특성상 SSR 불필요 (관리자 화면은 SEO 불필요)
- Node.js 서버 추가 필요

**선택하지 않은 이유:**
- CMS 특성상 CSR로 충분하며, 아키텍처 복잡도 증가

---

## Consequences (결과)

### 긍정적 결과 ✅

- **단일 기술 스택**: 사용자/관리자 동일 기술로 유지보수성 향상
- **컴포넌트 재사용**: 공통 UI 컴포넌트 공유 가능
- **풍부한 생태계**: React Admin, Ant Design, MUI 등 강력한 UI 라이브러리
- **빠른 개발**: 관리자 대시보드 템플릿 활용
- **모바일 확장**: React Native로 모바일 앱 확장 용이
- **프론트/백 분리**: 독립적 배포 및 확장 가능
- **현대적 UX**: SPA로 빠르고 부드러운 사용자 경험
- **타입 안정성**: TypeScript로 컴파일 타임 오류 방지

### 부정적 결과 / 트레이드오프 ⚠️

- 초기 SEO 설정 필요 (React Helmet, SSR 고려)
- 초기 렌더링 속도 (코드 스플릿팅으로 개선 가능)
- CORS 설정 필요 (백엔드 API 통신)

### 리스크 🔴

| 리스크 | 영향도 | 대응 방안 |
|:---|:---:|:---|
| React 학습 곱선 | 낮음 | 공식 튜토리얼 및 React Admin 활용 |
| SEO 최적화 | 중간 | React Helmet, Sitemap 생성 |
| 초기 로드 속도 | 낮음 | Vite 번들링, 코드 스플릿팅, 레이지 로딩 |

---

## Implementation (구현 가이드)

### 프로젝트 구조

```
project/
├── backend/           # Spring Boot API
│   ├── src/main/java/
│   └── build.gradle
│
└── frontend/          # React SPA
    ├── src/
    │   ├── admin/        # 관리자 화면
    │   │   ├── pages/
    │   │   ├── components/
    │   │   └── layouts/
    │   │
    │   ├── user/         # 사용자 화면
    │   │   ├── pages/
    │   │   ├── components/
    │   │   └── layouts/
    │   │
    │   ├── shared/       # 공통 컴포넌트
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── utils/
    │   │
    │   ├── api/          # API 클라이언트
    │   └── types/        # TypeScript 타입
    │
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

### 의존성 설정

```json
// frontend/package.json
{
  "name": "cms-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "@tanstack/react-query": "^5.28.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "antd": "^5.15.0",
    "react-admin": "^4.16.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

### Vite 설정

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: true
  }
})
```

### Spring Boot CORS 설정

```java
// backend/src/main/java/config/WebConfig.java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                .allowCredentials(true);
    }
}
```

### React Admin 기본 설정

```tsx
// frontend/src/admin/App.tsx
import { Admin, Resource } from 'react-admin'
import dataProvider from './dataProvider'
import authProvider from './authProvider'

const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
  >
    <Resource name="members" />
    <Resource name="boards" />
    <Resource name="contents" />
  </Admin>
)

export default App
```

---

## References (참고 자료)

- [React 공식 문서](https://react.dev/)
- [React Admin](https://marmelab.com/react-admin/)
- [Ant Design](https://ant.design/)
- [TanStack Query (React Query)](https://tanstack.com/query/latest)
- [Vite 공식 문서](https://vitejs.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)

---

## History (변경 이력)

| 일자 | 변경 내용 | 작성자 |
|:---|:---|:---|
| 2026-02-04 | Thymeleaf → React로 변경 | @frontend_developer |
| 2026-02-04 | 검토 완료, Accepted | @system_architect |
|:---|:---|:---|
| 2026-02-01 | 최초 작성 (Agent 분석 기반) | @frontend_developer |
| 2026-02-01 | 검토 완료, Accepted | @system_architect |
