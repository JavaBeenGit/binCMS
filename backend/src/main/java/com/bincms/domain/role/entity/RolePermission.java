package com.bincms.domain.role.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

/**
 * 역할-권한 매핑 엔티티
 */
@Entity
@Table(name = "TB_ROLE_PERMISSIONS", indexes = {
    @Index(name = "IDX_RP_ROLE_ID", columnList = "ROLE_ID"),
    @Index(name = "IDX_RP_PERM_ID", columnList = "PERM_ID")
}, uniqueConstraints = {
    @UniqueConstraint(name = "UK_ROLE_PERM", columnNames = {"ROLE_ID", "PERM_ID"})
})
@Comment("역할별 권한")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RolePermission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("역할-권한 ID")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROLE_ID", nullable = false)
    @Comment("역할 ID")
    private Role role;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PERM_ID", nullable = false)
    @Comment("권한 ID")
    private Permission permission;
    
    @Builder
    public RolePermission(Role role, Permission permission) {
        this.role = role;
        this.permission = permission;
    }
}
