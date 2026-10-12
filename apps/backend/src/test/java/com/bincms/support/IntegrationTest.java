package com.bincms.support;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 통합 테스트 메타 어노테이션: 전체 컨텍스트 + MockMvc + test 프로파일.
 * MySQL 컨테이너(JVM 당 1개, 수동 기동)는 {@link AbstractIntegrationTest}에 있다.
 * 스키마·역할·권한·메뉴는 Flyway(V1·V2)가, admin 계정은 AdminAccountInitializer 가 만든다.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public @interface IntegrationTest {
}
