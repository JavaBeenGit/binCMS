# Git 브랜치 규칙

> 정본은 [`CLAUDE.md`](../../CLAUDE.md) §5. 이 파일은 매 세션 자동 로드되는 실행 규칙이며, 두 문서가 어긋나면 CLAUDE.md를 따르고 이 파일을 맞춘다.

## 1. main에서 작업하지 않는다

- `main`에서 파일을 수정·커밋하지 않는다. `main` 직접 push 금지.
- 파일을 처음 수정하기 전에 확인한다:
  ```bash
  git branch --show-current
  ```
- `main`이면 수정 전에 브랜치를 만든다:
  ```bash
  git switch -c feat/견적문의-메일알림
  ```
- 이미 `main`에서 수정한 뒤 알아챘다면 커밋하지 말고 `git switch -c <브랜치>`로 옮긴 뒤 커밋한다(uncommitted 변경은 브랜치를 따라온다).

## 2. 브랜치 이름 — `type/한국어-케밥케이스`

- `type`: `feat` `fix` `docs` `style` `design` `refactor` `test` `build` `ci` `perf` `chore` `rename` `remove`
- 예: `feat/견적문의-메일알림`, `fix/갤러리-썸네일`, `refactor/관리자-화면-분할`

## 3. 커밋 메시지

`[분류] type: 설명` — 분류는 `[공통]` `[기획]` `[개발]` `[디자인]` `[운영]`. 마지막 줄에
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## 4. main 반영·push

- PR·리뷰는 선택. 로컬 머지 후 push 허용:
  ```bash
  git switch main && git merge feat/견적문의-메일알림 && git push
  ```
- **push는 사용자 명시 요청 시에만**. 자동 push 금지.

## 5. 금지

- `main` 직접 커밋 / 직접 push
- force push (`-f`, `--force`, `--force-with-lease`) — 사용자가 요청해도 한 번 더 확인
- 훅 우회 (`--no-verify`, `--no-gpg-sign`)
- 브랜치 삭제 — 사용자 명시 요청 시에만
