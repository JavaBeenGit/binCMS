package com.bincms.menu;

import com.bincms.support.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 홈페이지 상단 메뉴 = DB 사용자 메뉴 (2026-10-13). 기대값 정본: docs/30-dev/guides/features/00-공통.md §헤더.
 * - 공개 API 는 비로그인으로 읽히고, 켜진(use_yn=Y) 메뉴만 트리로 내려간다. 자유게시판은 V4 에서 숨김.
 * - 관리자가 끄기/켜기·순서 이동을 하면 공개 API 에 바로 반영된다.
 */
class SiteMenuTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("공개 메뉴 API: 비로그인 200, 켜진 사용자 메뉴만 트리로 (자유게시판은 숨김)")
    void publicMenusForAnonymous() throws Exception {
        JsonNode data = publicMenus();
        assertThat(names(data)).containsExactly("HOME", "공지사항", "인테리어", "자주묻는질문", "견적문의");
        assertThat(names(data.get(2).get("children"))).containsExactly("현장시공", "셀프시공", "인테리어스토리");
        assertThat(data.get(2).get("children").get(0).get("menuUrl").asText()).isEqualTo("/user/interior/onsite");
    }

    @Test
    @DisplayName("관리자가 메뉴를 끄면 공개 API 에서 빠지고, 켜면 돌아온다")
    void deactivateAndActivate() throws Exception {
        String admin = adminBearer();
        long noticeId = userMenuId(admin, "/user/notice");

        mockMvc.perform(patch("/api/v1/admin/menus/" + noticeId + "/deactivate").header("Authorization", admin))
                .andExpect(status().isOk());
        assertThat(names(publicMenus())).doesNotContain("공지사항");

        mockMvc.perform(patch("/api/v1/admin/menus/" + noticeId + "/activate").header("Authorization", admin))
                .andExpect(status().isOk());
        assertThat(names(publicMenus())).contains("공지사항");
    }

    @Test
    @DisplayName("순서 이동: 아래로 내리면 형제와 자리를 바꾸고, 위로 올리면 원래대로")
    void moveSwapsSiblings() throws Exception {
        String admin = adminBearer();
        long homeId = userMenuId(admin, "/user");

        mockMvc.perform(patch("/api/v1/admin/menus/" + homeId + "/move").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"direction\":\"down\"}"))
                .andExpect(status().isOk());
        assertThat(names(publicMenus())).startsWith("공지사항", "HOME");

        mockMvc.perform(patch("/api/v1/admin/menus/" + homeId + "/move").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"direction\":\"up\"}"))
                .andExpect(status().isOk());
        assertThat(names(publicMenus())).startsWith("HOME", "공지사항");
    }

    @Test
    @DisplayName("끄기·순서 이동은 관리자만 — 비로그인은 401")
    void mutationsRequireAdmin() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/menus/1/deactivate")).andExpect(status().isUnauthorized());
        mockMvc.perform(patch("/api/v1/admin/menus/1/move").contentType(MediaType.APPLICATION_JSON).content("{\"direction\":\"up\"}"))
                .andExpect(status().isUnauthorized());
    }

    private JsonNode publicMenus() throws Exception {
        String body = mockMvc.perform(get("/api/v1/public/menus"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return objectMapper.readTree(body).get("data");
    }

    private long userMenuId(String admin, String url) throws Exception {
        String body = mockMvc.perform(get("/api/v1/admin/menus").header("Authorization", admin))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        for (JsonNode n : objectMapper.readTree(body).get("data")) {
            if ("USER".equals(n.get("menuType").asText()) && url.equals(n.path("menuUrl").asText())) {
                return n.get("id").asLong();
            }
        }
        throw new AssertionError("사용자 메뉴 없음: " + url);
    }

    private static List<String> names(JsonNode nodes) {
        List<String> out = new ArrayList<>();
        if (nodes != null) nodes.forEach(n -> out.add(n.get("menuName").asText()));
        return out;
    }
}
