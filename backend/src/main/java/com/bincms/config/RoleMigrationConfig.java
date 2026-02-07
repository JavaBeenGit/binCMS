package com.bincms.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

/**
 * 기존 tb_members.role (문자열 컬럼) → tb_members.role_id (FK) 마이그레이션
 * DataSource Bean 생성 시점에 마이그레이션을 실행하여 Hibernate DDL보다 먼저 처리합니다.
 */
@Slf4j
@Configuration
public class RoleMigrationConfig {
    
    @Bean
    public DataSource dataSource(Environment env) {
        String url = env.getProperty("spring.datasource.url");
        String username = env.getProperty("spring.datasource.username");
        String password = env.getProperty("spring.datasource.password");
        String driver = env.getProperty("spring.datasource.driver-class-name", "com.mysql.cj.jdbc.Driver");
        
        DataSource dataSource = DataSourceBuilder.create()
                .url(url)
                .username(username)
                .password(password)
                .driverClassName(driver)
                .build();
        
        // DataSource 생성 직후, Hibernate DDL 전에 마이그레이션 실행
        if (url != null && url.contains("mysql")) {
            runMigration(new JdbcTemplate(dataSource));
        }
        
        return dataSource;
    }
    
    private void runMigration(JdbcTemplate jdbc) {
        try {
            // tb_members 테이블 자체가 없으면 새 프로젝트이므로 스킵
            if (!tableExists(jdbc, "tb_members")) {
                log.info("[RoleMigration] tb_members not found - fresh install, skipping");
                return;
            }
            
            boolean hasOldRoleColumn = hasColumn(jdbc, "tb_members", "role");
            if (!hasOldRoleColumn) {
                log.info("[RoleMigration] Old 'role' column not found - already migrated or fresh");
                // 이미 마이그레이션 완료된 경우에도 FK가 없으면 추가
                ensureForeignKey(jdbc);
                return;
            }
            
            log.info("[RoleMigration] Starting migration: role column → role_id FK...");
            
            // 1. tb_roles 테이블 생성
            if (!tableExists(jdbc, "tb_roles")) {
                jdbc.execute("""
                    CREATE TABLE tb_roles (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '역할 ID',
                        role_code VARCHAR(30) NOT NULL UNIQUE COMMENT '역할 코드',
                        role_name VARCHAR(50) NOT NULL COMMENT '역할명',
                        description VARCHAR(200) COMMENT '설명',
                        sort_order INT NOT NULL DEFAULT 0 COMMENT '정렬 순서',
                        use_yn VARCHAR(1) NOT NULL DEFAULT 'Y' COMMENT '사용 여부',
                        reg_dt DATETIME(6) COMMENT '등록일시',
                        mod_dt DATETIME(6) COMMENT '수정일시',
                        reg_no VARCHAR(50) COMMENT '등록자',
                        mod_no VARCHAR(50) COMMENT '수정자'
                    ) COMMENT='역할'
                """);
                log.info("[RoleMigration] Created tb_roles");
            }
            
            // 2. tb_permissions 테이블 생성
            if (!tableExists(jdbc, "tb_permissions")) {
                jdbc.execute("""
                    CREATE TABLE tb_permissions (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '권한 ID',
                        perm_code VARCHAR(50) NOT NULL UNIQUE COMMENT '권한 코드',
                        perm_name VARCHAR(100) NOT NULL COMMENT '권한명',
                        perm_group VARCHAR(30) NOT NULL COMMENT '권한 그룹',
                        description VARCHAR(200) COMMENT '설명',
                        sort_order INT NOT NULL DEFAULT 0 COMMENT '정렬 순서',
                        use_yn VARCHAR(1) NOT NULL DEFAULT 'Y' COMMENT '사용 여부',
                        reg_dt DATETIME(6) COMMENT '등록일시',
                        mod_dt DATETIME(6) COMMENT '수정일시',
                        reg_no VARCHAR(50) COMMENT '등록자',
                        mod_no VARCHAR(50) COMMENT '수정자'
                    ) COMMENT='권한'
                """);
                log.info("[RoleMigration] Created tb_permissions");
            }
            
            // 3. tb_role_permissions 테이블 생성
            if (!tableExists(jdbc, "tb_role_permissions")) {
                jdbc.execute("""
                    CREATE TABLE tb_role_permissions (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '역할-권한 ID',
                        role_id BIGINT NOT NULL COMMENT '역할 ID',
                        perm_id BIGINT NOT NULL COMMENT '권한 ID',
                        CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES tb_roles(id),
                        CONSTRAINT fk_rp_perm FOREIGN KEY (perm_id) REFERENCES tb_permissions(id),
                        CONSTRAINT uk_role_perm UNIQUE (role_id, perm_id)
                    ) COMMENT='역할별 권한'
                """);
                log.info("[RoleMigration] Created tb_role_permissions");
            }
            
            // 4. 기본 역할 삽입
            insertRoleIfNotExists(jdbc, "USER", "일반 사용자", "일반 사용자 역할", 4);
            insertRoleIfNotExists(jdbc, "SYSTEM_ADMIN", "시스템 관리자", "모든 권한을 가진 시스템 관리자", 1);
            insertRoleIfNotExists(jdbc, "OPERATION_ADMIN", "운영 관리자", "시스템 관리 메뉴를 제외한 운영 관리자", 2);
            insertRoleIfNotExists(jdbc, "GENERAL_ADMIN", "일반 관리자", "기본 관리 기능만 접근 가능한 일반 관리자", 3);
            
            // 5. role_id 컬럼 추가
            if (!hasColumn(jdbc, "tb_members", "role_id")) {
                jdbc.execute("ALTER TABLE tb_members ADD COLUMN role_id BIGINT COMMENT '역할 ID'");
                log.info("[RoleMigration] Added role_id column");
            }
            
            // 6. 기존 role 문자열 → role_id 데이터 매핑
            jdbc.execute("""
                UPDATE tb_members m
                JOIN tb_roles r ON r.role_code = m.role
                SET m.role_id = r.id
                WHERE m.role_id IS NULL AND m.role IS NOT NULL
            """);
            
            // NULL인 행은 USER로 설정
            Integer userRoleId = jdbc.queryForObject(
                "SELECT id FROM tb_roles WHERE role_code = 'USER'", Integer.class);
            if (userRoleId != null) {
                jdbc.update("UPDATE tb_members SET role_id = ? WHERE role_id IS NULL", userRoleId);
            }
            
            // 7. role_id NOT NULL 설정
            try {
                jdbc.execute("ALTER TABLE tb_members MODIFY COLUMN role_id BIGINT NOT NULL COMMENT '역할 ID'");
            } catch (Exception e) {
                log.warn("[RoleMigration] NOT NULL constraint: {}", e.getMessage());
            }
            
            // 8. FK constraint 추가 (Hibernate @ForeignKey 이름과 일치시킴)
            if (!foreignKeyExists(jdbc, "tb_members", "fk_members_role")) {
                jdbc.execute("ALTER TABLE tb_members ADD CONSTRAINT fk_members_role FOREIGN KEY (role_id) REFERENCES tb_roles(id)");
                log.info("[RoleMigration] Added FK constraint fk_members_role");
            }
            
            // 9. 기존 role 컬럼 삭제
            log.info("[RoleMigration] Dropping old 'role' column...");
            jdbc.execute("ALTER TABLE tb_members DROP COLUMN role");
            
            log.info("[RoleMigration] ✅ Migration completed successfully!");
            
        } catch (Exception e) {
            log.error("[RoleMigration] Migration error: {}", e.getMessage(), e);
        }
    }
    
    private boolean hasColumn(JdbcTemplate jdbc, String table, String column) {
        try {
            List<Map<String, Object>> r = jdbc.queryForList(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                table, column);
            return !r.isEmpty();
        } catch (Exception e) { return false; }
    }
    
    private boolean tableExists(JdbcTemplate jdbc, String table) {
        try {
            List<Map<String, Object>> r = jdbc.queryForList(
                "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
                table);
            return !r.isEmpty();
        } catch (Exception e) { return false; }
    }
    
    private void insertRoleIfNotExists(JdbcTemplate jdbc, String code, String name, String desc, int sort) {
        List<Map<String, Object>> existing = jdbc.queryForList(
            "SELECT id FROM tb_roles WHERE role_code = ?", code);
        if (existing.isEmpty()) {
            jdbc.update(
                "INSERT INTO tb_roles (role_code, role_name, description, sort_order, use_yn, reg_dt) VALUES (?, ?, ?, ?, 'Y', NOW(6))",
                code, name, desc, sort);
            log.info("[RoleMigration] Created role: {}", code);
        }
    }
    
    private boolean foreignKeyExists(JdbcTemplate jdbc, String table, String fkName) {
        try {
            List<Map<String, Object>> r = jdbc.queryForList(
                "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY'",
                table, fkName);
            return !r.isEmpty();
        } catch (Exception e) { return false; }
    }
    
    /**
     * tb_members.role_id FK가 없으면 생성 (Hibernate @ForeignKey 이름과 일치)
     */
    private void ensureForeignKey(JdbcTemplate jdbc) {
        if (hasColumn(jdbc, "tb_members", "role_id") 
                && tableExists(jdbc, "tb_roles")) {
            
            // 진단: orphan role_id 값 확인 (NULL, 0, 또는 tb_roles에 없는 값)
            try {
                List<Map<String, Object>> orphans = jdbc.queryForList(
                    "SELECT m.id, m.lgn_id, m.role_id FROM tb_members m LEFT JOIN tb_roles r ON m.role_id = r.id WHERE r.id IS NULL OR m.role_id = 0");
                if (!orphans.isEmpty()) {
                    log.warn("[RoleMigration] Found {} members with invalid role_id:", orphans.size());
                    for (Map<String, Object> o : orphans) {
                        log.warn("[RoleMigration]   member id={}, loginId={}, role_id={}", 
                            o.get("id"), o.get("lgn_id"), o.get("role_id"));
                    }
                    // orphan 데이터: SYSTEM_ADMIN 역할이 있으면 admin용으로 매핑, 없으면 USER
                    Integer adminRoleId = null;
                    try {
                        adminRoleId = jdbc.queryForObject(
                            "SELECT id FROM tb_roles WHERE role_code = 'SYSTEM_ADMIN'", Integer.class);
                    } catch (Exception ignored) {}
                    
                    Integer userRoleId = jdbc.queryForObject(
                        "SELECT id FROM tb_roles WHERE role_code = 'USER'", Integer.class);
                    
                    // admin 계정은 SYSTEM_ADMIN, 나머지는 USER
                    int targetRoleId = (adminRoleId != null) ? adminRoleId : userRoleId;
                    int updated = jdbc.update(
                        "UPDATE tb_members SET role_id = ? WHERE role_id = 0 OR role_id IS NULL OR role_id NOT IN (SELECT id FROM tb_roles)",
                        targetRoleId);
                    log.info("[RoleMigration] Fixed {} orphan members → role_id={}", updated, targetRoleId);
                }
                
                // NULL role_id도 처리 (위에서 이미 처리되었을 수 있지만 안전하게)
                List<Map<String, Object>> remaining = jdbc.queryForList(
                    "SELECT id FROM tb_members WHERE role_id IS NULL OR role_id = 0");
                if (!remaining.isEmpty()) {
                    Integer fallbackRoleId = jdbc.queryForObject(
                        "SELECT id FROM tb_roles WHERE role_code = 'USER'", Integer.class);
                    if (fallbackRoleId != null) {
                        int updated = jdbc.update("UPDATE tb_members SET role_id = ? WHERE role_id IS NULL OR role_id = 0", fallbackRoleId);
                        log.info("[RoleMigration] Fixed {} remaining NULL/0 role_id members → USER role", updated);
                    }
                }
            } catch (Exception e) {
                log.warn("[RoleMigration] Orphan check error: {}", e.getMessage());
            }
            
            if (!foreignKeyExists(jdbc, "tb_members", "fk_members_role")) {
                try {
                    // 혹시 Hibernate 자동 이름 FK가 있으면 삭제
                    dropForeignKeyIfExists(jdbc, "tb_members");
                    jdbc.execute("ALTER TABLE tb_members ADD CONSTRAINT fk_members_role FOREIGN KEY (role_id) REFERENCES tb_roles(id)");
                    log.info("[RoleMigration] Added FK constraint fk_members_role (post-migration)");
                } catch (Exception e) {
                    log.warn("[RoleMigration] FK creation failed: {}", e.getMessage());
                }
            }
        }
    }
    
    /**
     * tb_members에서 role_id 관련 기존 FK들을 삭제 (Hibernate 자동 이름 등)
     */
    private void dropForeignKeyIfExists(JdbcTemplate jdbc, String table) {
        try {
            List<Map<String, Object>> fks = jdbc.queryForList(
                "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'role_id' AND REFERENCED_TABLE_NAME = 'tb_roles'",
                table);
            for (Map<String, Object> fk : fks) {
                String fkName = fk.get("CONSTRAINT_NAME").toString();
                if (!"fk_members_role".equals(fkName)) {
                    jdbc.execute("ALTER TABLE " + table + " DROP FOREIGN KEY " + fkName);
                    log.info("[RoleMigration] Dropped old FK: {}", fkName);
                }
            }
        } catch (Exception e) {
            log.warn("[RoleMigration] Error checking/dropping FK: {}", e.getMessage());
        }
    }
}
