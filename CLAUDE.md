# CLAUDE.md — 수디자인 인테리어 홈페이지 (binCms)

이 파일은 Claude가 본 저장소에서 작업할 때의 **진입 안내서**다. 절차는 두지 않고, 어디로 가서 무엇을 읽어야 하는지만 가리킨다.

> **작업 시작 전 `CLAUDE.local.md` 확인** — 루트에 있으면 먼저 읽고 따른다(git 제외 개인 규칙). 본 파일과 충돌하면 그 사용자에 한해 `CLAUDE.local.md`가 우선. 모든 기여자에게 적용될 규칙은 본 파일에 쓴다.

## 1. 정체성

인테리어 업체 **수디자인(BIN INTERIOR)** 홈페이지 + 관리자 백오피스. 고객은 사용자의 형(업체 대표)이고 **운영자도 그 한 명(비개발자)**. 개발은 사용자 1명 + Claude. 디자이너·시안 없음, 마감 없음. 2026-02에 만든 코드를 2026-10부터 재정비 중 — 설계서 [`docs/superpowers/specs/2026-10-12-project-restructure-design.md`](docs/superpowers/specs/2026-10-12-project-restructure-design.md), 현재 단계는 §7.

## 2. 작업 라우팅

| 요청 성격 | 작업 공간 | 진입점 |
|----------|-----------|--------|
| 기획·문서·업체 정보 | `docs/` | [`docs/README.md`](docs/README.md) |
| 앱 코드(백엔드·프론트) | `backend/`, `frontend/` (2단계에서 `apps/`로 이동) | [`docs/30-dev/README.md`](docs/30-dev/README.md) · 기동은 [`docs/30-dev/guides/dev-setup.md`](docs/30-dev/guides/dev-setup.md) |
| 재정비 작업 자체 | `docs/superpowers/` | 설계서 §4 단계표 → 해당 단계 `plans/` |

규칙의 **정본은 한 곳**이다. 이 파일은 요약·링크만 하고 ADR·컨벤션 내용을 베끼지 않는다.

## 3. 절대 규칙

- **문서는 현재 코드가 하는 것만 서술**한다. 바라는 상태는 "목표(N단계)"로 표시.
- **비밀값 하드코딩·커밋 금지** (현재 `application.yml`에 남은 것은 3단계에서 제거 — 그 전까지 새로 추가하지 않는다).
- **동작 변경과 구조 변경을 한 커밋에 섞지 않는다.**
- 화면·API의 사용자 가시 동작을 바꾸면 해당 기능 가이드도 같은 브랜치에서 고친다(가이드는 5단계에서 생성 — 그 전까지는 `docs/10-product/sitemap.md`).
- DB 테이블·컬럼 이름은 [`docs/30-dev/db-naming.md`](docs/30-dev/db-naming.md)를 따른다.

## 4. 의사소통

- 한국어 기본. 코드·식별자·표준 약어(ADR 등)는 영문.
- 짧고 구체적으로. 결정·파일 경로를 앞에.
- 되돌리기 어려운 작업(삭제·배포·force push·키 재발급)은 사용자 명시 요청 시에만.

## 5. Git

> 매 세션 자동 로드되는 실행 규칙 사본: [`.claude/rules/git-branch.md`](.claude/rules/git-branch.md) — 이 절을 고치면 그쪽도 같이 고친다.

### 브랜치
- **`main` 직접 작업·직접 push 금지.** 파일을 고치기 전 `git branch --show-current` 확인, `main`이면 먼저 분기.
- 이름 `type/한국어-케밥케이스`. 예: `feat/견적문의-메일알림`, `fix/갤러리-썸네일`, `docs/지침-뼈대`.
- main 반영은 로컬 머지 후 push. PR·리뷰는 선택.

### 커밋 메시지 — `[분류] type: 설명`

| 분류 | 대상 |
|------|------|
| `[공통]` | 루트 파일, `docs/00-common/`, `docs/README.md`, `.claude/`, `scripts/` |
| `[기획]` | `docs/10-product/` |
| `[개발]` | 앱 코드, `docs/30-dev/` |
| `[디자인]` | 사용자 화면 스타일·이미지 |
| `[운영]` | `deploy/`, `docs/30-dev/runbook/`, CI |

Type(소문자): `feat` `fix` `docs` `style` `design` `refactor` `test` `build` `ci` `perf` `chore` `rename` `remove`. 설명은 한국어. 여러 영역이면 주 영역 하나만 태그.
마지막 줄: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
`"wip"`·`"커밋"` 같은 무의미한 메시지 금지. 기존 이력 재작성 금지.

### 푸시
- 사용자 명시 요청("push", "푸시해", "올려")이 있을 때만. force push·훅 우회(`--no-verify`) 금지. 브랜치 삭제는 명시 요청 시에만.

## 6. 기동·검증

- 로컬 기동: [`docs/30-dev/guides/dev-setup.md`](docs/30-dev/guides/dev-setup.md). 백엔드 8080, 프론트 3000, MySQL 3307(Docker compose, 권장) 또는 3306(네이티브).
- 회귀 기준: `backend/gradlew.bat build`, `frontend`에서 `npm run build` 통과 + `curl localhost:8080/api/v1/health` 200.
- 문서 링크: `node scripts/check-doc-links.mjs` 깨진 링크 0.

## 7. 현재 단계

- 2026-10-12: 재정비 설계서 승인. 0단계(기준선)·1단계(지침 뼈대) 완료.
- 다음: 2단계 `apps/` 구조 정리 → 3단계 보안·비밀값 → 4단계 Flyway → 5단계 기능 가이드·verify 스킬 → 6단계 사용자 화면 → 7단계 관리자 화면·운영 매뉴얼 → 8단계 배포.

## 8. 팀 컨벤션 / 피드백

작업하면서 **반복해서 같은 교정**이 들어오는 항목을 한 줄씩 누적한다. 채우는 주체는 사용자.

- **운영자는 형 한 명(비개발자)** (2026-10-12, 사용자) — 기능을 설계할 때 "관리자 화면에서 혼자 할 수 있는가"를 먼저 본다. 개발자 개입이 필요한 운영 절차는 만들지 않는다.
