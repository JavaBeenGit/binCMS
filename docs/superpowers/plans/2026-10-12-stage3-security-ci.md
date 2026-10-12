# 3단계 보안 + CI — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 서버가 권한을 강제하게 만든다(비로그인 관리자 API 401, 회원 API 401, 역할 없는 토큰 403). 관리자 API 경로를 `/api/v1/admin/**`로 통일하고, PR마다 빌드·테스트·문서 링크 검사를 돌리는 CI를 둔다.

**Architecture:** `SecurityConfig`를 접두어 기반 4규칙(`admin`·`user`·`public`·`auth`)으로 다시 쓰고, 인증 실패·권한 거부를 `ApiResponse` JSON(401/403)으로 돌려주는 핸들러를 추가한다. 미접두 컨트롤러 7개의 `@RequestMapping`을 바꾸고 프론트 엔드포인트 파일 7개를 따라 고친다. 보안 규칙은 **Testcontainers(MySQL) + MockMvc 통합 테스트**로 고정한다(첫 백엔드 테스트). CI는 GitHub Actions 하나.

**Tech Stack:** Spring Security 6 / JUnit 5 + MockMvc + Testcontainers 1.20 (Docker 필요) / GitHub Actions / Vite.

**Spec:** [`docs/superpowers/specs/2026-10-12-project-restructure-design.md`](../specs/2026-10-12-project-restructure-design.md) §4 3단계, §8-1 개정 1행, ADR-0003.

## Global Constraints

- 브랜치 `feat/보안-ci`(docs/지침-뼈대-v2에서 분기). `main` 직접 커밋 금지. 커밋 `[개발] type: 설명` + Co-Authored-By 트레일러. push는 각 Task 끝에 해도 된다(사용자 허용).
- 접두어는 `admin`·`user`·`public`·`auth` 4종만. 예외: `/uploads/**`, `/api/v1/health`.
- 역할 모델: 관리자 축 `SYSTEM_ADMIN`·`OPERATION_ADMIN`·`GENERAL_ADMIN`, 회원 축 `USER`(ADR-0003). 합치지 않는다.
- 비밀값은 `application-secret.yml`/환경변수. 키 재발급은 사용자 몫 — 코드에서 평문 키를 새로 쓰지 않는다.
- 테스트는 공유 DB에 붙지 않는다(Testcontainers 일회용 컨테이너). `DataInitializer`가 테스트 DB에도 시드를 넣으므로 `admin/1234`로 로그인해 토큰을 얻는다.
- 동작 변경(권한 강제·경로 변경)과 문서 변경은 커밋을 분리한다.

## Review Focus

- 비로그인으로 `/api/v1/user/posts/free` POST → 지금은 500. 끝나면 **401 JSON**이어야 한다. → Task 2 테스트.
- `USER` 토큰으로 `/api/v1/admin/**` → **403 JSON**. → Task 3 테스트.
- 사용자 화면이 쓰는 공개 API(`/public/contents/...`, `/public/posts/...`, `/public/popups/active`, `/public/oauth/*/config`, `/uploads/**`)는 비로그인 200 유지. → Task 2·3 테스트 + Task 4 브라우저 확인.
- 자유게시판 CKEditor 이미지 업로드(회원 토큰)가 경로 변경 뒤에도 되는지. → Task 4에서 `ckEditorUploadAdapter.ts` 수정 + curl.
- 만료·위조 토큰은 익명 취급(401), 500 아님. → Task 2 테스트.

---

### Task 1: 테스트 인프라 — Testcontainers + 첫 실패 테스트

**Files:**
- Modify: `backend/build.gradle` (test deps)
- Create: `backend/src/test/java/com/bincms/support/IntegrationTest.java`
- Create: `backend/src/test/resources/application-test.yml`
- Create: `backend/src/test/java/com/bincms/security/SecurityRulesTest.java`

**Interfaces:**
- Produces: `@IntegrationTest` 메타 어노테이션(SpringBootTest + MockMvc + MySQL 컨테이너 `@ServiceConnection`). Task 2·3 테스트가 상속.

- [ ] **Step 1: 의존성 추가**

`backend/build.gradle`의 `// Test` 블록을 다음으로 교체:

```groovy
    // Test
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'org.springframework.boot:spring-boot-testcontainers'
    testImplementation 'org.testcontainers:junit-jupiter'
    testImplementation 'org.testcontainers:mysql'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
```

- [ ] **Step 2: 테스트 프로파일과 베이스 어노테이션**

`backend/src/test/resources/application-test.yml`:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false
  mail:
    host: localhost
    port: 2525
jwt:
  secret: test-secret-key-for-integration-tests-only-32bytes-min
  expiration: 3600000
file:
  upload-dir: ./build/test-uploads
  base-url: /uploads
cors:
  allowed-origins:
    - http://localhost:3000
app:
  mail:
    from: test@example.com
    from-name: test
    verification-code-expiry: 300
logging:
  level:
    root: WARN
    com.bincms: INFO
```

`backend/src/test/java/com/bincms/support/IntegrationTest.java`:

```java
package com.bincms.support;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.lang.annotation.*;

/**
 * 통합 테스트 베이스: MySQL 8 일회용 컨테이너 + 전체 컨텍스트 + MockMvc.
 * DataInitializer가 역할·권한·admin(1234) 계정을 시드하므로 테스트는 그 계정으로 로그인한다.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
public @interface IntegrationTest {
}
```

주의: 메타 어노테이션에는 `@Container` 필드를 둘 수 없다. 컨테이너는 아래 추상 클래스에 둔다.

`backend/src/test/java/com/bincms/support/AbstractIntegrationTest.java`:

```java
package com.bincms.support;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@IntegrationTest
public abstract class AbstractIntegrationTest {

    @Container
    @ServiceConnection
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4")
            .withDatabaseName("bincms_test");

    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;

    /** admin/1234 로 로그인해 Bearer 헤더 값을 돌려준다. */
    protected String adminBearer() throws Exception {
        return bearerFor("admin", "1234");
    }

    protected String bearerFor(String loginId, String password) throws Exception {
        String body = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"loginId\":\"" + loginId + "\",\"password\":\"" + password + "\"}"))
                .andReturn().getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(body);
        return "Bearer " + node.path("data").path("accessToken").asText();
    }
}
```

- [ ] **Step 3: 첫 실패 테스트 — 비로그인 관리자 API는 401**

`backend/src/test/java/com/bincms/security/SecurityRulesTest.java`:

```java
package com.bincms.security;

import com.bincms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SecurityRulesTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("비로그인으로 관리자 API를 호출하면 401 JSON")
    void adminApi_withoutToken_401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/interiors").param("page", "0").param("size", "1"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("C004"));
    }
}
```

- [ ] **Step 4: RED 확인**

```bash
cd /c/dev/workspace/binCms/backend && ./gradlew.bat test --tests 'com.bincms.security.SecurityRulesTest' --no-daemon -q 2>&1 | tail -15; echo "exit=$?"
```

Expected: 테스트 실패 — `Status expected:<401> but was:<200>`. (Docker Desktop이 떠 있어야 한다. 컨텍스트 로딩 실패가 나오면 `application-test.yml`의 누락 키를 보고 채운다 — `app.oauth.*`는 `${KAKAO_CLIENT_ID:}` 기본값이라 비어도 된다.)

- [ ] **Step 5: 커밋**

```bash
cd /c/dev/workspace/binCms && git add backend/build.gradle backend/src/test && git commit -q -F - <<'EOF'
[개발] test: Testcontainers(MySQL) 통합 테스트 기반과 보안 규칙 첫 테스트 추가

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 2: SecurityConfig 재작성 + 401/403 JSON 핸들러

**Files:**
- Modify: `backend/src/main/java/com/bincms/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/bincms/common/security/ApiAuthenticationEntryPoint.java`
- Create: `backend/src/main/java/com/bincms/common/security/ApiAccessDeniedHandler.java`
- Modify: `backend/src/test/java/com/bincms/security/SecurityRulesTest.java` (테스트 추가)

**Interfaces:**
- Produces: 접두어 규칙. `/api/v1/admin/**` → `hasAnyRole("SYSTEM_ADMIN","OPERATION_ADMIN","GENERAL_ADMIN")`, `/api/v1/user/**` → `authenticated()`, `/api/v1/auth/withdraw` → `authenticated()`, 나머지 `auth/**`·`public/**`·`/uploads/**`·`/api/v1/health` → `permitAll`, 그 외 `authenticated()`. **Task 3 전까지는** 미접두 경로(`/api/v1/{boards,posts,comments,menus,files,inquiries}/**`)를 임시로 관리자 규칙에, `/api/v1/contents/**`를 permitAll에 둔다(Task 3에서 삭제).

- [ ] **Step 1: 테스트 추가 (RED)**

`SecurityRulesTest`에 추가:

```java
    @Test
    @DisplayName("비로그인으로 회원 글쓰기 API를 호출하면 500이 아니라 401")
    void userApi_withoutToken_401() throws Exception {
        mockMvc.perform(post("/api/v1/user/posts/free")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"x\",\"content\":\"y\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("C004"));
    }

    @Test
    @DisplayName("위조 토큰은 익명으로 취급되어 401")
    void adminApi_withGarbageToken_401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/interiors").header("Authorization", "Bearer not.a.jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("관리자 토큰으로 관리자 API 200")
    void adminApi_withAdminToken_200() throws Exception {
        mockMvc.perform(get("/api/v1/admin/interiors").param("page", "0").param("size", "1")
                        .header("Authorization", adminBearer()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("공개 API는 비로그인 200")
    void publicApi_withoutToken_200() throws Exception {
        mockMvc.perform(get("/api/v1/public/popups/active")).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/public/posts/board/notice").param("page", "0").param("size", "1"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/health")).andExpect(status().isOk());
    }
```

import 추가: `org.springframework.http.MediaType`, `MockMvcRequestBuilders.post`.

Run: 위 Task 1 Step 4 명령. Expected: 401 기대 테스트들 실패(200/500), 나머지 통과.

- [ ] **Step 2: 핸들러 작성**

`ApiAuthenticationEntryPoint.java`:

```java
package com.bincms.common.security;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** 인증 없음/실패 → 401 + 표준 ApiResponse JSON (C004). */
@Component
@RequiredArgsConstructor
public class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        ErrorCode code = ErrorCode.UNAUTHORIZED;
        response.setStatus(code.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), ApiResponse.error(code.getCode(), code.getMessage()));
    }
}
```

`ApiAccessDeniedHandler.java`: 같은 구조로 `AccessDeniedHandler` 구현, `ErrorCode.FORBIDDEN`(C005).

`ErrorCode`의 getter 이름(`getStatus()`/`getCode()`/`getMessage()`)은 파일에서 확인해 맞춘다.

- [ ] **Step 3: SecurityConfig 재작성**

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String[] ADMIN_ROLES = {"SYSTEM_ADMIN", "OPERATION_ADMIN", "GENERAL_ADMIN"};

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ApiAuthenticationEntryPoint authenticationEntryPoint;
    private final ApiAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler))
            .authorizeHttpRequests(auth -> auth
                // 익명 허용
                .requestMatchers("/api/v1/public/**", "/uploads/**", "/api/v1/health").permitAll()
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/signup").permitAll()
                .requestMatchers("/api/v1/contents/**").permitAll()          // Task 3에서 /public 로 이동 후 삭제
                // 로그인 회원
                .requestMatchers("/api/v1/user/**", "/api/v1/auth/withdraw").authenticated()
                // 관리자
                .requestMatchers("/api/v1/admin/**").hasAnyRole(ADMIN_ROLES)
                .requestMatchers("/api/v1/boards/**", "/api/v1/posts/**", "/api/v1/comments/**",
                                 "/api/v1/menus/**", "/api/v1/files/**", "/api/v1/inquiries/**")
                    .hasAnyRole(ADMIN_ROLES)                                   // Task 3에서 삭제
                .anyRequest().authenticated()
            )
            .headers(h -> h.frameOptions(f -> f.sameOrigin()))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}
```

`JwtAuthenticationFilter`는 유효하지 않은 토큰이면 인증을 세팅하지 않으므로 위조 토큰은 익명 → EntryPoint가 401을 낸다. `validateToken`이 예외를 던지는지 확인하고, 던지면 `try/catch`로 감싸 false 처리한다.

- [ ] **Step 4: GREEN 확인**

Task 1 Step 4 명령. Expected: 5개 전부 PASS.

- [ ] **Step 5: 실기동 확인 (Docker DB 3307)**

```bash
cd /c/dev/workspace/binCms/backend && (DB_PORT=3307 ./gradlew.bat bootRun --no-daemon > /c/Users/been8/AppData/Local/Temp/bincms-backend.log 2>&1 &); sleep 70
curl -s -o /dev/null -w "admin-noauth=%{http_code}\n" "http://localhost:8080/api/v1/admin/interiors?page=0&size=1"
curl -s -w "\nuser-noauth=%{http_code}\n" -X POST http://localhost:8080/api/v1/user/posts/free -H 'Content-Type: application/json' -d '{"title":"x","content":"y"}'
curl -s -o /dev/null -w "public=%{http_code}\n" http://localhost:8080/api/v1/public/popups/active
```

Expected: `admin-noauth=401`, user-noauth 본문 `{"success":false,...,"error":"C004"}` + `401`, `public=200`.

- [ ] **Step 6: 커밋**

```bash
git add backend/src/main/java/com/bincms/config/SecurityConfig.java backend/src/main/java/com/bincms/common/security backend/src/test && git commit -q -F - <<'EOF'
[개발] feat: 서버 권한 강제 — 접두어 기반 보안 규칙과 401/403 JSON 응답

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 3: 관리자 API 경로 통일 (백엔드)

**Files:**
- Modify: 7개 컨트롤러의 `@RequestMapping`
  - `board/controller/BoardController.java`: `/api/v1/boards` → `/api/v1/admin/boards`
  - `post/controller/PostController.java`: `/api/v1/posts` → `/api/v1/admin/posts`
  - `comment/controller/CommentController.java`: `/api/v1/comments` → `/api/v1/admin/comments`
  - `menu/controller/MenuController.java`: `/api/v1/menus` → `/api/v1/admin/menus`
  - `inquiry/controller/InquiryController.java`: `/api/v1/inquiries` → `/api/v1/admin/inquiries`
  - `file/controller/FileController.java`: `/api/v1/files` → `/api/v1/user/files` (관리자·회원 모두 로그인 상태에서 업로드)
  - `content/controller/ContentController.java`: `/api/v1/contents` → `/api/v1/public/contents`
- Modify: `SecurityConfig.java` — Task 2의 "Task 3에서 삭제" 두 줄 제거
- Modify: `SecurityRulesTest.java` — 경로 테스트 추가
- Modify: `docs/10-product/sitemap.md`는 Task 6에서

**Interfaces:**
- Produces: 최종 경로 표(프론트 Task 4가 그대로 사용):

| 이전 | 이후 |
|---|---|
| `/api/v1/boards/**` | `/api/v1/admin/boards/**` |
| `/api/v1/posts/**` | `/api/v1/admin/posts/**` |
| `/api/v1/comments/**` | `/api/v1/admin/comments/**` |
| `/api/v1/menus/**` | `/api/v1/admin/menus/**` |
| `/api/v1/inquiries/**` | `/api/v1/admin/inquiries/**` |
| `/api/v1/files/**` | `/api/v1/user/files/**` |
| `/api/v1/contents/**` | `/api/v1/public/contents/**` |

- [ ] **Step 1: 테스트 추가 (RED)**

```java
    @Test
    @DisplayName("경로 통일: 옛 경로는 404, 새 경로는 권한 규칙 적용")
    void unifiedPaths() throws Exception {
        String admin = adminBearer();
        mockMvc.perform(get("/api/v1/admin/boards").header("Authorization", admin)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/admin/menus").header("Authorization", admin)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/public/contents").param("page", "0").param("size", "1")).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/boards")).andExpect(status().isUnauthorized()); // anyRequest().authenticated()
        mockMvc.perform(get("/api/v1/user/files/ref").param("refType", "X").param("refId", "1")
                .header("Authorization", admin)).andExpect(status().isOk());
    }

    @Test
    @DisplayName("USER 토큰으로 관리자 API는 403")
    void adminApi_withUserToken_403() throws Exception {
        mockMvc.perform(post("/api/v1/auth/signup").contentType(MediaType.APPLICATION_JSON)
                .content("{\"loginId\":\"user_t\",\"password\":\"Passw0rd!\",\"name\":\"회원\"}"))
                .andExpect(status().is2xxSuccessful());
        String user = bearerFor("user_t", "Passw0rd!");
        mockMvc.perform(get("/api/v1/admin/boards").header("Authorization", user))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("C005"));
        mockMvc.perform(get("/api/v1/user/files/ref").param("refType", "X").param("refId", "1")
                .header("Authorization", user)).andExpect(status().isOk());
    }
```

`signup`의 비밀번호 규칙(영문·숫자·특수문자 8자 이상)은 `SignupRequest`의 `@Pattern`을 보고 맞춘다. 회원 ID 중복으로 두 번째 실행이 실패하면 ID에 `System.nanoTime()`을 붙인다.

Run → Expected: `unifiedPaths` 실패(새 경로 404), `adminApi_withUserToken_403`은 통과할 수도 있다(기존 /admin 경로는 이미 규칙 적용).

- [ ] **Step 2: 컨트롤러 7개 매핑 변경 + SecurityConfig 임시 줄 삭제**

각 파일의 `@RequestMapping("...")` 한 줄만 표대로 바꾼다. `SecurityConfig`에서 `contents` permitAll 줄과 미접두 6경로 `hasAnyRole` 줄을 지운다.

- [ ] **Step 3: GREEN** — 전체 `./gradlew.bat test --no-daemon -q`. Expected: 7개 PASS.

- [ ] **Step 4: 커밋**

```bash
git add backend/src && git commit -q -F - <<'EOF'
[개발] refactor: 관리자 API 경로를 /api/v1/admin/** 로 통일, 콘텐츠 조회는 /public, 파일은 /user

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 4: 프론트엔드 경로 반영 + 실기동 확인

**Files:**
- Modify: `frontend/src/api/endpoints/{board,post,comment,menu,inquiry,file,content}.ts`
- Modify: `frontend/src/shared/utils/ckEditorUploadAdapter.ts` (`/files/upload` → `/user/files/upload`)
- Modify: `frontend/src/api/client.ts` — 403 처리 추가(관리자 페이지에서 403이면 `message.error('권한이 없습니다')`만, 로그아웃 아님)

- [ ] **Step 1: 경로 치환**

```bash
cd /c/dev/workspace/binCms/frontend/src && sed -i "s#'/boards#'/admin/boards#g; s#\`/boards#\`/admin/boards#g" api/endpoints/board.ts && sed -i "s#'/posts#'/admin/posts#g; s#\`/posts#\`/admin/posts#g" api/endpoints/post.ts && sed -i "s#\`/comments#\`/admin/comments#g" api/endpoints/comment.ts && sed -i "s#'/menus#'/admin/menus#g; s#\`/menus#\`/admin/menus#g" api/endpoints/menu.ts && sed -i "s#'/inquiries#'/admin/inquiries#g; s#\`/inquiries#\`/admin/inquiries#g" api/endpoints/inquiry.ts && sed -i "s#'/files#'/user/files#g; s#\`/files#\`/user/files#g" api/endpoints/file.ts && sed -i "s#\`/contents#\`/public/contents#g; s#'/contents#'/public/contents#g" api/endpoints/content.ts && sed -i "s#/files/upload#/user/files/upload#g" shared/utils/ckEditorUploadAdapter.ts
grep -rn "'/\(boards\|posts\|comments\|menus\|inquiries\|files\|contents\)\|\`/\(boards\|posts\|comments\|menus\|inquiries\|files\|contents\)" api/endpoints shared/utils; echo "leftover exit=$? (1 expected)"
```

주의: `post.ts`에 이미 `/public/posts`·`/user/posts`가 있으면 치환 패턴이 `'/posts`만 잡으므로 영향 없다. `content.ts`의 관리자 API는 이미 `/admin/contents`라 영향 없다. 치환 뒤 `git diff`로 눈으로 확인한다.

- [ ] **Step 2: 403 처리** — `client.ts` 응답 인터셉터에 `if (error.response?.status === 403) { message.error('권한이 없습니다'); }` 추가(antd `message` import).

- [ ] **Step 3: 빌드** — `npm run build` 통과.

- [ ] **Step 4: 실기동 (Playwright)** — 백엔드(Task 2 Step 5 방식)·프론트 기동 후: 관리자 로그인 → 게시글 관리 목록·메뉴 관리 목록·견적문의 목록·게시판 설정이 뜨는지, 사용자 `/user/page/:key` 404 아닌 "콘텐츠 없음" 처리, 자유게시판 이미지 업로드는 curl로 회원 토큰 `POST /api/v1/user/files/upload` 201/200.

- [ ] **Step 5: 커밋**

```bash
git add frontend/src && git commit -q -F - <<'EOF'
[개발] refactor: 프론트 API 호출 경로를 통일된 접두어로 변경, 403 안내 추가

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

### Task 5: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: 워크플로 작성**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '21' }
      - uses: gradle/actions/setup-gradle@v4
      - run: chmod +x backend/gradlew && backend/gradlew -p backend build --no-daemon
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: npm, cache-dependency-path: frontend/package-lock.json }
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: node scripts/check-doc-links.mjs .
```

백엔드 테스트는 Testcontainers라 ubuntu 러너의 Docker를 쓴다(별도 설정 불필요).

- [ ] **Step 2: 로컬에서 같은 명령 재현** — `backend/gradlew.bat build`(테스트 포함) 통과, `npm ci && npm run build` 통과, 링크 검사 OK.

- [ ] **Step 3: 커밋 + push** — `[운영] ci: PR마다 백엔드 빌드·테스트, 프론트 빌드, 문서 링크 검사`. push 후 GitHub Actions 결과를 `git ls-remote`로는 못 보므로 사용자에게 PR 페이지에서 확인을 요청한다.

### Task 6: 문서 동기화

**Files:**
- Modify: `docs/30-dev/adr/0003-auth-jwt.md` — Status `accepted (2026-10-12 개정 적용)`, Decision의 "3단계 목표" 표현을 현재형으로, 경로 표 반영
- Modify: `docs/10-product/sitemap.md` — `/admin/posts/free` 행에 "서버 권한은 ROLE_*로 강제됨" 주석; 권한 열 설명에 "프론트 가드 + 서버 역할 검사"
- Modify: `docs/30-dev/guides/dev-setup.md` — §5의 보안 줄 삭제(해결됨), 테스트 실행법 추가(`gradlew.bat test`, Docker 필요)
- Modify: `CLAUDE.md` §7 현재 단계, §6 회귀 기준에 `gradlew.bat test` 추가
- Modify: `docs/30-dev/README.md` — ADR-0003 행 설명 갱신

- [ ] 링크 검사 OK → 커밋 `[개발] docs: 보안 단계 완료를 ADR·사이트맵·가이드에 반영` → push.

### Task 7: 전체 검증

- `backend/gradlew.bat build` (테스트 포함) 0, `npm run build` 0, 링크 검사 0.
- 실기동: 비로그인 admin API 401, user API 401, public 200, 관리자 화면 전 메뉴 목록 로드, 공지 작성·견적문의 제출 재확인.
- 사용자에게 보고: 키 재발급 안내(카카오·네이버·구글·Gmail 앱 비밀번호), PR 확인.
