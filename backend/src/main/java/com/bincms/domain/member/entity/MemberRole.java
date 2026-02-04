package com.bincms.domain.member.entity;

/**
 * 회원 권한
 */
public enum MemberRole {
    /**
     * 일반 사용자
     */
    USER("ROLE_USER", "일반 사용자"),
    
    /**
     * 관리자
     */
    ADMIN("ROLE_ADMIN", "관리자");
    
    private final String key;
    private final String description;
    
    MemberRole(String key, String description) {
        this.key = key;
        this.description = description;
    }
    
    public String getKey() {
        return key;
    }
    
    public String getDescription() {
        return description;
    }
}
