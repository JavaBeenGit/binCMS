package com.bincms.domain.role.entity;

import com.bincms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.util.ArrayList;
import java.util.List;

/**
 * 역할 엔티티
 */
@Entity
@Table(name = "TB_ROLES", indexes = {
    @Index(name = "IDX_ROLES_ROLE_CODE", columnList = "ROLE_CODE", unique = true)
})
@Comment("역할")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Role extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("역할 ID")
    private Long id;
    
    /**
     * 역할 코드 (SYSTEM_ADMIN, OPERATION_ADMIN, GENERAL_ADMIN, USER)
     */
    @Column(name = "ROLE_CODE", nullable = false, unique = true, length = 30)
    @Comment("역할 코드")
    private String roleCode;
    
    /**
     * 역할명
     */
    @Column(name = "ROLE_NAME", nullable = false, length = 50)
    @Comment("역할명")
    private String roleName;
    
    /**
     * 설명
     */
    @Column(name = "DESCRIPTION", length = 200)
    @Comment("설명")
    private String description;
    
    /**
     * 정렬 순서
     */
    @Column(name = "SORT_ORDER", nullable = false)
    @Comment("정렬 순서")
    private Integer sortOrder;
    
    /**
     * 사용 여부
     */
    @Column(name = "USE_YN", nullable = false, length = 1)
    @Comment("사용 여부")
    private String useYn;
    
    /**
     * 역할-권한 매핑
     */
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RolePermission> rolePermissions = new ArrayList<>();
    
    @Builder
    public Role(String roleCode, String roleName, String description, Integer sortOrder) {
        this.roleCode = roleCode;
        this.roleName = roleName;
        this.description = description;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        this.useYn = "Y";
    }
    
    public void update(String roleName, String description, Integer sortOrder) {
        this.roleName = roleName;
        this.description = description;
        this.sortOrder = sortOrder;
    }
    
    public void deactivate() { this.useYn = "N"; }
    public void activate() { this.useYn = "Y"; }
    
    public void addPermission(RolePermission rolePermission) {
        this.rolePermissions.add(rolePermission);
    }
    
    public void clearPermissions() {
        this.rolePermissions.clear();
    }
}
