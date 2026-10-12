package com.bincms.domain.role.entity;

import com.bincms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

/**
 * 권한 엔티티
 */
@Entity
@Table(name = "TB_PERMISSIONS", indexes = {
    @Index(name = "IDX_PERMISSIONS_CODE", columnList = "PERM_CODE", unique = true)
})
@Comment("권한")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Permission extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("권한 ID")
    private Long id;
    
    /**
     * 권한 코드 (예: MENU_SYSTEM, MENU_POST, MEMBER_MANAGE 등)
     */
    @Column(name = "PERM_CODE", nullable = false, unique = true, length = 50)
    @Comment("권한 코드")
    private String permCode;
    
    /**
     * 권한명
     */
    @Column(name = "PERM_NAME", nullable = false, length = 100)
    @Comment("권한명")
    private String permName;
    
    /**
     * 권한 그룹 (MENU, DATA, SYSTEM 등)
     */
    @Column(name = "PERM_GROUP", nullable = false, length = 30)
    @Comment("권한 그룹")
    private String permGroup;
    
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
    
    @Builder
    public Permission(String permCode, String permName, String permGroup, String description, Integer sortOrder) {
        this.permCode = permCode;
        this.permName = permName;
        this.permGroup = permGroup;
        this.description = description;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        this.useYn = "Y";
    }
}
