package com.bincms.domain.menu.entity;

import com.bincms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

/**
 * 메뉴 엔티티
 */
@Entity
@Table(name = "TB_MENUS", indexes = {
    @Index(name = "IDX_MENUS_PARENT_ID", columnList = "PARENT_ID"),
    @Index(name = "IDX_MENUS_TYPE", columnList = "MENU_TYPE")
})
@Comment("메뉴")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Menu extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("메뉴 ID")
    private Long id;
    
    /**
     * 메뉴 타입 (관리자/사용자)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "MENU_TYPE", nullable = false, length = 20)
    @Comment("메뉴 타입")
    private MenuType menuType;
    
    /**
     * 메뉴명
     */
    @Column(name = "MENU_NAME", nullable = false, length = 100)
    @Comment("메뉴명")
    private String menuName;
    
    /**
     * 메뉴 URL
     */
    @Column(name = "MENU_URL", length = 200)
    @Comment("메뉴 URL")
    private String menuUrl;
    
    /**
     * 부모 메뉴 ID
     */
    @Column(name = "PARENT_ID")
    @Comment("부모 메뉴 ID")
    private Long parentId;
    
    /**
     * 메뉴 깊이
     */
    @Column(name = "DEPTH", nullable = false)
    @Comment("메뉴 깊이")
    private Integer depth;
    
    /**
     * 정렬 순서
     */
    @Column(name = "SORT_ORDER", nullable = false)
    @Comment("정렬 순서")
    private Integer sortOrder;
    
    /**
     * 아이콘
     */
    @Column(name = "ICON", length = 50)
    @Comment("아이콘")
    private String icon;
    
    /**
     * 설명
     */
    @Column(name = "DESCRIPTION", length = 500)
    @Comment("설명")
    private String description;
    
    /**
     * 사용 여부
     */
    @Column(name = "USE_YN", nullable = false, length = 1)
    @Comment("사용 여부")
    private String useYn;
    
    @Builder
    public Menu(MenuType menuType, String menuName, String menuUrl, Long parentId, 
                Integer depth, Integer sortOrder, String icon, String description) {
        this.menuType = menuType;
        this.menuName = menuName;
        this.menuUrl = menuUrl;
        this.parentId = parentId;
        this.depth = depth != null ? depth : 1;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        this.icon = icon;
        this.description = description;
        this.useYn = "Y";
    }
    
    /**
     * 메뉴 정보 수정
     */
    public void update(String menuName, String menuUrl, Integer sortOrder, String icon, String description) {
        this.menuName = menuName;
        this.menuUrl = menuUrl;
        this.sortOrder = sortOrder;
        this.icon = icon;
        this.description = description;
    }
    
    /**
     * 사용 여부 변경
     */
    public void changeUseYn(String useYn) {
        this.useYn = useYn;
    }
    
    /**
     * 비활성화
     */
    public void deactivate() {
        this.useYn = "N";
    }
    
    /**
     * 활성화
     */
    public void activate() {
        this.useYn = "Y";
    }
}
