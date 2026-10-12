---
name: verify
description: 이 리포의 실기동 검증 레시피 — 로컬 스택 기동·포트·드라이브 방법·주의점. 기대값은 docs/30-dev/guides/features/ 가 정본.
---

# 로컬 실기동 검증 레시피

> **무엇을 확인해야 하는지**(메뉴별 기대 동작·API·테스트 체크포인트)는 [`docs/30-dev/guides/features/`](../../../docs/30-dev/guides/features/README.md)의 해당 문서를 먼저 읽는다. 이 문서는 "어떻게 띄우고 두드리는지"만 다룬다. 경로는 모두 저장소 루트 기준.

## 기동 (에이전트는 새 창을 띄우는 `dev.ps1` 대신 개별 백그라운드 기동)

```bash
# 1. DB (Docker, 3307) — 이미 떠 있으면 생략. Flyway 이력이 없는 옛 볼륨이면 down -v 로 비운다.
docker compose -f apps/backend/docker-compose.yml up -d --wait

# 2. 백엔드 (8080) — Flyway 가 V1·V2 를 적용하고 admin/1234 를 만든다(local 프로파일)
(cd apps/backend && DB_PORT=3307 ./gradlew.bat bootRun --no-daemon > /tmp/bincms-backend.log 2>&1 &)

# 3. 프론트 (3000) — /api·/uploads 는 Vite 프록시로 8080 에 연결
(cd apps/frontend && npx vite > /tmp/bincms-frontend.log 2>&1 &)
```

준비 판정(백엔드는 첫 기동 60~80초): `curl -s localhost:8080/api/v1/health` → `"status":"UP"`, `curl -s -o /dev/null -w '%{http_code}' localhost:3000/user` → 200.
`Started CmsApplication` 로그 grep 은 인코딩 때문에 안 걸릴 수 있으니 **포트/엔드포인트로 판정**한다.

## 드라이브

- 브라우저: Playwright MCP 로 `http://localhost:3000` (프록시 경유라 CORS·쿠키 문제 없음). 뷰포트 1366×900, 모바일은 360×780.
- 관리자: `/admin/login` 에 `admin` / `1234`. 토큰은 localStorage 에 남으므로 새 탭에서도 유지.
- 회원: 소셜·메일 인증 없이 `POST /api/v1/auth/signup` 로 즉석 생성 — `{"loginId":"u1","password":"Passw0rd!","name":"tester"}` (비밀번호 규칙: 영문+숫자+특수문자 8자 이상, Git Bash curl 에서 한글 본문은 깨지므로 영문 이름). 로그인은 `/user/login`.
- API 직접 호출(토큰):
  ```bash
  TOKEN=$(curl -s -X POST localhost:8080/api/v1/auth/login -H 'Content-Type: application/json' -d '{"loginId":"admin","password":"1234"}' | python -I -c "import sys,json;print(json.load(sys.stdin)['data']['accessToken'])")
  curl -s "localhost:8080/api/v1/admin/inquiries?page=0&size=5" -H "Authorization: Bearer $TOKEN"
  ```
- 권한 기대값: 비로그인 `/api/v1/admin/**` → 401 `C004`, 회원 토큰 → 403 `C005`, `/api/v1/user/**` 비로그인 → 401. 콘솔의 `/uploads/etc/su_design_logo*.png` 500 은 로고 파일 부재(오탐 아님).
- DB 확인: `docker exec bincms-mysql mysql -ubincms -pbincms1234 bincms -N -e "SELECT COUNT(*) FROM tb_interiors"` (물리명은 소문자).
- 파일 업로드 확인: 1px PNG 를 `POST /api/v1/user/files/upload` 로 올리고 응답 `fileUrl` 을 GET → 200.

## 자동 테스트

- 백엔드: `cd apps/backend && ./gradlew.bat test` (Testcontainers MySQL, Docker 필요, 약 1~2분). 보안 규칙·Flyway·인테리어·회원·문의 흐름.
- 프론트: `cd apps/frontend && npm run build && npm run lint`.
- 문서: `node scripts/check-doc-links.mjs .`

## 종료

```bash
netstat -ano | grep -E ":3000 |:8080 " | grep LISTEN | awk '{print $5}' | sort -u | xargs -r -I{} taskkill //PID {} //F
```
Docker DB 는 그대로 둬도 된다(`docker compose -f apps/backend/docker-compose.yml down` 으로 내림, `-v` 를 붙이면 데이터 삭제).

## 주의

- `apps/backend/application-secret.yml` 이 없으면 기동은 되지만 소셜 로그인·메일 인증이 비활성. 소셜 로그인은 실계정이 필요해 에이전트는 제공자 페이지로의 리다이렉트까지만 검증한다.
- Hibernate 는 `validate` 모드다. 엔티티를 바꾸고 Flyway 마이그레이션을 안 추가하면 기동 실패 — 메시지에 컬럼명이 나온다.
- 여러 Bash 호출을 병렬로 띄우면 셸 작업 디렉터리가 섞인다. 기동 명령은 **절대 경로**로.
- 검증용으로 만든 글·문의·회원은 로컬 DB 에만 남는다. 운영 DB 에는 절대 붙지 않는다.
