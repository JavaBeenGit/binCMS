package com.bincms.domain.member.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 로그인 요청 DTO
 */
@Getter
@NoArgsConstructor
public class LoginRequest {
    
    @NotBlank(message = "로그인 ID는 필수입니다")
    private String loginId;
    
    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}
