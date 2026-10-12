# 수디자인 인테리어 홈페이지 (binCms)

> 인테리어 업체 **수디자인(BIN INTERIOR)**의 홈페이지와 관리자 백오피스. 시공사례·셀프 팁·공지·자유게시판·견적문의를 제공하고, 대표 한 명이 관리자 화면으로 운영한다.

## 무엇이 있나

| 사용자(방문자·회원) | 관리자(운영자) |
|---|---|
| 홈, 시공사례 갤러리 3종(현장시공·셀프시공·인테리어스토리) | 게시글·게시판·콘텐츠·팝업·인테리어 관리 |
| 공지사항, FAQ, 자유게시판(글·댓글) | 견적문의 확인, 회원 관리(차단) |
| 견적문의, 회원가입(이메일 인증·카카오·네이버·구글), 마이페이지 | 메뉴·권한·관리자 계정 관리 |

전체 화면 목록: [`docs/10-product/sitemap.md`](docs/10-product/sitemap.md).

## 기술 스택

- **프론트**: React 18 · Vite 5 · TypeScript · React Router · TanStack Query · Zustand · Ant Design(관리자) · CKEditor 5
- **백엔드**: Spring Boot 3.3 · Java 21(Gradle toolchain 자동 다운로드) · Spring Data JPA + QueryDSL · Spring Security(JWT) · Spring Mail
- **DB**: MySQL 8

결정 근거: [`docs/30-dev/adr/`](docs/30-dev/adr/).

## 저장소 구조

```
binCms/
├── CLAUDE.md          # Claude 작업 진입 안내서
├── dev.ps1            # Docker MySQL + 백엔드 + 프론트 일괄 기동
├── apps/
│   ├── CLAUDE.md      # 코드 레이어 진입 안내서(컨벤션 요약)
│   ├── backend/       # Spring Boot (Gradle)
│   └── frontend/      # React + Vite
├── docs/
│   ├── 00-common/     # 업체 정보·용어집
│   ├── 10-product/    # 사이트맵·기획
│   ├── 30-dev/        # ADR·DB 명명·가이드·런북
│   └── superpowers/   # 재정비 설계서·구현 계획
└── scripts/           # 문서 링크 검사 등
```

## 로컬 실행

[`docs/30-dev/guides/dev-setup.md`](docs/30-dev/guides/dev-setup.md) — 필수 도구, DB 준비(Docker 또는 네이티브), 백엔드 8080·프론트 3000 기동, 알려진 문제.

요약 (터미널 3개, 저장소 루트에서):

```bash
# 터미널 1 — DB
docker compose -f apps/backend/docker-compose.yml up -d --wait   # MySQL 3307
# 터미널 2 — 백엔드 (터미널을 점유함)
cd backend && DB_PORT=3307 ./gradlew.bat bootRun              # http://localhost:8080/api/v1/health
# 터미널 3 — 프론트
cd frontend && npm install && npm run dev                     # http://localhost:3000
```

로컬 관리자: `admin` / `1234`.

## 현재 상태

2026-02에 만든 코드를 2026-10부터 재정비 중. 단계와 진행은 [`CLAUDE.md`](CLAUDE.md) §7, 설계서는 [`docs/superpowers/specs/2026-10-12-project-restructure-design.md`](docs/superpowers/specs/2026-10-12-project-restructure-design.md).

## 라이선스

비공개(업체 납품용).
