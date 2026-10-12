package com.bincms.domain.role.repository;

import com.bincms.domain.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 역할 Repository
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    /**
     * 역할 코드로 조회
     */
    Optional<Role> findByRoleCode(String roleCode);
    
    /**
     * 역할 코드 존재 여부
     */
    boolean existsByRoleCode(String roleCode);
    
    /**
     * 사용중인 역할 목록 (정렬순)
     */
    @Query("SELECT r FROM Role r WHERE r.useYn = 'Y' ORDER BY r.sortOrder ASC")
    List<Role> findAllActive();
    
    /**
     * 관리자 역할 목록 (USER 제외)
     */
    @Query("SELECT r FROM Role r WHERE r.useYn = 'Y' AND r.roleCode != 'USER' ORDER BY r.sortOrder ASC")
    List<Role> findAdminRoles();
    
    /**
     * 역할 코드 목록으로 조회
     */
    @Query("SELECT r FROM Role r WHERE r.roleCode IN :roleCodes AND r.useYn = 'Y'")
    List<Role> findByRoleCodes(@Param("roleCodes") List<String> roleCodes);
}
