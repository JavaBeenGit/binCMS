package com.bincms.db;

import com.bincms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 빈 DB에서 Flyway 만으로 스키마·기준 시드가 만들어지고 관리자 계정이 생기는지 고정한다.
 * (Testcontainers Linux MySQL 이라 물리명 대소문자 문제도 함께 검증된다.)
 */
class FlywayMigrationTest extends AbstractIntegrationTest {

    @Autowired
    JdbcTemplate jdbc;

    @Test
    @DisplayName("Flyway 이력: V1·V2가 성공 상태로 적용돼 있다")
    void migrationsApplied() {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT version, success FROM flyway_schema_history WHERE version IS NOT NULL ORDER BY installed_rank");
        assertThat(rows).extracting(r -> r.get("version").toString()).containsExactly("1", "2");
        assertThat(rows).allMatch(r -> Boolean.TRUE.equals(r.get("success")) || Integer.valueOf(1).equals(r.get("success")));
    }

    @Test
    @DisplayName("기준 시드: 역할 4·권한 16·역할권한 31·게시판 3·메뉴 30(ADMIN 21, USER 9)")
    void coreSeedPresent() {
        assertThat(count("tb_roles")).isEqualTo(4);
        assertThat(count("tb_permissions")).isEqualTo(16);
        assertThat(count("tb_role_permissions")).isEqualTo(31);
        assertThat(count("tb_boards")).isEqualTo(3);
        assertThat(count("tb_menus")).isEqualTo(30);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM tb_menus WHERE menu_type = 'ADMIN'", Long.class)).isEqualTo(21);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM tb_menus WHERE menu_type = 'USER'", Long.class)).isEqualTo(9);
        assertThat(jdbc.queryForList("SELECT board_code FROM tb_boards ORDER BY sort_order", String.class))
                .containsExactly("notice", "faq", "free");
    }

    @Test
    @DisplayName("관리자 계정: admin 이 SYSTEM_ADMIN 역할로 생성돼 로그인된다")
    void adminAccountCreated() throws Exception {
        String roleCode = jdbc.queryForObject(
                "SELECT r.role_code FROM tb_members m JOIN tb_roles r ON r.id = m.role_id WHERE m.lgn_id = 'admin'", String.class);
        assertThat(roleCode).isEqualTo("SYSTEM_ADMIN");
        assertThat(adminBearer()).startsWith("Bearer ey");
    }

    private long count(String table) {
        Long n = jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Long.class);
        return n == null ? -1 : n;
    }
}
