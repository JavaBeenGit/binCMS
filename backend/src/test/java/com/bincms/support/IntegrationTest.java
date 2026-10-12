package com.bincms.support;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 통합 테스트 메타 어노테이션: 전체 컨텍스트 + MockMvc + test 프로파일 + Testcontainers.
 * MySQL 컨테이너는 {@link AbstractIntegrationTest}에 있다.
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
