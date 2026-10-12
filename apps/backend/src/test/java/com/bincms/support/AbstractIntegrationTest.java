package com.bincms.support;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * 통합 테스트 베이스. MySQL 8 일회용 컨테이너(Docker 필요)에 붙는다. 공유 DB에는 절대 붙지 않는다.
 *
 * 컨테이너는 JVM 당 하나를 수동으로 띄워 모든 테스트 클래스가 공유한다. {@code @Container} 로 클래스마다 띄우면
 * Spring 이 캐시한 컨텍스트(커넥션 풀)가 이미 내려간 컨테이너 포트를 가리켜 다음 클래스가 실패한다.
 * 종료는 Testcontainers 의 Ryuk 이 JVM 종료 시 처리한다.
 */
@IntegrationTest
public abstract class AbstractIntegrationTest {

    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4")
            .withDatabaseName("bincms_test");

    static {
        MYSQL.start();
    }

    /** 컨테이너 접속 정보를 datasource 속성으로 주입한다. Flyway 가 이 DB 에 V1·V2 를 적용한다. */
    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driver-class-name", MYSQL::getDriverClassName);
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    /** admin/1234(AdminAccountInitializer, test 프로파일 비밀번호)로 로그인해 Authorization 헤더 값을 돌려준다. */
    protected String adminBearer() throws Exception {
        return bearerFor("admin", "1234");
    }

    protected String bearerFor(String loginId, String password) throws Exception {
        String body = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"loginId\":\"" + loginId + "\",\"password\":\"" + password + "\"}"))
                .andReturn().getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(body);
        String token = node.path("data").path("accessToken").asText();
        if (token.isEmpty()) {
            throw new IllegalStateException("로그인 실패: " + body);
        }
        return "Bearer " + token;
    }
}
