package com.bincms.domain.role.repository;

import com.bincms.domain.role.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 역할-권한 매핑 Repository
 */
@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    
    /**
     * 역할 ID로 매핑 조회
     */
    List<RolePermission> findByRoleId(Long roleId);
    
    /**
     * 역할 ID로 매핑 삭제
     */
    void deleteByRoleId(Long roleId);
    
    /**
     * 역할 코드로 권한 코드 목록 조회
     */
    @Query("SELECT rp.permission.permCode FROM RolePermission rp WHERE rp.role.roleCode = :roleCode")
    List<String> findPermCodesByRoleCode(@Param("roleCode") String roleCode);
}
