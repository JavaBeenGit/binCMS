package com.bincms.domain.menu.dto;

import com.bincms.domain.menu.entity.Menu;
import com.bincms.domain.menu.entity.MenuType;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
public class MenuResponse {
    private final Long id;
    private final MenuType menuType;
    private final String menuName;
    private final String menuUrl;
    private final Long parentId;
    private final Integer depth;
    private final Integer sortOrder;
    private final String icon;
    private final String description;
    private final String useYn;
    private final LocalDateTime regDt;
    private final LocalDateTime modDt;
    private final String regNo;
    private final List<MenuResponse> children;
    
    private MenuResponse(Menu menu) {
        this.id = menu.getId();
        this.menuType = menu.getMenuType();
        this.menuName = menu.getMenuName();
        this.menuUrl = menu.getMenuUrl();
        this.parentId = menu.getParentId();
        this.depth = menu.getDepth();
        this.sortOrder = menu.getSortOrder();
        this.icon = menu.getIcon();
        this.description = menu.getDescription();
        this.useYn = menu.getUseYn();
        this.regDt = menu.getRegDt();
        this.modDt = menu.getModDt();
        this.regNo = menu.getRegNo();
        this.children = new ArrayList<>();
    }
    
    public static MenuResponse from(Menu menu) {
        return new MenuResponse(menu);
    }
    
    public void addChild(MenuResponse child) {
        this.children.add(child);
    }
}
