package com.bincms.interior;

import com.bincms.support.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 인테리어 갤러리 공개 조회: 등록 → 공개 목록 노출 → 상세 조회수 증가 → 삭제(비활성) 후 목록 제외.
 * 기대값 정본: docs/30-dev/guides/features/40-인테리어-갤러리.md
 */
class InteriorPublicTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("등록한 글이 공개 목록에 보이고, 상세 조회마다 viewCount 가 1씩 는다")
    void publicListAndViewCount() throws Exception {
        String admin = adminBearer();
        String title = "public-" + System.nanoTime();
        long id = objectMapper.readTree(mockMvc.perform(post("/api/v1/admin/interiors").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"category\":\"SELF_TIP\",\"title\":\"" + title + "\",\"content\":\"<p>tip</p>\"}"))
                .andExpect(status().is2xxSuccessful())
                .andReturn().getResponse().getContentAsString()).path("data").path("id").asLong();

        JsonNode list = objectMapper.readTree(mockMvc.perform(get("/api/v1/public/interiors/category/SELF_TIP")
                        .param("page", "0").param("size", "50"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).path("data").path("content");
        assertThat(list.findValues("id")).extracting(JsonNode::asLong).contains(id);

        mockMvc.perform(get("/api/v1/public/interiors/" + id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.viewCount").value(1));
        mockMvc.perform(get("/api/v1/public/interiors/" + id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.viewCount").value(2));

        // 삭제(소프트) 후 공개 목록에서 빠진다
        mockMvc.perform(delete("/api/v1/admin/interiors/" + id).header("Authorization", admin))
                .andExpect(status().isOk());
        JsonNode after = objectMapper.readTree(mockMvc.perform(get("/api/v1/public/interiors/category/SELF_TIP")
                        .param("page", "0").param("size", "50"))
                .andReturn().getResponse().getContentAsString()).path("data").path("content");
        assertThat(after.findValues("id")).extracting(JsonNode::asLong).doesNotContain(id);
    }

    @Test
    @DisplayName("없는 카테고리/없는 id 는 4xx")
    void notFound() throws Exception {
        mockMvc.perform(get("/api/v1/public/interiors/category/NOPE")).andExpect(status().is4xxClientError());
        mockMvc.perform(get("/api/v1/public/interiors/999999")).andExpect(status().is4xxClientError());
    }
}
