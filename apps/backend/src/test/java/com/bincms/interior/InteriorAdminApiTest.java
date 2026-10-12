package com.bincms.interior;

import com.bincms.support.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 관리자 인테리어 API: 블로그 이관 도구가 재실행 시 카테고리 매핑을 바꿔 갱신할 수 있어야 한다.
 */
class InteriorAdminApiTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("수정 요청에 category 를 주면 카테고리가 바뀌고, 생략하면 유지된다")
    void updateCanChangeCategory() throws Exception {
        String admin = adminBearer();
        String created = mockMvc.perform(post("/api/v1/admin/interiors")
                        .header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"category\":\"ONSITE\",\"title\":\"카테고리 변경 테스트\",\"content\":\"<p>본문</p>\"}"))
                .andExpect(status().is2xxSuccessful())
                .andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(created).path("data").path("id").asLong();

        mockMvc.perform(put("/api/v1/admin/interiors/" + id)
                        .header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"category\":\"STORY\",\"title\":\"카테고리 변경 테스트\",\"content\":\"<p>본문</p>\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.category").value("STORY"));

        mockMvc.perform(put("/api/v1/admin/interiors/" + id)
                        .header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"카테고리 유지 테스트\",\"content\":\"<p>본문2</p>\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.category").value("STORY"))
                .andExpect(jsonPath("$.data.title").value("카테고리 유지 테스트"));

        JsonNode fetched = objectMapper.readTree(mockMvc.perform(get("/api/v1/admin/interiors/" + id)
                        .header("Authorization", admin))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
        org.assertj.core.api.Assertions.assertThat(fetched.path("data").path("category").asText()).isEqualTo("STORY");
    }
}
