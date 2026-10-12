package com.bincms.admin;

import com.bincms.support.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 7단계: 관리자 사이드메뉴는 운영자(형) 기준으로 단순해야 한다 (V3 시드 고정).
 * 운영 메뉴 6개가 최상위, 커뮤니티·회원 / 시스템 관리는 그룹. 플레이스홀더(통계·IP·공통코드)는 없다.
 */
class AdminMenuTreeTest extends AbstractIntegrationTest {

    @Autowired
    JdbcTemplate jdbc;

    @Test
    @DisplayName("관리자 사이드메뉴: 운영 메뉴 6개 + 커뮤니티·회원 + 시스템 관리, 플레이스홀더 없음")
    void adminMenuTree() throws Exception {
        String body = mockMvc.perform(get("/api/v1/admin/menus/type/ADMIN")
                        .header("Authorization", adminBearer()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        JsonNode data = objectMapper.readTree(body).get("data");

        assertThat(names(data)).containsExactly(
                "대시보드", "시공사례", "공지사항", "자주묻는질문", "견적문의", "팝업 관리", "커뮤니티·회원", "시스템 관리");
        assertThat(names(data.get(1).get("children"))).containsExactly("현장시공", "셀프시공 팁", "인테리어스토리");
        assertThat(names(data.get(6).get("children"))).containsExactly("자유게시판", "회원 관리");
        assertThat(names(data.get(7).get("children"))).containsExactly(
                "컨텐츠 관리", "메뉴 관리", "게시판 설정", "권한 관리", "관리자 계정");
        JsonNode groupUrl = data.get(6).get("menuUrl");
        assertThat(groupUrl == null || groupUrl.isNull()).as("그룹 메뉴는 URL 없음").isTrue();

        List<String> urls = jdbc.queryForList(
                "SELECT menu_url FROM tb_menus WHERE menu_type = 'ADMIN' AND menu_url IS NOT NULL", String.class);
        assertThat(urls).doesNotContain("/admin/statistics", "/admin/system/ips", "/admin/system/codes", "/admin/posts");
    }

    @Test
    @DisplayName("역할 권한: 모든 관리자 역할이 운영 5메뉴를 갖고, 컨텐츠·시스템은 SYSTEM_ADMIN만")
    void rolePermissions() {
        assertThat(perms("GENERAL_ADMIN"))
                .contains("MENU_DASHBOARD", "MENU_POST", "MENU_INTERIOR", "MENU_POPUP")
                .doesNotContain("MENU_CONTENT", "MENU_SYSTEM_MENU", "MENU_USER");
        assertThat(perms("OPERATION_ADMIN"))
                .contains("MENU_DASHBOARD", "MENU_POST", "MENU_INTERIOR", "MENU_POPUP", "MENU_USER")
                .doesNotContain("MENU_CONTENT", "MENU_SYSTEM_ROLE");
        assertThat(perms("SYSTEM_ADMIN"))
                .contains("MENU_CONTENT", "MENU_SYSTEM_MENU", "MENU_SYSTEM_ADMIN", "MENU_SYSTEM_BOARD", "MENU_SYSTEM_ROLE");
        assertThat(jdbc.queryForList("SELECT perm_code FROM tb_permissions", String.class))
                .doesNotContain("MENU_STATISTICS", "MENU_SYSTEM_IP", "MENU_SYSTEM_CODE");
    }

    private static List<String> names(JsonNode nodes) {
        List<String> out = new ArrayList<>();
        nodes.forEach(n -> out.add(n.get("menuName").asText()));
        return out;
    }

    private List<String> perms(String roleCode) {
        return jdbc.queryForList(
                "SELECT p.perm_code FROM tb_role_permissions rp JOIN tb_permissions p ON p.id = rp.perm_id " +
                "JOIN tb_roles r ON r.id = rp.role_id WHERE r.role_code = ?", String.class, roleCode);
    }
}
