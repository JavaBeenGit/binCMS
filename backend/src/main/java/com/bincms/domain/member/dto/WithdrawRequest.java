package com.bincms.domain.member.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원탈퇴 요청 DTO
 */
@Getter
@NoArgsConstructor
public class WithdrawRequest {
    
    /**
     * 비밀번호 (LOCAL 회원만 필수)
     */
    private String password;
    
    /**
     * 탈퇴 사유
     */
    private String reason;
}
