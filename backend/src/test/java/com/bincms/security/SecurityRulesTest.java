package com.bincms.security;

import com.bincms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
}
