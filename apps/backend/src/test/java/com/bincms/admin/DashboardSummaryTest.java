package com.bincms.admin;

import com.bincms.support.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 관리자 대시보드 요약: 회원·게시글·인테리어·대기 문의 수. 관리자만.
 * 기대값 정본: docs/30-dev/guides/features/70-admin.md
 */
class DashboardSummaryTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("요약 숫자가 실제 데이터를 따라 늘어난다")
    void summaryReflectsData() throws Exception {
        String admin = adminBearer();
        JsonNode before = summary(admin);

        mockMvc.perform(post("/api/v1/public/inquiries").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"dash\",\"phone\":\"010-1111-2222\",\"type\":\"office\",\"content\":\"c\"}"))
                .andExpect(status().is2xxSuccessful());
        mockMvc.perform(post("/api/v1/admin/interiors").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"category\":\"ONSITE\",\"title\":\"dash\",\"content\":\"<p>x</p>\"}"))
                .andExpect(status().is2xxSuccessful());

        JsonNode after = summary(admin);
        assertThat(after.path("pendingInquiries").asLong()).isEqualTo(before.path("pendingInquiries").asLong() + 1);
        assertThat(after.path("interiors").asLong()).isEqualTo(before.path("interiors").asLong() + 1);
        assertThat(after.path("members").asLong()).isGreaterThanOrEqualTo(1);   // admin 계정
        assertThat(after.has("posts")).isTrue();
    }

    @Test
    @DisplayName("비로그인은 401")
    void requiresAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/summary")).andExpect(status().isUnauthorized());
    }

    private JsonNode summary(String admin) throws Exception {
        return objectMapper.readTree(mockMvc.perform(get("/api/v1/admin/dashboard/summary").header("Authorization", admin))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).path("data");
    }
}
