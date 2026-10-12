# 로컬 개발 환경 세팅

> 마지막 검증: 2026-10-12 (Windows 10, Node 24, JAVA_HOME=17, Docker Desktop + MySQL 8.4 compose)

깨끗한 클론에서 이 문서대로 따라 하면 30분 안에 백엔드(8080)·프론트(3000)가 뜬다.

## 1. 필수 도구

| 도구 | 버전 | 비고 |
|---|---|---|
| Git | 아무 버전 | |
| Node.js | 20 이상 (검증: 24) | `node -v` |
| JDK | **설치 불필요** | Gradle toolchain이 JDK 21을 자동 다운로드. `JAVA_HOME`이 17이어도 됨 |
| MySQL 8 | Docker **또는** 네이티브 | 아래 §2 |

## 2. DB 준비 — 둘 중 하나

### 2-A. Docker Desktop을 쓰는 경우 (3307, 권장)

```bash
docker compose -f backend/docker-compose.yml up -d --wait
```

MySQL 8.4가 호스트 3307에 뜨고 DB `bincms`·계정 `bincms/bincms1234`가 자동 생성된다. 백엔드 기동 시 `DB_PORT=3307`을 준다(§3).

### 2-B. 네이티브 MySQL/MariaDB가 이미 있는 경우 (3306)

root로 한 번 실행(`backend/db/init-local.sql`):

```sql
CREATE DATABASE IF NOT EXISTS bincms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'bincms'@'localhost' IDENTIFIED BY 'bincms1234';
GRANT ALL PRIVILEGES ON bincms.* TO 'bincms'@'localhost';
FLUSH PRIVILEGES;
```

백엔드는 기본값으로 `localhost:3306`에 붙는다. 검증 PC의 3306은 **MariaDB 10.6**(Windows 서비스 `MariaDB`)이며 root 비밀번호를 몰라 이 경로는 실측하지 못했다 — MySQL 드라이버·다이얼렉트로 MariaDB 10.6에 붙는 것은 일반적으로 동작하지만, 문제가 생기면 2-A를 쓴다.

## 3. 백엔드 (8080)

```bash
cd backend
DB_PORT=3307 ./gradlew.bat bootRun     # Docker (Git Bash)
./gradlew.bat bootRun                  # 네이티브 3306
```

PowerShell에서 Docker 경로: `$env:DB_PORT=3307; .\gradlew.bat bootRun`

- 첫 실행은 JDK 21 + Gradle 8.7 + 의존성 다운로드로 수 분(검증 PC: 약 3분).
- `local` 프로파일이 기본. `ddl-auto: update`라 테이블이 자동 생성되고, `DataInitializer`가 역할·권한·메뉴·관리자 계정·샘플 데이터를 심는다.
- 비밀값: `backend/application-secret.yml`(git 제외)이 있으면 `spring.config.import`로 읽는다. 없어도 기동은 되지만 소셜 로그인·메일이 비활성(§5).
- 준비 판정: `curl http://localhost:8080/api/v1/health` → `{"success":true,...}` (검증 PC: 기동 후 약 10초).
- 로컬 관리자 계정: `admin` / `1234` (DataInitializer가 생성). 확인: `curl -X POST localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d '{"loginId":"admin","password":"1234"}'` → `accessToken` 포함 응답.

## 4. 프론트엔드 (3000)

```bash
cd frontend
npm install
npm run dev
```

- `http://localhost:3000` → 사용자 홈(`/user`)으로 리다이렉트. 관리자는 `/admin/login`.
- `/api`·`/uploads`는 Vite 프록시로 8080에 전달된다(`vite.config.ts`). 코드에서 절대 주소를 쓰지 않는다.
- 빌드 확인: `npm run build` (tsc + vite). 2026-10-12 기준 통과.

## 5. 알려진 문제 (2026-10-12 기준)

- `npm run lint`는 ESLint 설정 파일이 없어 실패한다(`ESLint couldn't find a configuration file`). 5단계에서 도입.
- OAuth(카카오·네이버·구글)·Gmail 비밀값은 `application.yml`에 없다. `backend/application-secret.example.yml`을 복사해 `backend/application-secret.yml`(git 제외)을 만들고 값을 채워야 소셜 로그인·메일 인증이 동작한다. 값은 저장소 소유자에게 받는다. 키 재발급은 3단계.
- 업로드 경로는 `FILE_UPLOAD_DIR` 환경변수, 기본값 `backend/uploads`(git 제외)다. 헤더·푸터 로고는 `/uploads/etc/su_design_logo.png`·`su_design_logo_footer.png`를 읽는데 이 파일이 저장소에 없어 새 PC에서는 로고가 깨져 보인다(6단계에서 로고를 `frontend/public/`으로 이전).
- 테스트가 없다. `gradlew build`는 테스트 0개로 통과한다.
- 보안(3단계 대상, 2026-10-12 실측): `/api/v1/admin/**`가 비로그인으로 200을 반환한다. 비로그인 `POST /api/v1/user/posts/free`는 401이 아니라 **500**을 반환한다(인증 주체가 없을 때 NPE로 추정).
- `ckeditor5`는 `47.4.0`에 고정돼 있다. `^` 범위로 올리면 47.7.x(LTS)에서 GPL 키가 거부돼(`license-key-lts-not-allowed`) 에디터가 비활성이 된다. `package-lock.json`을 커밋하므로 `npm ci`를 쓰면 안전하다.
- 빌드 시 "Some chunks are larger than 500 kB" 경고가 난다(antd·CKEditor). 6단계 번들 분리에서 다룬다.

## 6. 종료

각 터미널에서 Ctrl+C. Docker DB는 `docker compose -f backend/docker-compose.yml down` (데이터는 볼륨 `mysql-data`에 남는다).
