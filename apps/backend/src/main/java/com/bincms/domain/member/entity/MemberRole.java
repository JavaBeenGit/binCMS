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
     * 시스템 관리자 (모든 권한)
     */
    SYSTEM_ADMIN("ROLE_SYSTEM_ADMIN", "시스템 관리자"),
    
    /**
     * 운영 관리자 (시스템 관리 접근 불가)
     */
    OPERATION_ADMIN("ROLE_OPERATION_ADMIN", "운영 관리자"),
    
    /**
     * 일반 관리자 (운영 관리자와 동일)
     */
    GENERAL_ADMIN("ROLE_GENERAL_ADMIN", "일반 관리자");
    
    /**
     * 관리자 권한인지 확인
     */
    public boolean isAdmin() {
        return this == SYSTEM_ADMIN || this == OPERATION_ADMIN || this == GENERAL_ADMIN;
    }
    
    /**
     * 시스템 관리 접근 가능 여부
     */
    public boolean canAccessSystemMenu() {
        return this == SYSTEM_ADMIN;
    }
    
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
