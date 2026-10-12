package com.bincms.domain.interior.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 인테리어 카테고리
 */
@Getter
@AllArgsConstructor
public enum InteriorCategory {
    
    ONSITE("현장시공"),
    SELF_TIP("셀프시공 팁"),
    STORY("인테리어스토리");
    
    private final String displayName;
}
