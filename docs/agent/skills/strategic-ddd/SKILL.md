# 🎯 Strategic DDD Skill

> 전략적 DDD (Domain-Driven Design) 설계를 위한 가이드 및 템플릿

---

## Overview

이 스킬은 **전략적 수준의 DDD**만 다룹니다:
- Bounded Context 정의
- Context Map 작성
- 유비쿼터스 언어 도출
- 이벤트 스토밍 (텍스트 기반)

> ⚠️ 전술적 DDD (Aggregate, Entity, Value Object, Repository)는 다루지 않습니다.

---

## 1. Event Storming Template (이벤트 스토밍 템플릿)

### 기본 용어

| 요소 | 색상 | 설명 | 표기법 |
|:---|:---:|:---|:---|
| **Domain Event** | 🟠 | 과거에 발생한 사실 | `{명사}이/가 {동사}됨` |
| **Command** | 🔵 | 이벤트를 유발하는 명령 | `{명사}을/를 {동사}하다` |
| **Actor** | 🟡 | 커맨드를 실행하는 주체 | `관리자`, `회원` |
| **Policy** | 🟣 | 이벤트 후 자동 실행 규칙 | `~하면 ~한다` |
| **Aggregate** | 📦 | 관련 이벤트를 묶는 단위 | `[명사]` |

### 이벤트 스토밍 워크시트

```markdown
## 📋 이벤트 스토밍 워크시트

### 도메인: [도메인명]
### 일자: [YYYY-MM-DD]
### 참여자: [팀원 목록]

---

### 🟠 Step 1: 도메인 이벤트 도출

| # | 도메인 이벤트 | 설명 |
|:---:|:---|:---|
| E1 | 회원이 가입됨 | 신규 회원이 시스템에 등록됨 |
| E2 | 로그인이 성공함 | 회원이 인증에 성공함 |
| E3 | 비밀번호가 변경됨 | 회원이 비밀번호를 변경함 |
| E4 | 권한이 부여됨 | 회원에게 역할이 할당됨 |
| E5 | 게시글이 등록됨 | 새 게시글이 작성됨 |
| E6 | 게시글이 삭제됨 | 게시글이 삭제 처리됨 |
| ... | ... | ... |

---

### 🔵 Step 2: 커맨드 식별

| 이벤트 | 커맨드 | Actor |
|:---|:---|:---:|
| 회원이 가입됨 | 회원을 등록하다 | 비회원 |
| 로그인이 성공함 | 로그인을 요청하다 | 회원 |
| 비밀번호가 변경됨 | 비밀번호를 변경하다 | 회원 |
| 권한이 부여됨 | 권한을 부여하다 | 관리자 |
| 게시글이 등록됨 | 게시글을 작성하다 | 회원 |
| 게시글이 삭제됨 | 게시글을 삭제하다 | 관리자/작성자 |

---

### 🟣 Step 3: 정책 도출

| 트리거 이벤트 | 정책 | 결과 이벤트 |
|:---|:---|:---|
| 회원이 가입됨 | 환영 메일 발송 | 메일이 발송됨 |
| 로그인이 실패함 | 실패 횟수 증가 | 실패 횟수가 증가됨 |
| 실패 횟수가 5회 초과됨 | 계정 잠금 | 계정이 잠김 |
| 게시글이 등록됨 | 알림 발송 | 알림이 발송됨 |

---

### 📦 Step 4: Aggregate 그룹핑

| Aggregate | 관련 이벤트 |
|:---|:---|
| **[회원]** | 회원이 가입됨, 비밀번호가 변경됨, 계정이 잠김 |
| **[인증]** | 로그인이 성공함, 로그인이 실패함 |
| **[권한]** | 권한이 부여됨, 권한이 회수됨 |
| **[게시글]** | 게시글이 등록됨, 게시글이 수정됨, 게시글이 삭제됨 |
| **[댓글]** | 댓글이 등록됨, 댓글이 삭제됨 |

---

### 🟩 Step 5: Bounded Context 경계

| Bounded Context | Aggregates | 핵심 역할 |
|:---|:---|:---|
| **Member Context** | [회원], [인증] | 회원 생명주기 관리 |
| **Permission Context** | [권한] | 인가 및 권한 관리 |
| **Board Context** | [게시글], [댓글] | 게시판 콘텐츠 관리 |
```

---

## 2. Bounded Context Template (Bounded Context 템플릿)

### Bounded Context 정의서

```markdown
## 📦 Bounded Context 정의서

### Context 이름: [영문명] / [한글명]

---

### 1. 핵심 역할 (Responsibility)
> 이 컨텍스트가 책임지는 핵심 비즈니스 기능

- 
- 
- 

---

### 2. 유비쿼터스 언어 (Ubiquitous Language)

| 용어 | 영문 | 정의 |
|:---|:---|:---|
| | | |
| | | |

---

### 3. 핵심 Aggregate

| Aggregate | 설명 | Root Entity |
|:---|:---|:---|
| | | |

---

### 4. 주요 도메인 이벤트

| 이벤트 | 발행 조건 |
|:---|:---|
| | |

---

### 5. 외부 의존성

| 의존 Context | 관계 유형 | 의존 내용 |
|:---|:---:|:---|
| | | |

---

### 6. 팀/담당자

- **담당 팀**: 
- **도메인 전문가**: 
```

---

## 3. Context Map Template (Context Map 템플릿)

### 관계 유형

| 유형 | 설명 | 방향성 |
|:---|:---|:---:|
| **Shared Kernel** | 공유 모델 (변경 시 양쪽 협의 필요) | ↔️ |
| **Customer-Supplier** | 상류(U)가 하류(D)에 서비스 제공 | U → D |
| **Conformist** | 하류가 상류 모델을 그대로 수용 | U → D |
| **Anti-Corruption Layer** | 하류가 변환 계층으로 상류 모델 번역 | U ↛ D |
| **Open Host Service** | 상류가 공개 API로 서비스 제공 | U → * |
| **Published Language** | 표준 언어(JSON, XML)로 통신 | ↔️ |

### Context Map 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CMS Context Map                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│     ┌─────────────────┐                    ┌─────────────────┐          │
│     │   Site Context  │   Customer         │  Content        │          │
│     │   (사이트 관리)  │ ──────────────────►│  Context        │          │
│     │        [U]      │   Supplier         │  (콘텐츠 관리)   │          │
│     └────────┬────────┘                    └────────┬────────┘          │
│              │                                      │                    │
│              │ C/S                                  │ C/S                │
│              ▼                                      ▼                    │
│     ┌─────────────────┐                    ┌─────────────────┐          │
│     │ Template Context│   Conformist       │   Board         │          │
│     │  (템플릿 관리)   │ ◄─────────────────│   Context       │          │
│     │        [D]      │                    │  (게시판 관리)   │          │
│     └─────────────────┘                    └────────┬────────┘          │
│                                                     │                    │
│                                                     │ Shared             │
│                                                     │ Kernel             │
│                                                     ▼                    │
│                              ┌──────────────────────────────┐           │
│                              │      Shared Kernel           │           │
│                              │  • CommonCode (공통코드)     │           │
│                              │  • File (파일관리)           │           │
│                              │  • AuditLog (감사로그)       │           │
│                              └──────────────────────────────┘           │
│                                            ▲                            │
│                                            │ Shared                     │
│                                            │ Kernel                     │
│     ┌─────────────────┐                    │                            │
│     │ Member Context  │ ◄──────────────────┘                            │
│     │  (회원 관리)     │                                                 │
│     │        [U]      │   C/S              ┌─────────────────┐          │
│     └────────┬────────┘ ──────────────────►│ Permission      │          │
│              │                              │ Context         │          │
│              │ ACL                          │ (권한 관리)      │          │
│              ▼                              └─────────────────┘          │
│     ┌─────────────────┐                                                  │
│     │ External SSO    │                                                  │
│     │ (외부 인증)      │                                                  │
│     └─────────────────┘                                                  │
│                                                                          │
│   Legend:                                                                │
│   [U] = Upstream (상류)    [D] = Downstream (하류)                       │
│   C/S = Customer-Supplier  ACL = Anti-Corruption Layer                   │
│   ─── = 직접 관계          ◄─── = 의존 방향                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. CMS Domain Event Catalog (CMS 도메인 이벤트 카탈로그)

### Site Context

| 이벤트 | 커맨드 | Actor | 정책 |
|:---|:---|:---:|:---|
| `SiteCreated` | 사이트 생성 | 슈퍼관리자 | 기본 설정 초기화 |
| `SiteActivated` | 사이트 활성화 | 슈퍼관리자 | - |
| `SiteDeactivated` | 사이트 비활성화 | 슈퍼관리자 | 접속 차단 |
| `SiteDomainChanged` | 도메인 변경 | 사이트관리자 | DNS 갱신 알림 |

### Member Context

| 이벤트 | 커맨드 | Actor | 정책 |
|:---|:---|:---:|:---|
| `MemberRegistered` | 회원 가입 | 비회원 | 환영 메일 발송, 기본 역할 부여 |
| `MemberLoggedIn` | 로그인 | 회원 | 세션 생성, 로그인 이력 기록 |
| `MemberLoggedOut` | 로그아웃 | 회원 | 세션 삭제 |
| `MemberLocked` | 계정 잠금 | 시스템 | 잠금 알림 메일 |
| `MemberPasswordChanged` | 비밀번호 변경 | 회원 | 변경 알림 메일 |
| `MemberWithdrawn` | 회원 탈퇴 | 회원 | 개인정보 삭제 예약 |

### Permission Context

| 이벤트 | 커맨드 | Actor | 정책 |
|:---|:---|:---:|:---|
| `RoleGranted` | 역할 부여 | 관리자 | 감사 로그 기록 |
| `RoleRevoked` | 역할 회수 | 관리자 | 감사 로그 기록 |
| `PermissionDenied` | 접근 거부 | 시스템 | 보안 로그 기록 |

### Board Context

| 이벤트 | 커맨드 | Actor | 정책 |
|:---|:---|:---:|:---|
| `BoardCreated` | 게시판 생성 | 사이트관리자 | 기본 권한 설정 |
| `PostCreated` | 게시글 작성 | 회원 | 알림 발송 (구독자) |
| `PostUpdated` | 게시글 수정 | 작성자/관리자 | 수정 이력 기록 |
| `PostDeleted` | 게시글 삭제 | 작성자/관리자 | Soft Delete |
| `CommentAdded` | 댓글 작성 | 회원 | 작성자 알림 |

### Content Context

| 이벤트 | 커맨드 | Actor | 정책 |
|:---|:---|:---:|:---|
| `ContentCreated` | 콘텐츠 생성 | 콘텐츠관리자 | 버전 1 생성 |
| `ContentPublished` | 콘텐츠 발행 | 콘텐츠관리자 | 캐시 갱신 |
| `ContentScheduled` | 예약 발행 | 콘텐츠관리자 | 스케줄러 등록 |
| `ContentArchived` | 콘텐츠 보관 | 콘텐츠관리자 | 접근 차단 |

---

## 5. Ubiquitous Language Dictionary (유비쿼터스 언어 사전)

### CMS 도메인 용어 사전

| 한글 | 영문 | 정의 | Context |
|:---|:---|:---|:---|
| 사이트 | Site | 독립적으로 운영되는 웹사이트 단위 | Site |
| 도메인 | Domain | 사이트에 연결된 URL 주소 | Site |
| 테마 | Theme | 사이트의 전체 디자인 템플릿 | Site |
| 회원 | Member | 시스템에 가입한 사용자 | Member |
| 역할 | Role | 권한의 논리적 그룹 | Permission |
| 권한 | Permission | 리소스에 대한 접근 권리 | Permission |
| 게시판 | Board | 게시글을 분류하는 논리적 공간 | Board |
| 게시글 | Post | 게시판에 작성된 콘텐츠 | Board |
| 공지글 | Notice | 상단 고정되는 중요 게시글 | Board |
| 비밀글 | SecretPost | 작성자와 관리자만 열람 가능한 글 | Board |
| 댓글 | Comment | 게시글에 달린 피드백 | Board |
| 콘텐츠 | Content | 페이지에 표시되는 정보 단위 | Content |
| 템플릿 | Template | 페이지 렌더링 레이아웃 정의 | Template |
| 공통코드 | CommonCode | 시스템 전반에서 사용하는 코드 | Shared |
| 감사로그 | AuditLog | 주요 작업의 이력 기록 | Shared |

---

## Usage (사용법)

1. **이벤트 스토밍 시작**: 워크시트 템플릿으로 도메인 이벤트 도출
2. **Aggregate 그룹핑**: 관련 이벤트를 묶어 Aggregate 식별
3. **Bounded Context 정의**: Aggregate를 Context로 그룹화
4. **Context Map 작성**: Context 간 관계 정의
5. **유비쿼터스 언어 정리**: 도메인 용어 사전 작성

---

## References

- Eric Evans, *Domain-Driven Design* (2003)
- Vaughn Vernon, *Implementing Domain-Driven Design* (2013)
- Alberto Brandolini, *Event Storming* (eventstorming.com)
