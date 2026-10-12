package com.bincms.domain.role.repository;

import com.bincms.domain.role.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 권한 Repository
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    /**
     * 권한 코드로 조회
     */
    Optional<Permission> findByPermCode(String permCode);
    
    /**
     * 권한 코드 존재 여부
     */
    boolean existsByPermCode(String permCode);
    
    /**
     * 사용중인 권한 목록 (그룹별 정렬)
     */
    @Query("SELECT p FROM Permission p WHERE p.useYn = 'Y' ORDER BY p.permGroup ASC, p.sortOrder ASC")
    List<Permission> findAllActive();
    
    /**
     * 그룹별 권한 목록
     */
    @Query("SELECT p FROM Permission p WHERE p.permGroup = :group AND p.useYn = 'Y' ORDER BY p.sortOrder ASC")
    List<Permission> findByPermGroup(String group);
}
