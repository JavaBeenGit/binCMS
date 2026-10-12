package com.bincms.security;

import com.bincms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * SecurityConfig 접두어 규칙(ADR-0003)을 고정하는 테스트.
 */
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
