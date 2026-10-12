# 30-dev — 개발

**How It Works**. 결정 기록(ADR), 컨벤션, 가이드, 런북.

## 폴더 구성

```
30-dev/
├── adr/            # 결정 기록 (영구). 0000-template.md 복사해서 작성
├── db-naming.md    # DB 오브젝트 명명 규칙 (단일 출처)
├── conventions.md  # 코딩 컨벤션 (2단계에서 작성)
├── guides/         # how-to: dev-setup, features/(5단계), admin-manual(7단계)
└── runbook/        # 배포·백업·장애 대응 (8단계)
```

## ADR — 현재

| ADR | 결정 | Status |
|-----|------|--------|
| [0001](adr/0001-tech-stack.md) | 기술 스택: React SPA + Spring Boot 3 + MySQL, Gradle | accepted |
| [0002](adr/0002-admin-react-spa.md) | 관리자 UI는 React + Ant Design SPA 유지 | accepted |
| [0003](adr/0003-auth-jwt.md) | 인증: JWT Bearer + 역할(SYSTEM/OPERATION/GENERAL_ADMIN, USER), 접두어 기반 서버 권한 강제 | accepted (구현 완료) |

예정: `0004-flyway-migration`(4단계), `0005-hosting`(8단계).

## 언제 무엇을 쓰나

| 종류 | 시점 | 무엇 |
|------|------|------|
| **ADR** | 결정 직후 | "X로 가기로 했고, 이유는 Y". 되돌릴 때는 새 ADR로 supersede |
| **Guide** | 결정 후 실행 | "이렇게 하면 됩니다" 절차 |
| **Runbook** | 운영 | 배포·백업·장애 시 할 일 |

RFC 폴더는 두지 않는다(1인 프로젝트 — 토론은 설계서 `docs/superpowers/specs/`에서).

## 가이드

- [`guides/dev-setup.md`](guides/dev-setup.md) — 로컬 개발 환경 세팅 (정본)
- [`db-naming.md`](db-naming.md) — DB 명명 규칙
