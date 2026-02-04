# 🏛️ eGovFrame + Spring Boot Skill

> 전자정부 표준프레임워크 4.x + Spring Boot 3.x 프로젝트 설정 가이드

---

## Overview

전자정부 표준프레임워크 4.x는 **Spring Boot 기반**으로 전환되었습니다.
이 스킬은 CMS 프로젝트에 필요한 설정과 패턴을 제공합니다.

---

## 1. Project Initialization (프로젝트 초기화)

### 최소 요구 사항

| 항목 | 버전 |
|:---|:---|
| Java | 17+ |
| Spring Boot | 3.2.x |
| eGovFrame | 4.2.0 |
| Gradle | 8.x |

### Gradle 의존성

```groovy
// build.gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.0'
    id 'io.spring.dependency-management' version '1.1.4'
}

ext {
    egovVersion = '4.2.0'
}

dependencies {
    // eGovFrame Core
    implementation "org.egovframe.rte:org.egovframe.rte.ptl.mvc:${egovVersion}"
    implementation "org.egovframe.rte:org.egovframe.rte.psl.dataaccess:${egovVersion}"
    implementation "org.egovframe.rte:org.egovframe.rte.fdl.cmmn:${egovVersion}"
    implementation "org.egovframe.rte:org.egovframe.rte.fdl.idgnr:${egovVersion}"
    implementation "org.egovframe.rte:org.egovframe.rte.fdl.property:${egovVersion}"
    
    // Spring Boot Starters
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
}

repositories {
    mavenCentral()
    maven { url 'https://maven.egovframe.go.kr/maven/' }
}
```

---

## 2. Application Configuration (애플리케이션 설정)

### application.yml

```yaml
spring:
  application:
    name: cms
  
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}
  
  # JPA 설정
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
        default_batch_fetch_size: 100
    open-in-view: false
  
  # Thymeleaf 설정
  thymeleaf:
    prefix: classpath:/templates/
    suffix: .html
    cache: false  # 개발 시 false
  
  # 파일 업로드
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 50MB

server:
  port: 8080
  servlet:
    context-path: /
    session:
      timeout: 30m
  tomcat:
    uri-encoding: UTF-8

# eGovFrame 설정
egovframework:
  property:
    globals:
      pageUnit: 10
      pageSize: 10
      uploadPath: ${UPLOAD_PATH:D:/upload}
      maxUploadSize: 10485760
```

### 환경별 설정

```yaml
# application-local.yml (로컬 개발)
spring:
  datasource:
    url: jdbc:h2:mem:cms;MODE=MySQL
    driver-class-name: org.h2.Driver
  h2:
    console:
      enabled: true
  jpa:
    hibernate:
      ddl-auto: create-drop

---
# application-dev.yml (개발 서버)
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:3306/cms
    username: ${DB_USER:cms}
    password: ${DB_PASS:cms1234}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10

---
# application-prod.yml (운영 서버)
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:3306/cms
    username: ${DB_USER}
    password: ${DB_PASS}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
  jpa:
    show-sql: false
  thymeleaf:
    cache: true

logging:
  level:
    root: INFO
```

---

## 3. Security Configuration (보안 설정)

### SecurityConfig.java

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final UserDetailsService userDetailsService;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**")
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/css/**", "/js/**", "/images/**", 
                    "/webjars/**", "/favicon.ico"
                ).permitAll()
                .requestMatchers("/", "/login", "/error/**").permitAll()
                .requestMatchers("/admin/**").hasAnyRole("SUPER_ADMIN", "SITE_ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .usernameParameter("loginId")
                .passwordParameter("password")
                .defaultSuccessUrl("/")
                .failureUrl("/login?error=true")
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            )
            .sessionManagement(session -> session
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            );
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

## 4. Database Configuration (데이터베이스 설정)

### JpaConfig.java

```java
@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "egovframework.cms.domain")
public class JpaConfig {
    
    @Bean
    public AuditorAware<Long> auditorProvider() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return Optional.empty();
            }
            CmsUserDetails user = (CmsUserDetails) auth.getPrincipal();
            return Optional.of(user.getMemberId());
        };
    }
}
```

### BaseEntity.java (공통 엔티티)

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
public abstract class BaseEntity {
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(updatable = false)
    private Long createdBy;
    
    @LastModifiedBy
    private Long updatedBy;
}
```

---

## 5. eGovFrame Core Components (핵심 컴포넌트)

### EgovPropertyService 설정

```java
@Configuration
public class EgovPropertyConfig {
    
    @Bean
    public EgovPropertyServiceImpl propertiesService(
            @Value("${egovframework.property.globals.pageUnit:10}") int pageUnit,
            @Value("${egovframework.property.globals.pageSize:10}") int pageSize,
            @Value("${egovframework.property.globals.uploadPath}") String uploadPath,
            @Value("${egovframework.property.globals.maxUploadSize:10485760}") long maxUploadSize) {
        
        EgovPropertyServiceImpl propertyService = new EgovPropertyServiceImpl();
        propertyService.setProperties(Map.of(
            "pageUnit", pageUnit,
            "pageSize", pageSize,
            "uploadPath", uploadPath,
            "maxUploadSize", maxUploadSize
        ));
        return propertyService;
    }
}
```

### MessageSource 설정

```java
@Configuration
public class MessageConfig {
    
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource source = new ReloadableResourceBundleMessageSource();
        source.setBasenames(
            "classpath:messages/message-common",
            "classpath:messages/message-error"
        );
        source.setDefaultEncoding("UTF-8");
        source.setCacheSeconds(60);
        source.setFallbackToSystemLocale(false);
        source.setDefaultLocale(Locale.KOREAN);
        return source;
    }
    
    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver resolver = new SessionLocaleResolver();
        resolver.setDefaultLocale(Locale.KOREAN);
        return resolver;
    }
}
```

---

## 6. Standard Patterns (표준 패턴)

### Service 패턴

```java
@Service("memberService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class MemberServiceImpl implements MemberService {
    
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    @Transactional
    public MemberResponse createMember(MemberCreateRequest request) {
        // 1. 유효성 검증
        if (memberRepository.existsByLoginId(request.getLoginId())) {
            throw new EgovBizException("error.member.duplicate");
        }
        
        // 2. 엔티티 생성
        Member member = Member.builder()
            .loginId(request.getLoginId())
            .password(passwordEncoder.encode(request.getPassword()))
            .memberName(request.getMemberName())
            .email(request.getEmail())
            .status(MemberStatus.ACTIVE)
            .build();
        
        // 3. 저장
        Member saved = memberRepository.save(member);
        
        log.info("회원 등록: memberId={}", saved.getMemberId());
        
        return MemberResponse.from(saved);
    }
}
```

### Controller 패턴

```java
@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
@Tag(name = "Member", description = "회원 API")
public class MemberController {
    
    private final MemberService memberService;
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MemberResponse> create(@Valid @RequestBody MemberCreateRequest request) {
        return ApiResponse.success(memberService.createMember(request));
    }
    
    @GetMapping("/{memberId}")
    public ApiResponse<MemberResponse> get(@PathVariable Long memberId) {
        return ApiResponse.success(memberService.getMember(memberId));
    }
    
    @GetMapping
    public ApiResponse<PageResponse<MemberResponse>> list(
            @ModelAttribute MemberSearchRequest request,
            @PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.success(PageResponse.from(memberService.getMembers(request, pageable)));
    }
}
```

### 표준 응답 형식

```java
@Getter
@Builder
public class ApiResponse<T> {
    
    private boolean success;
    private T data;
    private String message;
    private ErrorDetail error;
    private Meta meta;
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .meta(Meta.now())
            .build();
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .message(message)
            .meta(Meta.now())
            .build();
    }
    
    public static ApiResponse<Void> error(String code, String message) {
        return ApiResponse.<Void>builder()
            .success(false)
            .error(new ErrorDetail(code, message))
            .meta(Meta.now())
            .build();
    }
    
    @Getter
    @AllArgsConstructor
    public static class ErrorDetail {
        private String code;
        private String message;
    }
    
    @Getter
    public static class Meta {
        private String timestamp;
        
        public static Meta now() {
            Meta meta = new Meta();
            meta.timestamp = LocalDateTime.now().toString();
            return meta;
        }
    }
}
```

---

## 7. Exception Handling (예외 처리)

### GlobalExceptionHandler.java

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @Autowired
    private MessageSource messageSource;
    
    @ExceptionHandler(EgovBizException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleBizException(EgovBizException e) {
        log.warn("Business Exception: {}", e.getMessage());
        String message = getMessage(e.getMessage());
        return ApiResponse.error("BIZ_ERROR", message);
    }
    
    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Void> handleNotFound(EntityNotFoundException e) {
        log.warn("Not Found: {}", e.getMessage());
        return ApiResponse.error("NOT_FOUND", e.getMessage());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                fe -> getMessage(fe.getDefaultMessage()),
                (a, b) -> a
            ));
        return ApiResponse.<Map<String, String>>builder()
            .success(false)
            .error(new ApiResponse.ErrorDetail("VALIDATION_ERROR", "입력값이 올바르지 않습니다."))
            .data(errors)
            .meta(ApiResponse.Meta.now())
            .build();
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleAccessDenied(AccessDeniedException e) {
        log.warn("Access Denied: {}", e.getMessage());
        return ApiResponse.error("ACCESS_DENIED", getMessage("error.auth.accessDenied"));
    }
    
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleException(Exception e) {
        log.error("Unexpected Error", e);
        return ApiResponse.error("INTERNAL_ERROR", getMessage("error.common.internal"));
    }
    
    private String getMessage(String code) {
        try {
            return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            return code;
        }
    }
}
```

---

## 8. File Upload Configuration (파일 업로드 설정)

### FileService.java

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {
    
    private final FileRepository fileRepository;
    
    @Value("${egovframework.property.globals.uploadPath}")
    private String uploadPath;
    
    @Value("${egovframework.property.globals.maxUploadSize}")
    private long maxUploadSize;
    
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        "jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "hwp", "zip"
    );
    
    @Transactional
    public FileInfo uploadFile(MultipartFile file, String groupId) {
        // 1. 파일 검증
        validateFile(file);
        
        // 2. 저장 경로 생성
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String storedName = UUID.randomUUID() + "." + getExtension(file.getOriginalFilename());
        Path targetPath = Paths.get(uploadPath, datePath, storedName);
        
        try {
            // 3. 디렉토리 생성 및 파일 저장
            Files.createDirectories(targetPath.getParent());
            Files.copy(file.getInputStream(), targetPath);
            
            // 4. DB 저장
            FileInfo fileInfo = FileInfo.builder()
                .fileGroupId(groupId)
                .originalName(file.getOriginalFilename())
                .storedName(storedName)
                .filePath(datePath + "/" + storedName)
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .fileExt(getExtension(file.getOriginalFilename()))
                .build();
            
            return fileRepository.save(fileInfo);
            
        } catch (IOException e) {
            log.error("파일 업로드 실패: {}", file.getOriginalFilename(), e);
            throw new EgovBizException("error.file.upload");
        }
    }
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new EgovBizException("error.file.empty");
        }
        if (file.getSize() > maxUploadSize) {
            throw new EgovBizException("error.file.size");
        }
        String ext = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new EgovBizException("error.file.extension");
        }
    }
    
    private String getExtension(String filename) {
        int idx = filename.lastIndexOf(".");
        return idx > 0 ? filename.substring(idx + 1) : "";
    }
}
```

---

## 9. Coding Standards Checklist (코딩 표준 체크리스트)

### 네이밍 규칙

| 대상 | 규칙 | 예시 |
|:---|:---|:---|
| 클래스 | PascalCase | `MemberService`, `BoardController` |
| 메서드 | camelCase | `findMemberById`, `createPost` |
| 상수 | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| 변수 | camelCase | `memberList`, `pageSize` |
| 패키지 | lowercase | `egovframework.cms.domain` |
| 테이블 | snake_case | `cms_member`, `cms_board` |
| 컬럼 | snake_case | `member_id`, `created_at` |

### 코드 체크리스트

```markdown
□ @Service에 이름 지정 ("memberService")
□ @Transactional(readOnly = true) 기본 적용
□ 변경 메서드에 @Transactional 명시
□ @Slf4j로 로깅 (log.info, log.error)
□ @Valid로 요청 유효성 검증
□ MessageSource로 메시지 처리
□ EgovBizException으로 비즈니스 예외 처리
□ @PreAuthorize로 권한 검사
```

---

## 10. Quick Start Commands (빠른 시작 명령어)

```bash
# 프로젝트 생성 (Spring Initializr + eGov 의존성 추가)
# https://start.spring.io 에서 기본 프로젝트 생성 후 eGov 의존성 추가

# 로컬 실행
./gradlew bootRun --args='--spring.profiles.active=local'

# 테스트
./gradlew test

# 빌드
./gradlew bootJar

# Docker 빌드
docker build -t cms-app:latest .

# Docker 실행
docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=dev cms-app:latest
```

---

## References

- [전자정부 표준프레임워크 4.x 가이드](https://www.egovframe.go.kr/wiki/doku.php)
- [Spring Boot 3.x Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Security 6.x Reference](https://docs.spring.io/spring-security/reference/)
