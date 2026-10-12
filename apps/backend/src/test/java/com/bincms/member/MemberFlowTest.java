package com.bincms.member;

import com.bincms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 회원 흐름: 가입 → 로그인 → 잘못된 비밀번호 → 탈퇴 → 탈퇴 후 로그인 불가.
 * 기대값 정본: docs/30-dev/guides/features/20-로그인-인증.md, 60-마이페이지.md
 */
class MemberFlowTest extends AbstractIntegrationTest {

    private static final String PASSWORD = "Passw0rd!";

    @Test
    @DisplayName("가입 → 로그인 성공, 틀린 비밀번호는 실패, 중복 가입은 거부")
    void signupAndLogin() throws Exception {
        String loginId = "flow_" + (System.nanoTime() % 1_000_000);
        signup(loginId).andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.data.roleCode").value("USER"))
                .andExpect(jsonPath("$.data.active").value(true));

        login(loginId, PASSWORD).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.member.loginId").value(loginId));

        login(loginId, "Wrong1234!").andExpect(status().is4xxClientError())
                .andExpect(jsonPath("$.success").value(false));

        signup(loginId).andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("탈퇴(비밀번호 확인) 후에는 로그인할 수 없다")
    void withdrawThenLoginFails() throws Exception {
        String loginId = "wd_" + (System.nanoTime() % 1_000_000);
        signup(loginId).andExpect(status().is2xxSuccessful());
        String bearer = bearerFor(loginId, PASSWORD);

        // 틀린 비밀번호로는 탈퇴 불가
        mockMvc.perform(post("/api/v1/auth/withdraw").header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"Nope1234!\",\"reason\":\"test\"}"))
                .andExpect(status().is4xxClientError());

        mockMvc.perform(post("/api/v1/auth/withdraw").header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"" + PASSWORD + "\",\"reason\":\"test\"}"))
                .andExpect(status().isOk());

        login(loginId, PASSWORD).andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("비로그인으로 탈퇴 API 호출은 401")
    void withdrawWithoutToken401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/withdraw").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"x\"}"))
                .andExpect(status().isUnauthorized());
    }

    private org.springframework.test.web.servlet.ResultActions signup(String loginId) throws Exception {
        return mockMvc.perform(post("/api/v1/auth/signup").contentType(MediaType.APPLICATION_JSON)
                .content("{\"loginId\":\"" + loginId + "\",\"password\":\"" + PASSWORD + "\",\"name\":\"tester\"}"));
    }

    private org.springframework.test.web.servlet.ResultActions login(String loginId, String password) throws Exception {
        return mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"loginId\":\"" + loginId + "\",\"password\":\"" + password + "\"}"));
    }
}
