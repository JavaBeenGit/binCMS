# 0단계 기준선 고정 + 1단계 지침 뼈대 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 코드를 깨끗한 환경에서 문서대로 기동할 수 있게 만들고(0단계), 저장소의 모든 문서를 현재 코드와 일치하는 진입 안내서·ADR·Git 규칙 체계로 교체한다(1단계).

**Architecture:** 코드 동작은 바꾸지 않는다. 0단계는 빌드 도구 설정(JDK 21 자동 확보, DB 포트 환경변수화)과 기동 문서만 추가한다. 1단계는 문서 전면 교체다: 낡은 `docs/agent`·`docs/plans`·ADR 7개를 삭제하고 `docs/{00-common,10-product,30-dev}` + 루트 `CLAUDE.md` + `.claude/rules/git-branch.md`를 새로 쓴다. 문서 간 상대 링크가 깨지지 않도록 링크 검사 스크립트를 먼저 만들고 모든 문서 작업의 테스트로 쓴다.

**Tech Stack:** Spring Boot 3.3 / Gradle 8.7 / Java 21(toolchain, foojay 자동 다운로드) / MySQL 8 · React 18 / Vite 5 / TypeScript 5.4 / Node 24 · 문서는 Markdown.

**Spec:** [`docs/superpowers/specs/2026-10-12-project-restructure-design.md`](../specs/2026-10-12-project-restructure-design.md) §4 "0단계", "1단계", §5 "Git 규칙".

## Global Constraints

- 코드 동작 변경 금지(0·1단계 모두). 백엔드 Java 소스·프론트 `src/`는 수정하지 않는다. 예외: `build.gradle`, `settings.gradle`, `application.yml`의 DB 포트 한 줄.
- 저장소명 `binCms`, 패키지 `com.bincms`, 포트(백엔드 8080, 프론트 3000, MySQL 3306) 유지.
- `main` 직접 커밋 금지. 0단계는 `chore/기준선-고정`, 1단계는 `docs/지침-뼈대` 브랜치. 작업 시작 전 `git branch --show-current` 확인.
- 커밋 메시지 `[분류] type: 설명` + 마지막 줄 `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. 0단계 커밋은 `[개발]`, 1단계 문서 커밋은 `[공통]`.
- push·브랜치 삭제·main 머지는 사용자 명시 요청 시에만. 각 단계 끝에 머지 명령만 안내한다.
- 모든 문서는 **현재 코드가 실제로 하는 것**만 서술한다. 바라는 상태는 "목표(N단계)"로 표시한다. 추측 금지 — 코드에서 확인한 사실만.
- 문서는 한국어. 파일명은 영문 소문자 케밥케이스. `docs/` 깊이 ≤ 3.
- 비밀값(`application.yml`의 OAuth·메일·JWT)은 이 계획에서 건드리지 않는다(3단계).
- 1단계에서 ADR 번호는 `0001`부터 다시 시작한다(기존 ADR 전부 삭제).

## Review Focus

- JDK 21이 설치되지 않은 PC(현재 사용자 PC: `JAVA_HOME`=17)에서 `gradlew.bat build`가 toolchain 자동 다운로드로 성공해야 한다. → Task 1 Step 4에서 `JAVA_HOME`이 17인 채로 검증.
- 로컬에 네이티브 MySQL(3306)이 이미 떠 있는 PC와 Docker만 있는 PC 둘 다에서 `dev-setup.md`대로 기동되어야 한다. → Task 2에서 두 경로를 모두 문서화하고, 네이티브 경로로 실측.
- `docs/` 안의 상대 링크가 삭제된 파일(`docs/adr/*`, `docs/agent/*`)을 가리키면 안 된다. → Task 5의 링크 검사 스크립트를 Task 6~11 매 단계 실행, Task 12에서 전체 실행.
- `README.md`·`CLAUDE.md`가 존재하지 않는 기능(다중 사이트, 템플릿, H2 콘솔, 11개 에이전트)을 언급하면 안 된다. → Task 11 Step 3에서 금지어 grep.
- `.gitignore`에 `CLAUDE.local.md`가 없으면 개인 규칙이 커밋된다. → Task 9 Step 4에서 `git check-ignore`로 확인.

---

## 0단계 — 기준선 고정 (브랜치 `chore/기준선-고정`)

### Task 1: Gradle toolchain으로 JDK 21 자동 확보

`build.gradle`은 `sourceCompatibility = '21'`인데 사용자 PC의 `JAVA_HOME`은 17이다. Gradle toolchain + foojay resolver를 쓰면 Gradle이 JDK 21을 내려받아 쓰므로 수동 설치가 필요 없다.

**Files:**
- Modify: `backend/settings.gradle`
- Modify: `backend/build.gradle:11-13` (`java { sourceCompatibility = '21' }` 블록)

**Interfaces:**
- Produces: `backend/gradlew.bat build`가 어떤 JDK가 PATH에 있든 성공한다. Task 2·4와 `dev-setup.md`가 이를 전제.

- [ ] **Step 1: 브랜치 생성**

```bash
cd /c/dev/workspace/binCms
git switch main && git switch -c chore/기준선-고정
git branch --show-current   # chore/기준선-고정
```

- [ ] **Step 2: 현재 상태로 빌드가 실패하는지 확인 (기준선 기록)**

```bash
cd /c/dev/workspace/binCms/backend && ./gradlew.bat compileJava --no-daemon -q 2>&1 | tail -5
```

Expected: `error: invalid source release: 21` 또는 toolchain 관련 실패. (성공하면 이미 JDK 21이 어딘가 있는 것이므로 그래도 Step 3을 진행한다 — 다른 PC 재현성을 위해.)

- [ ] **Step 3: settings.gradle에 foojay 플러그인, build.gradle에 toolchain 선언**

`backend/settings.gradle` 전체를 다음으로 교체:

```groovy
pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

plugins {
    // JDK가 없으면 자동 다운로드 (Gradle toolchain)
    id 'org.gradle.toolchains.foojay-resolver-convention' version '0.8.0'
}

rootProject.name = 'bincms'
```

`backend/build.gradle`의

```groovy
java {
    sourceCompatibility = '21'
}
```

를 다음으로 교체:

```groovy
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}
```

- [ ] **Step 4: JAVA_HOME=17인 채로 빌드 성공 확인**

```bash
cd /c/dev/workspace/binCms/backend && java -version 2>&1 | head -1 && ./gradlew.bat build -x test --no-daemon -q 2>&1 | tail -5; ls build/libs/
```

Expected: `openjdk version "17..."`가 찍히고도 빌드가 성공, `build/libs/bincms-0.0.1-SNAPSHOT.jar` 존재. 첫 실행은 JDK 다운로드로 수 분 걸릴 수 있다.

- [ ] **Step 5: 커밋**

```bash
cd /c/dev/workspace/binCms && git add backend/settings.gradle backend/build.gradle && git commit -q -F - <<'EOF'
[개발] build: Gradle toolchain으로 JDK 21 자동 확보

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 2: 로컬 MySQL 준비 — 네이티브 또는 Docker Compose

사용자 PC에는 네이티브 MySQL(`mysqld.exe`, 3306)이 떠 있고 Docker Desktop은 꺼져 있다. 다른 PC 재현을 위해 compose 파일(3307)을 두되, 포트는 환경변수 `DB_PORT`로 고른다.

**Files:**
- Create: `backend/docker-compose.yml`
- Create: `backend/db/init-local.sql`
- Modify: `backend/src/main/resources/application.yml:51` (local 프로파일 datasource url)

**Interfaces:**
- Produces: 환경변수 `DB_PORT`(기본 3306). compose 사용 시 `DB_PORT=3307`. `dev-setup.md`(Task 4)가 두 경로를 설명한다.

- [ ] **Step 1: application.yml local 프로파일 URL 포트를 환경변수화**

`backend/src/main/resources/application.yml`에서 다음 줄을

```yaml
    url: jdbc:mysql://localhost:3306/bincms?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&useUnicode=true
```

다음으로 교체(local 프로파일 블록 안의 한 줄만):

```yaml
    url: jdbc:mysql://localhost:${DB_PORT:3306}/bincms?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&useUnicode=true
```

- [ ] **Step 2: Docker Compose 파일 작성**

`backend/docker-compose.yml`:

```yaml
# binCms — 로컬 개발용 MySQL 8 (docs/30-dev/guides/dev-setup.md 참고)
# 기동:  docker compose -f backend/docker-compose.yml up -d --wait
# 종료:  docker compose -f backend/docker-compose.yml down
#
# 호스트 3307 → 컨테이너 3306. PC에 네이티브 MySQL(3306)이 이미 있어도 충돌하지 않도록 3307.
# 백엔드는 DB_PORT=3307 환경변수로 이 컨테이너에 붙는다.
services:
  mysql:
    image: mysql:8.4
    container_name: bincms-mysql
    ports:
      - "3307:3306"
    command: --default-time-zone=+09:00 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    environment:
      TZ: Asia/Seoul
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: bincms
      MYSQL_USER: bincms
      MYSQL_PASSWORD: bincms1234
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-proot"]
      interval: 5s
      timeout: 5s
      retries: 20
      start_period: 30s

volumes:
  mysql-data:
```

- [ ] **Step 3: 네이티브 MySQL용 초기화 SQL 작성**

`backend/db/init-local.sql` (네이티브 MySQL을 쓰는 PC에서 root로 한 번 실행):

```sql
-- binCms 로컬 개발 DB·계정 생성 (네이티브 MySQL용). compose를 쓰면 불필요(환경변수가 같은 일을 함).
CREATE DATABASE IF NOT EXISTS bincms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'bincms'@'localhost' IDENTIFIED BY 'bincms1234';
CREATE USER IF NOT EXISTS 'bincms'@'%' IDENTIFIED BY 'bincms1234';
GRANT ALL PRIVILEGES ON bincms.* TO 'bincms'@'localhost';
GRANT ALL PRIVILEGES ON bincms.* TO 'bincms'@'%';
FLUSH PRIVILEGES;
```

- [ ] **Step 4: 백엔드를 네이티브 MySQL(3306)에 붙여 기동 확인**

```bash
cd /c/dev/workspace/binCms/backend && (./gradlew.bat bootRun --no-daemon > /c/Users/been8/AppData/Local/Temp/bincms-backend.log 2>&1 &) ; sleep 60; curl -s http://localhost:8080/api/v1/health
```

Expected: `{"success":true,"data":{"status":"UP",...}}`. 60초 안에 안 뜨면 로그 확인:

```bash
grep -n "Started CmsApplication\|ERROR\|Access denied\|Unknown database" /c/Users/been8/AppData/Local/Temp/bincms-backend.log | head
```

`Unknown database 'bincms'` 또는 `Access denied`면 Step 3의 SQL을 MySQL Workbench(또는 설치된 `mysql` 클라이언트)에서 root로 실행한 뒤 재시도. 이 두 오류 외의 실패는 코드 문제이므로 원인을 기록하고 사용자에게 보고한다(코드 수정은 이 계획 범위 밖).

- [ ] **Step 5: 관리자 로그인 API 확인 (시드가 들어갔는지)**

```bash
curl -s -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d '{"loginId":"admin","password":"1234"}' | head -c 300
```

Expected: `{"success":true,"data":{"accessToken":"eyJ...","tokenType":"Bearer","member":{...}}}`. (`DataInitializer`가 최초 기동 시 `admin/1234`를 만든다. 기존 DB에 다른 비밀번호의 admin이 있으면 그 비밀번호로 — 결과를 Task 4 문서에 반영.)

- [ ] **Step 6: 백엔드 종료 후 커밋**

```bash
# bootRun으로 뜬 java 프로세스 종료 (8080 점유 PID 찾아서)
netstat -ano | grep ":8080 " | awk '{print $5}' | sort -u | xargs -I{} taskkill //PID {} //F
cd /c/dev/workspace/binCms && git add backend/docker-compose.yml backend/db/init-local.sql backend/src/main/resources/application.yml && git commit -q -F - <<'EOF'
[개발] build: 로컬 MySQL compose·초기화 SQL 추가, DB 포트 환경변수화

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 3: 프론트엔드 설치·빌드·기동 확인

`frontend/node_modules`가 없다. `npm run lint`는 ESLint 설정 파일이 없어 실패하는 것이 현재 상태이며 이 계획에서는 고치지 않는다(5단계).

**Files:**
- (수정 없음. `frontend/package-lock.json`은 `.gitignore`에 있어 커밋되지 않는다.)

**Interfaces:**
- Produces: `npm run build` 성공이 이후 모든 단계의 프론트 회귀 기준.

- [ ] **Step 1: 의존성 설치**

```bash
cd /c/dev/workspace/binCms/frontend && npm install 2>&1 | tail -3
```

Expected: `added N packages` (경고는 무시). 실패하면 Node 버전(`node -v`, 현재 24) 확인 후 보고.

- [ ] **Step 2: 타입체크 + 빌드**

```bash
cd /c/dev/workspace/binCms/frontend && npm run build 2>&1 | tail -8
```

Expected: `✓ built in ...`, `dist/index.html` 생성. `tsc` 오류가 나면 **고치지 말고** 오류 목록을 Task 4의 dev-setup.md "알려진 문제" 절에 기록한다(동작 변경 금지 원칙). 단, `vite build`까지 가지 못하면 사용자에게 보고.

- [ ] **Step 3: lint가 현재 실패함을 기록용으로 확인**

```bash
cd /c/dev/workspace/binCms/frontend && npm run lint 2>&1 | tail -3
```

Expected: ESLint 설정 없음 오류(`No ESLint configuration found` 또는 유사). 이 결과를 Task 4 문서의 "알려진 문제"에 적는다.

- [ ] **Step 4: 개발 서버 기동 + 프록시 확인**

백엔드(Task 2 Step 4 방식)를 먼저 띄운 뒤:

```bash
cd /c/dev/workspace/binCms/frontend && (npm run dev > /c/Users/been8/AppData/Local/Temp/bincms-frontend.log 2>&1 &) ; sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/user
curl -s http://localhost:3000/api/v1/health | head -c 80
```

Expected: 첫 줄 `200`, 둘째 줄 `{"success":true,"data":{"status":"UP"` (Vite 프록시 → 8080).

- [ ] **Step 5: 서버 종료**

```bash
netstat -ano | grep -E ":3000 |:8080 " | awk '{print $5}' | sort -u | xargs -I{} taskkill //PID {} //F
```

(커밋할 변경 없음.)

### Task 4: dev-setup.md 초안 작성

**Files:**
- Create: `docs/30-dev/guides/dev-setup.md`

**Interfaces:**
- Produces: 1단계 `CLAUDE.md`·`README.md`가 이 파일을 "기동 방법" 단일 출처로 링크한다. 1단계에서 `docs/30-dev/`가 재편되어도 이 경로는 그대로다.

- [ ] **Step 1: 문서 작성**

`docs/30-dev/guides/dev-setup.md`:

```markdown
# 로컬 개발 환경 세팅

> 마지막 검증: 2026-10-12 (Windows 10, Node 24, JAVA_HOME=17, 네이티브 MySQL 8)

깨끗한 클론에서 이 문서대로 따라 하면 30분 안에 백엔드(8080)·프론트(3000)가 뜬다.

## 1. 필수 도구

| 도구 | 버전 | 비고 |
|---|---|---|
| Git | 아무 버전 | |
| Node.js | 20 이상 (검증: 24) | `node -v` |
| JDK | **설치 불필요** | Gradle toolchain이 JDK 21을 자동 다운로드. `JAVA_HOME`이 17이어도 됨 |
| MySQL 8 | 네이티브 **또는** Docker | 아래 §2 |

## 2. DB 준비 — 둘 중 하나

### 2-A. 네이티브 MySQL이 이미 있는 경우 (3306)

root로 한 번 실행:

```sql
-- backend/db/init-local.sql 내용
CREATE DATABASE IF NOT EXISTS bincms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'bincms'@'localhost' IDENTIFIED BY 'bincms1234';
GRANT ALL PRIVILEGES ON bincms.* TO 'bincms'@'localhost';
FLUSH PRIVILEGES;
```

백엔드는 기본값으로 `localhost:3306`에 붙는다.

### 2-B. Docker Desktop을 쓰는 경우 (3307)

```bash
docker compose -f backend/docker-compose.yml up -d --wait
```

백엔드 기동 시 `DB_PORT=3307`을 준다(§3).

## 3. 백엔드 (8080)

```bash
cd backend
./gradlew.bat bootRun            # 네이티브 MySQL
DB_PORT=3307 ./gradlew.bat bootRun   # Docker(PowerShell: $env:DB_PORT=3307; .\gradlew.bat bootRun)
```

- 첫 실행은 JDK 21 + 의존성 다운로드로 수 분.
- `local` 프로파일이 기본. `ddl-auto: update`라 테이블이 자동 생성되고, `DataInitializer`가 역할·권한·메뉴·관리자 계정·샘플 데이터를 심는다.
- 준비 판정: `curl http://localhost:8080/api/v1/health` → `{"success":true,...}`.
- 로컬 관리자 계정: `admin` / `1234` (DataInitializer가 생성).

## 4. 프론트엔드 (3000)

```bash
cd frontend
npm install
npm run dev
```

- `http://localhost:3000` → 사용자 홈(`/user`)으로 리다이렉트. 관리자는 `/admin/login`.
- `/api`·`/uploads`는 Vite 프록시로 8080에 전달된다(`vite.config.ts`). 코드에서 절대 주소를 쓰지 않는다.
- 빌드 확인: `npm run build` (tsc + vite).

## 5. 알려진 문제 (2026-10-12 기준)

- `npm run lint`는 ESLint 설정 파일이 없어 실패한다. 5단계에서 도입.
- `application.yml` local 프로파일에 OAuth·메일 비밀값이 평문으로 있다. 3단계에서 환경변수화. 그 전까지는 소셜 로그인·메일 인증이 그 키로 동작한다.
- 업로드 경로 `file.upload-dir`가 특정 PC 절대경로다. 다른 PC에서는 `application.yml`의 값을 바꿔야 파일 업로드가 된다(3단계에서 환경변수화).
- 테스트가 없다. `gradlew build`는 `-x test` 없이도 통과한다(테스트 0개).

## 6. 종료

각 터미널에서 Ctrl+C. Docker DB는 `docker compose -f backend/docker-compose.yml down`.
```

Task 3 Step 2·3에서 실측한 결과가 위와 다르면(예: tsc 오류 목록) §5에 그대로 추가한다.

- [ ] **Step 2: 문서대로 재현되는지 확인**

Task 2 Step 4 → Task 3 Step 4를 문서의 명령만 보고 다시 수행. health 200, `/user` 200 확인 후 종료(Task 3 Step 5).

- [ ] **Step 3: 커밋**

```bash
cd /c/dev/workspace/binCms && git add docs/30-dev/guides/dev-setup.md && git commit -q -F - <<'EOF'
[개발] docs: 로컬 개발 환경 세팅 가이드 작성

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
git log --oneline main..HEAD
```

Expected: 커밋 3개(`build` 2개, `docs` 1개).

- [ ] **Step 4: 0단계 완료 보고**

사용자에게 다음 머지 명령을 안내하고 **실행은 사용자 지시를 기다린다**:

```bash
git switch main && git merge chore/기준선-고정
```

---

## 1단계 — 지침 뼈대 (브랜치 `docs/지침-뼈대`)

0단계가 main에 머지된 뒤 시작한다. (머지 전이면 `chore/기준선-고정`에서 분기해도 된다 — 내용 충돌 없음.)

### Task 5: 문서 링크 검사 스크립트

이후 모든 문서 작업의 "테스트". Markdown 파일의 상대 링크 `[..](path)`가 실제 파일을 가리키는지 검사한다.

**Files:**
- Create: `scripts/check-doc-links.mjs`

**Interfaces:**
- Produces: `node scripts/check-doc-links.mjs [루트]` — 깨진 링크가 있으면 목록 출력 후 exit 1, 없으면 `OK (N links in M files)` 후 exit 0. 검사 대상: `*.md` 전체(`node_modules`·`.git`·`build`·`dist` 제외). `http(s)://`·`mailto:`·`#앵커만`인 링크는 건너뛴다. 링크의 `#fragment`는 떼고 파일 존재만 본다.

- [ ] **Step 1: 브랜치 생성**

```bash
cd /c/dev/workspace/binCms && git switch main && git switch -c docs/지침-뼈대 && git branch --show-current
```

- [ ] **Step 2: 실패 픽스처로 스크립트 동작을 먼저 정의**

```bash
mkdir -p /c/Users/been8/AppData/Local/Temp/linkfix/sub
printf '# A\n[ok](sub/b.md) [bad](nope.md) [web](https://x.y) [anchor](#top) [frag](sub/b.md#sec)\n' > /c/Users/been8/AppData/Local/Temp/linkfix/a.md
printf '# B\n' > /c/Users/been8/AppData/Local/Temp/linkfix/sub/b.md
node /c/dev/workspace/binCms/scripts/check-doc-links.mjs /c/Users/been8/AppData/Local/Temp/linkfix; echo "exit=$?"
```

Expected: `Cannot find module` 오류 (스크립트가 아직 없음).

- [ ] **Step 3: 스크립트 작성**

`scripts/check-doc-links.mjs`:

```js
#!/usr/bin/env node
// 문서 상대 링크 검사. 사용: node scripts/check-doc-links.mjs [루트=현재 디렉터리]
// 깨진 링크가 있으면 "파일:줄  링크" 목록을 출력하고 exit 1.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const SKIP_DIRS = new Set(['node_modules', '.git', 'build', 'dist', '.gradle', '.claude']);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (name.endsWith('.md')) yield p;
  }
}

const LINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
let files = 0, links = 0;
const broken = [];

for (const file of walk(root)) {
  files++;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(LINK_RE)) {
      let target = m[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      links++;
      target = target.split('#')[0];
      if (target === '') continue;
      const abs = resolve(dirname(file), decodeURI(target));
      if (!existsSync(abs)) broken.push(`${relative(root, file)}:${i + 1}  ${m[1]}`);
    }
  });
}

if (broken.length) {
  console.error(`BROKEN (${broken.length}):\n` + broken.join('\n'));
  process.exit(1);
}
console.log(`OK (${links} links in ${files} files)`);
```

- [ ] **Step 4: 픽스처로 검증**

```bash
node /c/dev/workspace/binCms/scripts/check-doc-links.mjs /c/Users/been8/AppData/Local/Temp/linkfix; echo "exit=$?"
```

Expected:
```
BROKEN (1):
a.md:2  nope.md
exit=1
```
(`sub/b.md`, `https://`, `#top`, `sub/b.md#sec`는 통과해야 한다.)

```bash
rm /c/Users/been8/AppData/Local/Temp/linkfix/a.md && printf '# A\n[ok](sub/b.md)\n' > /c/Users/been8/AppData/Local/Temp/linkfix/a.md
node /c/dev/workspace/binCms/scripts/check-doc-links.mjs /c/Users/been8/AppData/Local/Temp/linkfix; echo "exit=$?"
```

Expected: `OK (1 links in 2 files)`, `exit=0`.

- [ ] **Step 5: 현재 저장소에 돌려 기준선 기록**

```bash
cd /c/dev/workspace/binCms && node scripts/check-doc-links.mjs . ; echo "exit=$?"
```

Expected: 현재는 깨진 링크가 있을 수 있다(기존 문서). 출력을 기록만 하고 넘어간다 — Task 12에서 0이 되어야 한다.

- [ ] **Step 6: 커밋**

```bash
cd /c/dev/workspace/binCms && git add scripts/check-doc-links.mjs && git commit -q -F - <<'EOF'
[공통] build: 문서 상대 링크 검사 스크립트 추가

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 6: docs/ 영역 골격과 영역별 README

**Files:**
- Create: `docs/README.md` (기존 없음)
- Create: `docs/00-common/README.md`, `docs/00-common/glossary.md`, `docs/00-common/business.md`
- Create: `docs/10-product/README.md`
- Create: `docs/30-dev/README.md`
- (유지) `docs/30-dev/guides/dev-setup.md` (0단계), `docs/superpowers/`

**Interfaces:**
- Produces: `CLAUDE.md`(Task 10)의 라우팅 표가 `docs/README.md`를, `apps/CLAUDE.md`(2단계)가 `docs/30-dev/README.md`를 가리킨다. `30-dev/README.md`의 ADR 표는 Task 8의 파일명(`0001-tech-stack.md`, `0002-admin-react-spa.md`, `0003-auth-jwt.md`)을 미리 가리키므로 Task 8 전에는 링크 검사가 실패한다 — Task 8 뒤에 통과.

- [ ] **Step 1: docs/README.md 작성**

```markdown
# docs/

수디자인 인테리어 홈페이지(binCms)의 모든 문서. 역할 기반 번호 영역으로 나뉜다.

## 영역 안내

| 폴더 | 역할 | 주요 자료 |
|------|------|----------|
| [`00-common/`](00-common/) | 모두가 봄 | 업체 정보, 용어집 |
| [`10-product/`](10-product/) | 기획 (What · For Whom) | 사이트맵, 기능 목록 |
| [`30-dev/`](30-dev/) | 개발 (How It Works) | ADR, 컨벤션, DB 명명, 가이드, 런북 |
| [`superpowers/`](superpowers/) | 작업 기록 | 설계서(`specs/`)·구현 계획(`plans/`) |

`20-design/`(디자인)·`90-internal/`(비공개)은 **의도적으로 없다** — 디자이너·팀이 없다. 필요해지면 번호가 비어 있으니 추가한다.

## 명명 규칙

- **폴더명**: `숫자prefix-영문소문자`. 10단위 간격으로 사이 추가 여지 확보.
- **파일명**: 영문 소문자 케밥케이스. 내용은 한국어.
- **ADR**: 4자리 zero-pad 번호. 예: `0001-tech-stack.md`.
- **깊이 ≤ 3**: `docs/ → 영역/ → 서브폴더/`까지. 더 깊어지면 평면화한다.

## 어디에 둘지 헷갈릴 때

| 자료 성격 | 위치 |
|----------|------|
| "사용자(방문자·운영자)가 뭘 할 수 있는지" | `10-product/` |
| "어떻게 만드는지 / 왜 그렇게 결정했는지" | `30-dev/` |
| "업체 사실 / 용어" | `00-common/` |
| "이번 작업을 어떻게 할지" | `superpowers/` |

## 문서 규칙

- **현재 코드가 하는 것만 쓴다.** 바라는 상태는 "목표(N단계)"로 표시한다.
- 같은 규칙을 두 곳에 쓰지 않는다. 한 곳이 정본, 나머지는 링크.
- 상대 링크는 `node scripts/check-doc-links.mjs`로 검사한다(깨진 링크 0이 머지 조건).
```

- [ ] **Step 2: 00-common 작성**

`docs/00-common/README.md`:

```markdown
# 00-common — 공통 자료

모든 작업이 참고하는 **사실** 자료. 의견·결정 근거는 여기 두지 않는다(결정은 `30-dev/adr/`).

- [`business.md`](business.md) — 업체 정보(상호·연락처·주소·로고). 화면 문구의 정본.
- [`glossary.md`](glossary.md) — 용어집. 코드 식별자 ↔ 화면 용어 대응.

빠르게 변하는 자료는 `> 마지막 업데이트: YYYY-MM-DD`를 맨 위에 적는다.
```

`docs/00-common/business.md`:

```markdown
# 업체 정보 — 수디자인 (BIN INTERIOR)

> 마지막 업데이트: 2026-10-12. **대표(형)에게 확인 전** — 아래 값은 현재 코드에 박힌 문구이며 확정값이 아니다. 확정되면 이 파일을 고치고 화면에 반영한다(6단계).

| 항목 | 현재 코드의 값 | 출처 | 확정 여부 |
|---|---|---|---|
| 상호(화면) | 수디자인 | `UserLayout.tsx` 헤더·푸터 | 미확정 |
| 상호(메일 발신자) | BIN INTERIOR | `application.yml` `app.mail.from-name` | 미확정 |
| 로고 | `/uploads/etc/su_design_logo.png`, `su_design_logo_footer.png` | `UserLayout.tsx` | 파일은 업로드 폴더에 있어 저장소에 없음 |
| 홈 슬로건 | "당신의 공간을 새롭게 디자인합니다" | `HomePage.tsx` | 미확정 |
| 서비스 3종 | 현장시공 · 셀프시공 · 인테리어스토리 | `InteriorCategory` enum | 코드 구조와 결합 — 바꾸려면 ADR |
| 연락처·주소·사업자번호 | 없음 | — | 받아야 함 |
| 도메인 | 없음 | — | 8단계에서 결정 |

## 받아야 할 것 (대표에게)

- 정식 상호·대표자·연락처·주소·사업자등록번호
- 로고 원본(SVG 또는 고해상도 PNG)
- 소개 문구·슬로건
- 샘플 콘텐츠: 기존 블로그 글(시공사례·팁) — 4단계 이후 등록
```

`docs/00-common/glossary.md`:

```markdown
# 용어집

코드 식별자와 화면 용어의 대응. 새 도메인을 추가하면 여기에 한 줄 추가한다.

| 화면 용어 | 코드(도메인·enum) | 설명 |
|---|---|---|
| 관리자 | `SYSTEM_ADMIN` / `OPERATION_ADMIN` / `GENERAL_ADMIN` (`TB_ROLES.ROLE_CODE`) | 백오피스 사용자. 시스템 메뉴는 SYSTEM_ADMIN만 |
| 회원 | `USER` 역할, `TB_MEMBERS` | 사이트 가입자(이메일·카카오·네이버·구글) |
| 게시판 | `board` (`TB_BOARDS`, `boardCode`: `notice`·`faq`·`free`) | 게시판 정의. 게시글은 `post` |
| 공지사항 / 자주묻는질문 / 자유게시판 | `boardCode` = `notice` / `faq` / `free` | |
| 댓글 | `comment` | 자유게시판 게시글에 달림 |
| 콘텐츠 | `content` (`contentKey`) | 관리자가 편집하는 고정 페이지(`/user/page/:contentKey`) |
| 팝업 | `popup` | 홈 진입 시 뜨는 레이어 |
| 인테리어 / 시공사례 | `interior`, `InteriorCategory`: `ONSITE`(현장시공) · `SELF_TIP`(셀프시공) · `STORY`(인테리어스토리) | 갤러리형 게시판 |
| 견적문의 | `inquiry` | 비로그인 방문자가 남기는 문의. 관리자가 조회 |
| 메뉴 | `menu`, `MenuType` | 관리자 사이드메뉴·사용자 GNB 정의(DB) |
| 권한 | `permission` (`permCode`: `MENU_*`) | 관리자 메뉴 접근 권한. 역할에 매핑 |
| 파일 | `file` (`TB_FILES`, `/uploads/**`) | 업로드 이미지 |
```

- [ ] **Step 3: 10-product README 작성**

`docs/10-product/README.md`:

```markdown
# 10-product — 기획

사이트가 **무엇을 제공하는지, 누구를 위한 것인지**. 화면·기능의 목록은 여기, 구현 방법은 `30-dev/`.

## 구성

- [`sitemap.md`](sitemap.md) — 사용자·관리자 화면 전체 목록(URL · 역할 · 코드 위치). 현재 코드 기준.

## 사용자 (두 부류)

- **방문자**: 시공사례·팁을 보고 견적문의를 남기는 잠재 고객. 가입하면 자유게시판에 글·댓글.
- **운영자**: 업체 대표 한 명(비개발자). 관리자 화면에서 시공사례·공지·팝업을 올리고 문의를 확인한다.

새 기능을 기획할 때는 "운영자가 혼자 관리할 수 있는가"를 먼저 본다(설계서 §1-1).
```

`sitemap.md`는 Task 11에서 작성(README가 가리키므로 Task 11 전에는 링크 검사가 실패 — Task 12에서 최종 확인).

- [ ] **Step 4: 30-dev README 작성**

`docs/30-dev/README.md`:

```markdown
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
| [0003](adr/0003-auth-jwt.md) | 인증: JWT Bearer + 역할(SYSTEM/OPERATION/GENERAL_ADMIN, USER) | accepted |

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
```

- [ ] **Step 5: 링크 검사 (예상된 실패 확인)**

```bash
cd /c/dev/workspace/binCms && node scripts/check-doc-links.mjs docs; echo "exit=$?"
```

Expected: 깨진 링크가 정확히 `30-dev/README.md`의 `adr/000{1,2,3}-*.md` 3개 + `10-product/README.md`의 `sitemap.md` 1개 + 기존 낡은 문서의 것들. 새로 쓴 파일에서 그 외 깨진 링크가 나오면 고친다.

- [ ] **Step 6: 커밋**

```bash
cd /c/dev/workspace/binCms && git add docs/README.md docs/00-common docs/10-product/README.md docs/30-dev/README.md && git commit -q -F - <<'EOF'
[공통] docs: docs 영역 골격(00-common·10-product·30-dev)과 README 작성

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 7: db-naming.md — 기존 ADR-0007 내용 구출

기존 `docs/adr/0007-database-naming-convention.md`의 규칙 + 현재 엔티티에서 관찰되는 규칙을 합쳐 단일 출처로 만든다. 이 파일이 생긴 뒤 Task 9에서 ADR-0007을 삭제한다.

**Files:**
- Create: `docs/30-dev/db-naming.md`
- Read: `backend/src/main/java/com/bincms/common/entity/BaseEntity.java`, `domain/member/entity/Member.java`, `domain/interior/entity/Interior.java` (사실 확인용)

- [ ] **Step 1: 현재 엔티티 명명을 grep으로 확인**

```bash
cd /c/dev/workspace/binCms/backend/src/main/java/com/bincms && grep -rhn '@Table(name = "' --include=*.java . | sed 's/.*name = "\([^"]*\)".*/\1/' | sort
grep -rhn '@Index(name = "' --include=*.java . | sed 's/.*name = "\([^"]*\)".*/\1/' | sort | head
```

Expected: 테이블이 모두 `TB_` + 복수형 대문자(`TB_MEMBERS`, `TB_INTERIORS`...), 인덱스가 `IDX_테이블_컬럼`. 예외가 있으면 문서의 "현재 예외" 절에 그대로 적는다.

- [ ] **Step 2: 문서 작성**

`docs/30-dev/db-naming.md`:

```markdown
# DB 오브젝트 명명 규칙

> 정본. JPA `@Table`/`@Column`·네이티브 SQL·Flyway SQL(4단계) 모두 이 규칙을 따른다. 2026-02-05 ADR-0007(삭제됨)에서 이관, 2026-10-12 현재 코드로 검증.

## 테이블

- 접두어 `TB_` + **대문자 스네이크** + **복수형**. 예: `TB_MEMBERS`, `TB_BOARDS`, `TB_POSTS`, `TB_INTERIORS`, `TB_ROLE_PERMISSIONS`.
- 엔티티 클래스는 단수(`Member`) ↔ 테이블은 복수(`TB_MEMBERS`).

## 컬럼

- 대문자 스네이크. 예: `EMAIL`, `PHONE_NUMBER`, `THUMBNAIL_URL`.
- PK는 `ID`(BIGINT, IDENTITY).
- FK는 `참조테이블단수_ID`. 예: `ROLE_ID`, `BOARD_ID`.
- 접미사 규칙:
  - 여부 `_YN` (`USE_YN`, `DEL_YN`; 값 `'Y'`/`'N'`, `CHAR(1)`)
  - 일시 `_DT` (`REG_DT`, `MOD_DT`)
  - 코드 `_CODE` (`ROLE_CODE`, `PERM_CODE`, `BOARD_CODE`)
  - 순서 `SORT_ORDER`, 카운트 `_COUNT` (`VIEW_COUNT`)
- 공통 감사 컬럼(`BaseEntity`, 모든 테이블): `REG_DT`(등록일시, not null), `MOD_DT`(수정일시, not null), `REG_NO`(등록자 loginId, varchar 100), `MOD_NO`(수정자).
- 약어는 기존 것만 쓴다: `LGN_ID`(로그인 ID), `REG`/`MOD`(등록/수정), `PERM`(권한). 새 약어를 만들지 않는다.

## 인덱스·제약

| 종류 | 형식 | 예 |
|---|---|---|
| 인덱스 | `IDX_테이블명(접두어 제외)_컬럼` | `IDX_INTERIORS_CATEGORY` |
| 유니크 | `UK_테이블명_컬럼` | `UK_MEMBERS_LGN_ID` |
| FK | `FK_자식테이블_부모테이블` | `FK_MEMBERS_ROLES` |

(현재 코드는 유니크를 `@Column(unique = true)`로, FK를 JPA 기본 이름으로 생성한다. 4단계 Flyway `V1__init.sql`에서 위 이름으로 정리하는 것이 목표.)

## enum

- Java enum은 `@Enumerated(EnumType.STRING)`, 컬럼은 `VARCHAR(20~30)`. 예: `CATEGORY` ← `InteriorCategory.ONSITE`.

## 현재 예외 (고칠 것, 4단계)

- `Inquiry` 엔티티의 `@Table(name = "tb_inquiries")`가 **소문자** — 유일한 예외. MySQL(Windows)은 대소문자를 구분하지 않아 동작하지만 4단계 `V1__init.sql`에서 `TB_INQUIRIES`로 통일한다. Step 1에서 다른 예외가 나오면 여기에 추가.
```

- [ ] **Step 3: 커밋**

```bash
cd /c/dev/workspace/binCms && git add docs/30-dev/db-naming.md && git commit -q -F - <<'EOF'
[공통] docs: DB 명명 규칙을 db-naming.md로 이관

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 8: ADR 템플릿 + 0001·0002·0003

**Files:**
- Create: `docs/30-dev/adr/0000-template.md`
- Create: `docs/30-dev/adr/0001-tech-stack.md`
- Create: `docs/30-dev/adr/0002-admin-react-spa.md`
- Create: `docs/30-dev/adr/0003-auth-jwt.md`

**Interfaces:**
- Produces: Task 6의 `30-dev/README.md` ADR 표가 가리키는 세 파일. 3단계가 `0003-auth-jwt.md`를 갱신(supersede 아님, 같은 파일의 Status·Decision 개정).

- [ ] **Step 1: 템플릿**

`docs/30-dev/adr/0000-template.md`:

```markdown
# 0000. (제목 — 결정을 한 줄로)

- **Status**: proposed | accepted | deprecated | superseded by ADR-XXXX
- **Date**: YYYY-MM-DD
- **Deciders**: 사용자

## Context

왜 결정이 필요했나. 배경·제약을 한두 단락으로.

## Decision

무엇으로 결정했나. 단정적으로("X를 사용한다").

## Consequences

### 좋아지는 것
-

### 나빠지는 것 / 트레이드오프
-

### 후속 작업
-

## Considered Alternatives

### Option A — (이름)
- Pros:
- Cons:

---

> [MADR](https://adr.github.io/madr/) 변형. 이 파일을 복사해 `adr/000N-name.md`로 저장.
```

- [ ] **Step 2: ADR-0001 기술 스택 (현행 사실대로)**

`docs/30-dev/adr/0001-tech-stack.md`:

```markdown
# 0001. 기술 스택: React SPA + Spring Boot 3 + MySQL, Gradle

- **Status**: accepted
- **Date**: 2026-10-12 (코드는 2026-02부터 이 스택으로 작성됨. 재정비 시점에 사후 기록)
- **Deciders**: 사용자

## Context

2026-02에 "AI를 모를 때" 만든 코드가 이미 13개 도메인·23개 화면으로 동작한다. 재정비(설계서 `docs/superpowers/specs/2026-10-12-project-restructure-design.md`)는 제자리 정비(A안)로 결정됐으므로, 스택은 **현행을 사실대로 기록**하고 바꾸지 않는다. 이전 ADR 7개는 전자정부 프레임워크·Thymeleaf·MyBatis 등 실제 코드와 다른 전제를 담고 있어 전부 폐기했다.

## Decision

| 축 | 결정 |
|----|------|
| 플랫폼 | 반응형 웹. 사용자(`/user/**`)와 관리자(`/admin/**`)가 한 SPA |
| 프론트엔드 | React 18 + Vite 5 + TypeScript 5 (strict) |
| 프론트 상태 | 서버 상태 TanStack Query 5 / 전역 Zustand 4 / 라우팅 React Router 6 |
| UI | 관리자 Ant Design 5 (→ ADR-0002) / 사용자 자체 CSS |
| 에디터 | CKEditor 5 (게시글·콘텐츠·인테리어 본문) |
| 백엔드 | Spring Boot 3.3, Java 21 (Gradle toolchain 자동 다운로드), Gradle 8.7, Lombok |
| 데이터 접근 | Spring Data JPA + QueryDSL 5 |
| DB | MySQL 8 (local). PostgreSQL 드라이버도 의존성에 있으나 사용 안 함 |
| 스키마 | 현재 `ddl-auto: update` + `DataInitializer` 시드 → **목표(4단계)**: Flyway + `validate` |
| 인증 | JWT Bearer (→ ADR-0003) |
| 소셜 로그인 | 카카오·네이버·구글 OAuth code 교환을 서버가 수행 |
| 메일 | Spring Mail (Gmail SMTP) — 이메일 인증 코드 |
| 파일 | 로컬 디스크 업로드, `/uploads/**` 정적 서빙 |
| API 응답 | `ApiResponse<T>` `{ success, data, message }` + `PageResponse<T>`, 전역 `GlobalExceptionHandler` |
| 테스트 | 현재 0개 → **목표(3·5단계)**: JUnit 5 + MockMvc + Testcontainers(MySQL) |
| 패키지 매니저 | npm (lock 파일은 git 제외 — 목표(2단계): lock 커밋 여부 결정) |
| 배포 | 미정 → ADR-0005(8단계) |

## Consequences

### 좋아지는 것
- 동작하는 코드를 그대로 쓴다. 문서와 코드가 일치한다.

### 나빠지는 것 / 트레이드오프
- PostgreSQL·H2 설정 잔재가 `application.yml`에 남아 있다(3단계에서 정리).
- 사용자 화면과 관리자 화면의 스타일 체계가 둘(자체 CSS vs antd)이다. 한 SPA 번들이라 사용자 화면에도 antd가 실린다 — 6단계에서 번들 분리 여부 검토.

### 후속 작업
- 4단계 Flyway, 3단계 보안·비밀값, 8단계 배포 ADR.

## Considered Alternatives

### Option A — the-empty-map처럼 Thymeleaf SSR 관리자 + Maven 멀티모듈
- Pros: 관리자 화면·API를 한 출처에서 서빙, 세션 인증 단순.
- Cons: 11개 관리자 화면을 다시 써야 한다. 1인 프로젝트에 비용 과다. (ADR-0002)
```

- [ ] **Step 3: ADR-0002 관리자 React SPA 유지**

`docs/30-dev/adr/0002-admin-react-spa.md`:

```markdown
# 0002. 관리자 UI는 React + Ant Design SPA를 유지한다

- **Status**: accepted
- **Date**: 2026-10-12
- **Deciders**: 사용자

## Context

참고 프로젝트(the-empty-map)는 관리자를 Thymeleaf SSR + Bootstrap으로 두고 "admin은 React 아님"을 절대 규칙으로 삼았다. 본 프로젝트는 이미 관리자 11개 화면(대시보드·게시판·게시글·메뉴·관리자회원·권한·콘텐츠·팝업·인테리어·문의·회원)이 React + antd로 동작하고, 운영자는 비개발자 한 명이다.

## Decision

관리자 UI는 **React + Ant Design SPA를 유지**한다. 사용자 화면과 같은 Vite 앱 안에 `/admin/**` 라우트로 둔다.

- 관리자 인증은 `adminAuthStore`(JWT) + `PermissionGuard`(프론트 메뉴 권한 가드). 서버 권한 강제는 ADR-0003(3단계 개정)에서.
- 관리자 화면 파일은 목록·폼·훅으로 분할한다(7단계). 파일당 300줄 이하가 목표.

## Consequences

### 좋아지는 것
- 재작성 비용 0. antd의 테이블·폼·모달로 CRUD 생산성이 높다.

### 나빠지는 것 / 트레이드오프
- 권한이 프론트에만 있으면 뚫린다 → 서버 `ROLE_*` 강제가 필수(3단계).
- 사용자 번들에 antd가 포함된다(6단계에서 code-splitting 검토).

### 후속 작업
- 3단계: `/api/v1/admin/**` 서버 권한 강제.
- 7단계: 화면 분할 + 운영자 매뉴얼.

## Considered Alternatives

### Option A — Thymeleaf SSR로 전환
- Pros: 동일 출처·세션·CSRF 기본 보호. 빌드 단계 없음.
- Cons: 11개 화면 재작성. CKEditor·동적 메뉴 트리 등을 서버 렌더로 다시 구현.

### Option B — 관리자를 별도 Vite 앱으로 분리
- Pros: 번들 분리.
- Cons: 공유 코드(api client·types) 관리 부담. 지금은 code-splitting으로 충분.
```

- [ ] **Step 4: ADR-0003 인증 JWT (현행 + 3단계 목표)**

`docs/30-dev/adr/0003-auth-jwt.md`:

```markdown
# 0003. 인증은 JWT Bearer, 역할은 SYSTEM/OPERATION/GENERAL_ADMIN + USER

- **Status**: accepted (3단계에서 권한 강제 규칙을 이 문서에 개정 예정)
- **Date**: 2026-10-12
- **Deciders**: 사용자

## Context

현행 코드: `POST /api/v1/auth/login` → `LoginResponse { accessToken, tokenType: "Bearer", member }`. `JwtTokenProvider`가 subject=loginId, claim `role`=역할 코드로 24시간(local) 토큰을 발급하고, `JwtAuthenticationFilter`가 `Authorization: Bearer`를 읽어 `ROLE_<role>` 권한 하나를 부여한다. 세션은 STATELESS, CSRF 비활성.

역할(`TB_ROLES.ROLE_CODE`): `SYSTEM_ADMIN`(전체), `OPERATION_ADMIN`(시스템 메뉴 제외), `GENERAL_ADMIN`(기본 관리), `USER`(회원). 역할↔권한(`TB_PERMISSIONS.PERM_CODE` = `MENU_*`) 매핑은 `TB_ROLE_PERMISSIONS`. 프론트 `PermissionGuard`가 메뉴 권한으로 라우트를 가린다.

**문제**: `SecurityConfig`가 `/api/v1/admin/**`를 포함해 거의 모든 경로를 `permitAll`로 열어 두어, 서버는 권한을 강제하지 않는다.

## Decision

- 인증 방식은 **JWT Bearer를 유지**한다(세션 전환은 프론트 전체 수정 대비 이득 없음).
- 역할 모델은 현행 4역할을 유지한다. 관리자 3역할은 모두 `isAdmin()`이고, 시스템 메뉴는 `SYSTEM_ADMIN`만.
- **서버 권한 강제(3단계 목표)**: URL 접두어로 요구 권한이 결정된다.

  | 접두어 | 요구 |
  |---|---|
  | `/api/v1/admin/**` | `ROLE_SYSTEM_ADMIN` 또는 `ROLE_OPERATION_ADMIN` 또는 `ROLE_GENERAL_ADMIN` |
  | `/api/v1/user/**` | 인증(아무 역할) |
  | `/api/v1/public/**`, `/api/v1/auth/login`, `/api/v1/auth/signup`, `/uploads/**`, `/api/v1/health` | 익명 허용 |

  현재 `/api/v1/{boards,posts,comments,contents,menus,files,inquiries}/**`처럼 접두어 없는 관리자 엔드포인트는 3단계에서 `/api/v1/admin/...`으로 **경로 통일**한다(설계서 §4 3단계, 사용자 결정 2026-10-12).

## Consequences

### 좋아지는 것
- 접두어만 보면 권한이 드러나 `SecurityConfig`가 짧아진다.

### 나빠지는 것 / 트레이드오프
- JWT는 서버에서 강제 만료가 안 된다 → 운영 토큰 만료 1시간(prod 설정 유지), 탈퇴·차단은 `ACTIVE` 플래그를 필터에서 확인(3단계).
- CSRF 비활성은 Bearer 헤더 방식이라 허용. 쿠키로 바꾸면 재검토.

### 후속 작업
- 3단계: `SecurityConfig` 재작성, 경로 통일, 보안 규칙 MockMvc 테스트, 비밀값 환경변수화.

## Considered Alternatives

### Option A — Spring Security 세션 쿠키 + 폼 로그인 (the-empty-map 방식)
- Pros: 강제 로그아웃·CSRF 기본 보호.
- Cons: 프론트 인증 저장소·axios 인터셉터·OAuth 콜백 전면 수정.
```

- [ ] **Step 5: 링크 검사**

```bash
cd /c/dev/workspace/binCms && node scripts/check-doc-links.mjs docs/30-dev; echo "exit=$?"
```

Expected: `OK` (30-dev 하위는 이제 전부 존재). 전체 `docs`는 아직 `sitemap.md`·낡은 문서 때문에 실패해도 된다.

- [ ] **Step 6: 커밋**

```bash
cd /c/dev/workspace/binCms && git add docs/30-dev/adr && git commit -q -F - <<'EOF'
[공통] docs: ADR 템플릿과 0001 스택·0002 관리자 SPA·0003 JWT 인증 작성

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 9: 낡은 문서·IDE 잔재 삭제, .gitignore 보강

**Files:**
- Delete: `docs/agent/` (전체 15파일), `docs/plans/` (전체 4파일), `docs/adr/` (전체 9파일), `.project`, `.settings/`, `db_seed_content.sql`
- Modify: `.gitignore`

삭제 근거: `docs/agent`는 전자정부·다중사이트 CMS 전제의 에이전트 체계로 현 코드와 무관. `docs/adr`는 파일명과 내용이 모순(0001 `use-egov`인데 내용은 "순수 Spring Boot"), 0007은 Task 7로 이관 완료. `docs/plans`는 2026-02 초기 세팅 계획으로 완료·폐기. `.project`/`.settings`는 Eclipse Buildship 잔재. `db_seed_content.sql`은 `MENU_CONTENT` 권한 보충 스크립트인데 `DataInitializer.supplementMissingData()`(369행)가 같은 일을 하므로 중복.

- [ ] **Step 1: 삭제 대상 확인**

```bash
cd /c/dev/workspace/binCms && git ls-files docs/agent docs/plans docs/adr .project .settings db_seed_content.sql | wc -l
grep -n "MENU_CONTENT" backend/src/main/java/com/bincms/config/DataInitializer.java | head -2
```

Expected: 파일 수 30(15+4+9+1+1) 내외, DataInitializer에 `MENU_CONTENT` 보충 코드 존재.

- [ ] **Step 2: 삭제**

```bash
cd /c/dev/workspace/binCms && git rm -r -q docs/agent docs/plans docs/adr .project .settings db_seed_content.sql && git status --short | head -5 && ls docs
```

Expected: `docs`에 `00-common 10-product 30-dev README.md superpowers`만 남음.

- [ ] **Step 3: .gitignore 보강**

`.gitignore` 맨 아래 `# Docs drafts` 블록을 다음으로 교체:

```gitignore
# Claude 개인 규칙 (사람마다 다름 — 커밋 금지)
CLAUDE.local.md

# 로컬 업로드·DB 백업
uploads/
backend/db-backup/

# Docs drafts
docs/drafts/
```

- [ ] **Step 4: ignore 동작 확인**

```bash
cd /c/dev/workspace/binCms && git check-ignore -v CLAUDE.local.md backend/db-backup/x.sql uploads/a.png
```

Expected: 세 경로 모두 `.gitignore:` 규칙과 함께 출력(무시됨).

- [ ] **Step 5: 커밋**

```bash
cd /c/dev/workspace/binCms && git add .gitignore && git commit -q -F - <<'EOF'
[공통] remove: 낡은 docs/agent·plans·adr와 Eclipse 잔재 삭제, .gitignore 보강

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 10: 루트 CLAUDE.md + .claude/rules/git-branch.md

**Files:**
- Create: `CLAUDE.md`
- Create: `.claude/rules/git-branch.md`

**Interfaces:**
- Produces: 라우팅 표가 `docs/README.md`, `apps/CLAUDE.md`(2단계에서 생성 — 그 전까지는 `backend/`·`frontend/` 경로를 가리킴)를 가리킨다. 2단계 Task가 이 표의 코드 행을 `apps/`로 바꾼다.

- [ ] **Step 1: CLAUDE.md 작성**

`CLAUDE.md`:

```markdown
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

- 로컬 기동: [`docs/30-dev/guides/dev-setup.md`](docs/30-dev/guides/dev-setup.md). 백엔드 8080, 프론트 3000, MySQL 3306(네이티브) 또는 3307(Docker).
- 회귀 기준: `backend/gradlew.bat build`, `frontend`에서 `npm run build` 통과 + `curl localhost:8080/api/v1/health` 200.
- 문서 링크: `node scripts/check-doc-links.mjs` 깨진 링크 0.

## 7. 현재 단계

- 2026-10-12: 재정비 설계서 승인. 0단계(기준선)·1단계(지침 뼈대) 진행.
- 다음: 2단계 `apps/` 구조 정리 → 3단계 보안·비밀값 → 4단계 Flyway → 5단계 기능 가이드·verify 스킬 → 6단계 사용자 화면 → 7단계 관리자 화면·운영 매뉴얼 → 8단계 배포.

## 8. 팀 컨벤션 / 피드백

작업하면서 **반복해서 같은 교정**이 들어오는 항목을 한 줄씩 누적한다. 채우는 주체는 사용자.

- **운영자는 형 한 명(비개발자)** (2026-10-12, 사용자) — 기능을 설계할 때 "관리자 화면에서 혼자 할 수 있는가"를 먼저 본다. 개발자 개입이 필요한 운영 절차는 만들지 않는다.
```

- [ ] **Step 2: .claude/rules/git-branch.md 작성**

`.claude/rules/git-branch.md`:

```markdown
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
```

- [ ] **Step 3: 링크 검사 (루트 포함)**

```bash
cd /c/dev/workspace/binCms && node scripts/check-doc-links.mjs . ; echo "exit=$?"
```

Expected: 깨진 링크는 `README.md`(아직 옛 내용 — Task 11에서 교체)와 `docs/10-product/README.md`의 `sitemap.md`뿐. `CLAUDE.md`·`.claude/rules/git-branch.md`에서 깨진 링크가 나오면 고친다. (주의: 스크립트의 `SKIP_DIRS`에 `.claude`가 있으므로 `git-branch.md`는 검사되지 않는다 — 다음 명령으로 수동 확인.)

```bash
cd /c/dev/workspace/binCms/.claude/rules && ls ../../CLAUDE.md
```

Expected: `../../CLAUDE.md` 존재.

- [ ] **Step 4: 커밋**

```bash
cd /c/dev/workspace/binCms && git add CLAUDE.md .claude/rules/git-branch.md && git commit -q -F - <<'EOF'
[공통] docs: 루트 CLAUDE.md 진입 안내서와 Git 브랜치 규칙 추가

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 11: README.md 재작성 + sitemap.md

**Files:**
- Modify: `README.md` (전체 교체)
- Create: `docs/10-product/sitemap.md`

- [ ] **Step 1: sitemap.md 작성 — App.tsx 라우트를 그대로 옮긴다**

먼저 라우트를 재확인:

```bash
cd /c/dev/workspace/binCms && grep -n '<Route ' frontend/src/App.tsx | sed 's/^\s*//' | head -60
```

`docs/10-product/sitemap.md`:

```markdown
# 사이트맵 (현재 코드 기준)

> 출처: `frontend/src/App.tsx` 라우트. 2026-10-12. 라우트를 바꾸면 이 표도 같은 브랜치에서 고친다(5단계에서 `features/` 가이드로 승격).

## 사용자 (`/user`, 레이아웃 `UserLayout`)

| URL | 화면 | 접근 | 코드 |
|---|---|---|---|
| `/` | → `/user` 리다이렉트 | 모두 | `App.tsx` |
| `/user` | 홈(히어로·서비스 3종·견적 CTA) | 모두 | `user/pages/HomePage.tsx` |
| `/user/notice` | 공지사항 목록 | 모두 | `PostListPage` (`boardCode=notice`) |
| `/user/faq` | 자주묻는질문 | 모두 | `PostListPage` (`faq`) |
| `/user/free` | 자유게시판(글·댓글) | 조회 모두 / 작성 로그인 | `FreeBoardPage`, `CommentSection` |
| `/user/interior/onsite` | 현장시공 갤러리 | 모두 | `InteriorGalleryPage` (`ONSITE`) |
| `/user/interior/self-tip` | 셀프시공 갤러리 | 모두 | `InteriorGalleryPage` (`SELF_TIP`) |
| `/user/interior/story` | 인테리어스토리 갤러리 | 모두 | `InteriorGalleryPage` (`STORY`) |
| `/user/inquiry` | 견적문의 작성 | 모두 | `InquiryPage` |
| `/user/page/:contentKey` | 관리자 편집 고정 페이지 | 모두 | `ContentPage` |
| `/user/login` | 회원 로그인(이메일·카카오·네이버·구글) | 비로그인 | `UserLogin` |
| `/user/signup`, `/user/signup/email` | 회원가입(이메일 인증) | 비로그인 | `UserSignup`, `EmailSignup` |
| `/user/oauth/callback/{kakao,naver,google}` | 소셜 로그인 콜백 | — | `OAuthCallback` |
| `/user/mypage` | 내 정보 수정·탈퇴 | 로그인 | `MyPage` |

홈 진입 시 활성 팝업 레이어(`PopupLayer`)가 뜬다.

## 관리자 (`/admin`, 레이아웃 `AdminLayout`, 인증 `adminAuthStore`)

| URL | 화면 | 권한(프론트 가드) | 코드 |
|---|---|---|---|
| `/admin/login`, `/admin/signup` | 관리자 로그인·가입 | 비로그인 | `pages/auth/Login`, `Signup` |
| `/login`, `/signup` | → `/admin/...` 리다이렉트 | | |
| `/admin` | 대시보드 | 로그인 | `pages/admin/Dashboard` |
| `/admin/posts`, `/admin/posts/{notice,faq,free}` | 게시글 관리 | `MENU_POST` | `PostManagement` |
| `/admin/posts/qna` | 견적문의 관리 | `MENU_POST` | `InquiryManagement` |
| `/admin/contents` | 콘텐츠(고정 페이지) 관리 | `MENU_CONTENT` | `ContentManagement` |
| `/admin/popups` | 팝업 관리 | `MENU_POPUP` | `PopupManagement` |
| `/admin/interiors/{onsite,self-tip,story}` | 인테리어 관리 | `MENU_INTERIOR` | `InteriorManagement` |
| `/admin/users` | 회원 관리(차단 포함) | `MENU_USER` | `UserManagement` |
| `/admin/system/menus` | 메뉴 관리 | `MENU_SYSTEM_MENU` | `MenuManagement` |
| `/admin/system/admins` | 관리자 회원 관리 | `MENU_SYSTEM_ADMIN` | `AdminMemberManagement` |
| `/admin/system/boards` | 게시판 설정 | `MENU_SYSTEM_BOARD` | `BoardManagement` |
| `/admin/system/roles` | 권한 관리 | `MENU_SYSTEM_ROLE` | `RoleManagement` |
| `/admin/profile`, `/admin/statistics`, `/admin/system/ips`, `/admin/system/codes` | "개발 예정" 플레이스홀더 | | `App.tsx` 인라인 |

권한 코드 ↔ 라우트 매핑의 정본은 `frontend/src/shared/constants/permissions.ts`. 위 표의 권한 열이 그 파일과 다르면 파일이 맞다 — 표를 고친다.

## 의도적 미구현

- 통계·IP 관리·공통코드·관리자 프로필: 라우트만 있고 "개발 예정" 텍스트. 운영에 필요하면 기획 후 구현, 아니면 메뉴에서 제거(7단계에서 결정).
```

작성 후 권한 열을 실제 파일과 대조:

```bash
cd /c/dev/workspace/binCms && grep -n "MENU_" frontend/src/shared/constants/permissions.ts | head -30
```

다르면 표를 파일에 맞춘다.

- [ ] **Step 2: README.md 전체 교체**

`README.md`:

```markdown
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
├── backend/           # Spring Boot (Gradle)          ← 2단계에서 apps/backend 로 이동
├── frontend/          # React + Vite                  ← 2단계에서 apps/frontend 로 이동
├── docs/
│   ├── 00-common/     # 업체 정보·용어집
│   ├── 10-product/    # 사이트맵·기획
│   ├── 30-dev/        # ADR·DB 명명·가이드·런북
│   └── superpowers/   # 재정비 설계서·구현 계획
└── scripts/           # 문서 링크 검사 등
```

## 로컬 실행

[`docs/30-dev/guides/dev-setup.md`](docs/30-dev/guides/dev-setup.md) — 필수 도구, DB 준비(네이티브 또는 Docker), 백엔드 8080·프론트 3000 기동, 알려진 문제.

요약:

```bash
cd backend && ./gradlew.bat bootRun      # http://localhost:8080/api/v1/health
cd frontend && npm install && npm run dev # http://localhost:3000
```

로컬 관리자: `admin` / `1234`.

## 현재 상태

2026-02에 만든 코드를 2026-10부터 재정비 중. 단계와 진행은 [`CLAUDE.md`](CLAUDE.md) §7, 설계서는 [`docs/superpowers/specs/2026-10-12-project-restructure-design.md`](docs/superpowers/specs/2026-10-12-project-restructure-design.md).

## 라이선스

비공개(업체 납품용).
```

- [ ] **Step 3: 금지어 검사 — 없는 기능을 언급하지 않는지**

```bash
cd /c/dev/workspace/binCms && grep -n -i "다중 사이트\|multi-site\|템플릿 시스템\|h2-console\|H2 Console\|에이전트\|egov\|전자정부\|PostgreSQL (운영)\|MIT" README.md CLAUDE.md docs/README.md docs/10-product/*.md docs/00-common/*.md; echo "exit=$?"
```

Expected: `exit=1` (일치 없음). ADR-0001은 "전자정부…폐기했다"는 문맥상 언급이 허용되므로 검사 대상에서 뺐다.

- [ ] **Step 4: 커밋**

```bash
cd /c/dev/workspace/binCms && git add README.md docs/10-product/sitemap.md && git commit -q -F - <<'EOF'
[공통] docs: README 재작성, 현재 라우트 기준 사이트맵 작성

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 12: 1단계 전체 검증

**Files:** (없음 — 검증만)

- [ ] **Step 1: 링크 검사 전체 통과**

```bash
cd /c/dev/workspace/binCms && node scripts/check-doc-links.mjs . ; echo "exit=$?"
```

Expected: `OK (N links in M files)`, `exit=0`. 실패하면 해당 파일을 고치고 `[공통] fix: 문서 링크 수정`으로 커밋.

- [ ] **Step 2: 코드 동작 불변 확인 — 코드 파일 diff가 0**

```bash
cd /c/dev/workspace/binCms && git diff --stat main..HEAD -- backend/src frontend/src | tail -1
```

Expected: 출력 없음(코드 변경 0). (0단계의 `build.gradle`·`application.yml`·`settings.gradle`은 `backend/src`가 아니거나 포트 한 줄이라 허용.)

- [ ] **Step 3: 빌드 회귀**

```bash
cd /c/dev/workspace/binCms/backend && ./gradlew.bat build --no-daemon -q 2>&1 | tail -3; echo "gradle=$?"
cd /c/dev/workspace/binCms/frontend && npm run build 2>&1 | tail -2; echo "npm=$?"
```

Expected: 둘 다 `0`.

- [ ] **Step 4: 삭제 목록·신규 목록 최종 확인**

```bash
cd /c/dev/workspace/binCms && git diff --name-status main..HEAD | grep -E "^(A|D)" | sort
```

Expected: `D`에 `docs/agent/*`, `docs/plans/*`, `docs/adr/*`, `.project`, `.settings/*`, `db_seed_content.sql`. `A`에 `CLAUDE.md`, `.claude/rules/git-branch.md`, `scripts/check-doc-links.mjs`, `docs/README.md`, `docs/00-common/{README,business,glossary}.md`, `docs/10-product/{README,sitemap}.md`, `docs/30-dev/{README,db-naming}.md`, `docs/30-dev/adr/000{0,1,2,3}-*.md`, (0단계) `backend/docker-compose.yml`, `backend/db/init-local.sql`, `docs/30-dev/guides/dev-setup.md`.

- [ ] **Step 5: 1단계 완료 보고**

사용자에게 완료 기준 충족을 보고하고 머지 명령을 안내한다(실행은 사용자 지시 대기):

```bash
git switch main && git merge docs/지침-뼈대
```

보고에 포함: 링크 검사 결과 줄, 빌드 결과, 삭제 파일 수, 2단계 계획 작성 제안.
