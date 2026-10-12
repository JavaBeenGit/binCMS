# 4-1단계 네이버 블로그 이관 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 형의 네이버 블로그(`blog.naver.com/willer8046`, 63건)를 글·이미지 그대로 인테리어 갤러리(현장시공·셀프시공·인테리어스토리)로 옮기는 **재실행 가능한 도구**를 만들고, 로컬 DB에 전량 이관해 검증한다. 운영 배포 뒤 같은 도구를 운영 API에 대고 한 번 더 돌린다.

**Architecture:** Python 스크립트(`scripts/import-naver-blog.py`, 표준 라이브러리 + lxml). 글 목록은 `PostTitleListAsync.naver`(3페이지), 본문은 모바일 페이지 `m.blog.naver.com/{blogId}/{logNo}`의 `se-main-container`를 SmartEditor 컴포넌트 단위로 HTML로 변환한다. 이미지는 `?type=w966`으로 받아 `POST /api/v1/user/files/upload`로 올리고, 글은 `POST /api/v1/admin/interiors`로 만든다. **멱등성**: 본문 맨 앞에 `<!--naver-log:{logNo}-->` 마커를 넣고, 재실행 시 기존 글을 마커로 찾아 `PUT`으로 갱신한다(카테고리 매핑을 바꿔 다시 돌릴 수 있도록 `InteriorUpdateRequest`에 `category`를 추가).

**Tech Stack:** Python 3.12 + lxml, 백엔드 API(관리자 토큰), Flyway DB.

**Spec:** [`docs/superpowers/specs/2026-10-12-project-restructure-design.md`](../specs/2026-10-12-project-restructure-design.md) §8-1 4-1단계.

## Global Constraints

- 브랜치 `feat/블로그-이관`(build/flyway-도입에서 분기).
- 블로그 서버에 예의: 요청 간 0.3초 대기, User-Agent 명시, 실패 시 3회 재시도.
- 카테고리 매핑 기본값(사용자 확인 전 제안): 현장시공→`ONSITE`, 셀프시공 해보기→`SELF_TIP`, 공구/자재→`SELF_TIP`, 인테리어스토리→`STORY`, IOT(사물인터넷)→`STORY`, 스케치업 공부일지→`STORY`. 매핑은 스크립트 상단 `CATEGORY_MAP`에 두고 바꾸면 재실행으로 반영된다.
- 원문 링크·게시일을 본문 머리에 남긴다(출처 명시, 나중에 SEO canonical 참고).
- 이관 도구 자체는 테스트하지 않는다(1회성 운영 도구). 백엔드 변경(카테고리 수정)은 통합 테스트로.

## Review Focus

- 이미지가 많은 글(36장)도 업로드가 다 되고 본문의 `<img>`가 전부 `/uploads/...`로 치환돼야 한다(원본 `pstatic.net` 링크가 남으면 안 됨). → Task 2 검증 쿼리.
- 재실행 시 중복 글이 생기지 않아야 한다(마커 매칭). → Task 2에서 두 번 실행 후 건수 동일.
- 본문 변환에서 빈 문단(`​`)이 연속으로 쌓이지 않아야 한다(최대 1개). → 변환 규칙.
- 지도·동영상·첨부처럼 옮길 수 없는 컴포넌트는 **텍스트로 대체하거나 건너뛰고 로그에 남긴다**(조용히 사라지면 안 됨).

---

### Task 1: 백엔드 — 인테리어 수정 시 카테고리 변경 허용 (RED → GREEN)

- [ ] RED: `InteriorAdminApiTest`(통합): 생성 → `PUT /api/v1/admin/interiors/{id}`에 `category: STORY` → 조회 시 STORY. 지금은 DTO에 필드가 없어 무시됨 → 실패.
- [ ] `InteriorUpdateRequest.category`(선택), `Interior.changeCategory()`, 서비스에서 null 아니면 적용.
- [ ] GREEN, 커밋 `[개발] feat: 인테리어 수정 시 카테고리 변경 허용`.

### Task 2: 이관 스크립트

- [ ] `scripts/import-naver-blog.py` — 옵션: `--base-url`(기본 `http://localhost:8080`), `--admin-id/--admin-password`(기본 admin/1234, 환경변수 `ADMIN_PASSWORD` 우선), `--blog-id willer8046`, `--limit N`, `--dry-run`(변환만 하고 파일로 저장), `--only logNo`. 캐시: 받은 HTML·이미지는 `.blog-cache/`(git 제외)에 둬 재실행이 빠르게.
- [ ] 변환 규칙: `se-text`→`<p>`(굵게·링크 유지, 색상·폰트 버림), `se-image`→`<figure><img src=/uploads/..></figure>`, `se-quotation`→`<blockquote>`, `se-horizontalLine`→`<hr>`, `se-oglink`→링크 문단, `se-placesMap`→`📍 이름 · 주소` 문단, `se-video`/`se-document`/`se-sticker`/`se-code` 등→건너뛰고 로그. 썸네일 = 첫 이미지.
- [ ] 로컬 전량 이관: 백엔드 기동 → 실행 → 결과 요약(성공/실패/건너뛴 컴포넌트). 검증 쿼리: 글 수 63, `pstatic.net` 포함 본문 0건, 카테고리별 건수(40/8/15). 두 번째 실행 후 건수 동일.
- [ ] `.gitignore`에 `.blog-cache/`. 커밋 `[개발] feat: 네이버 블로그 → 인테리어 갤러리 이관 스크립트`.

### Task 3: 문서 · 화면 확인 · push

- [ ] `docs/30-dev/guides/blog-import.md`(사용법·매핑·재실행·운영에서 돌리는 법), `docs/00-common/business.md`에 블로그 지도 컴포넌트에서 확인한 업체 주소·전화(대표 확인 전 표시), `CLAUDE.md` §7, 설계서 §8-1 4-1단계 "완료".
- [ ] Playwright로 사용자 갤러리 3종·상세 1건·관리자 인테리어 목록 스크린샷 확인(이미지·본문 렌더).
- [ ] 링크 검사 → 커밋 → push.
