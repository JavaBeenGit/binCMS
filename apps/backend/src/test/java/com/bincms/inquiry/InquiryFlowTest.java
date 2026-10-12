package com.bincms.inquiry;

import com.bincms.support.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 견적문의 흐름: 비로그인 접수 → 관리자 목록(PENDING) → 상태 변경·메모.
 * 기대값 정본: docs/30-dev/guides/features/50-견적문의.md
 */
class InquiryFlowTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("비로그인 접수가 관리자 목록에 PENDING 으로 보이고, 상태·메모를 바꿀 수 있다")
    void submitThenManage() throws Exception {
        String marker = "flow-" + System.nanoTime();
        String created = mockMvc.perform(post("/api/v1/public/inquiries").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"tester\",\"phone\":\"010-1234-5678\",\"email\":\"t@example.com\","
                                + "\"type\":\"apartment\",\"budget\":\"1000-3000\",\"address\":\"somewhere\","
                                + "\"content\":\"" + marker + "\"}"))
                .andExpect(status().is2xxSuccessful())
                .andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(created).path("data").path("id").asLong();
        assertThat(id).isPositive();

        // 비로그인으로는 관리자 목록 불가
        mockMvc.perform(get("/api/v1/admin/inquiries")).andExpect(status().isUnauthorized());

        String admin = adminBearer();
        JsonNode detail = objectMapper.readTree(mockMvc.perform(get("/api/v1/admin/inquiries/" + id)
                        .header("Authorization", admin))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).path("data");
        assertThat(detail.path("status").asText()).isEqualTo("PENDING");
        assertThat(detail.path("content").asText()).isEqualTo(marker);
        assertThat(detail.path("inquiryType").asText()).isEqualTo("apartment");

        mockMvc.perform(patch("/api/v1/admin/inquiries/" + id + "/status").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/v1/admin/inquiries/" + id + "/memo").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"memo\":\"called\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/inquiries/" + id).header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.adminMemo").value("called"));
    }

    @Test
    @DisplayName("필수값(이름·연락처·내용)이 빠지면 400")
    void validation() throws Exception {
        mockMvc.perform(post("/api/v1/public/inquiries").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"phone\":\"\",\"content\":\"\"}"))
                .andExpect(status().isBadRequest());
    }
}
