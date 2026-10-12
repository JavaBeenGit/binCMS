# 네이버 블로그 이관 가이드

> 도구: [`scripts/import-naver-blog.py`](../../../scripts/import-naver-blog.py). 대상: `blog.naver.com/willer8046`(2026-10-12 기준 63건). 재실행 가능(멱등).

## 무엇을 하나

블로그 글을 **인테리어 갤러리**(`tb_interiors`)로 옮긴다. 글마다:

1. 모바일 페이지(`m.blog.naver.com/{blogId}/{logNo}`)의 본문(SmartEditor `se-main-container`)을 컴포넌트 단위로 HTML로 바꾼다.
2. 이미지는 네이버 썸네일 서버에서 `?type=w966`으로 받아 `POST /api/v1/user/files/upload`로 올리고, 본문의 `<img>`를 `/uploads/...`로 바꾼다(원본·썸네일 자동 생성). 첫 이미지가 갤러리 대표 이미지.
3. 본문 맨 앞에 `<!--naver-log:{logNo}-->` 마커와 "원문 보기" 링크(게시일 포함)를 넣는다.
4. 마커가 같은 글이 이미 있으면 `PUT /api/v1/admin/interiors/{id}`로 갱신, 없으면 `POST`로 생성한다. → 두 번 돌려도 글이 늘지 않는다.

| 블로그 컴포넌트 | 변환 |
|---|---|
| 텍스트 | `<p>` (굵게·기울임·밑줄·링크·줄바꿈 유지, 색·글꼴 버림, 가운데/오른쪽 정렬 유지) |
| 이미지 / 이미지 그룹 / 스트립 | `<figure class="image"><img></figure>` 순서대로, 캡션은 아래 작은 글씨 |
| 인용 | `<blockquote>` |
| 구분선 | `<hr>` |
| 표 | `<table class="table">` (셀 안 텍스트·이미지 유지) |
| 장소(지도) | `📍 이름 · 주소` 한 줄 |
| 링크 미리보기 | 제목 링크 한 줄 |
| 동영상·첨부·스티커 등 | 건너뛰고 "원문에서 확인" 한 줄 + 로그에 집계 |

연속된 빈 문단은 하나로 줄인다.

## 카테고리 매핑

스크립트 상단 `CATEGORY_MAP`. 2026-10-12 기본값(대표 확인 전 제안):

| 블로그 카테고리 | 건수 | 갤러리 |
|---|---|---|
| 현장시공 | 40 | `ONSITE` 현장시공 |
| 셀프시공 해보기 | 1 | `SELF_TIP` 셀프시공 |
| 공구/자재 | 7 | `SELF_TIP` 셀프시공 |
| 인테리어스토리 | 9 | `STORY` 인테리어스토리 |
| IOT(사물인터넷) | 4 | `STORY` 인테리어스토리 |
| 스케치업 공부일지 | 2 | `STORY` 인테리어스토리 |

매핑을 바꾸면 **스크립트를 다시 실행**한다 — 기존 글이 마커로 매칭돼 카테고리가 갱신된다.

## 실행

```bash
# 백엔드가 떠 있어야 한다 (dev-setup.md). lxml 필요: pip install lxml
python scripts/import-naver-blog.py                       # 전량, localhost:8080, admin/1234
python scripts/import-naver-blog.py --dry-run --limit 3   # API 호출 없이 변환 결과만 .blog-cache/willer8046/converted/
python scripts/import-naver-blog.py --only 224153281133   # 한 건만
```

운영 서버에 돌릴 때:

```bash
BINCMS_BASE_URL=https://<도메인> ADMIN_ID=admin ADMIN_PASSWORD='<운영 비밀번호>' python scripts/import-naver-blog.py
```

- 받은 HTML·이미지·업로드 결과는 `.blog-cache/`(git 제외)에 캐시돼 재실행이 빠르다. 운영에 돌릴 때는 업로드 결과가 서버마다 다르므로 **캐시 폴더를 비우거나 `--cache-dir`를 따로** 준다.
- 요청 간 0.3초 대기, 실패 시 3회 재시도. 63건·이미지 약 1,000장 기준 수 분.
- 끝나면 `완료: 생성 N · 갱신 M · 실패 K · 건너뛴 컴포넌트 {...}`를 출력한다. 실패가 있으면 종료 코드 1.

## 확인

```sql
SELECT category, COUNT(*) FROM tb_interiors GROUP BY category;           -- 40 / 8 / 15 (기본 매핑)
SELECT COUNT(*) FROM tb_interiors WHERE content LIKE '%pstatic.net%';    -- 0 이어야 함(이미지 전부 치환)
SELECT COUNT(*) FROM tb_interiors WHERE content LIKE '%naver-log:%';     -- 63
```

사용자 화면 `/user/interior/onsite` 등에서 대표 이미지·본문이 보이는지 본다.

## 한계

- 블로그의 원래 게시일은 `reg_dt`에 들어가지 않는다(감사 컬럼). 본문 머리의 "원문 · 날짜"로만 남는다. 목록은 id 순(오래된 글부터 이관하므로 최신 글이 위).
- 동영상(1건)은 옮기지 않는다.
- 네이버가 모바일 페이지 구조(`se-*` 클래스)를 바꾸면 변환기를 고쳐야 한다.
