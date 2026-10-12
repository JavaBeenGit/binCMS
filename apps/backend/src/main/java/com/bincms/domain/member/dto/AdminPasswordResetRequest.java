package com.bincms.domain.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 관리자 비밀번호 초기화 요청 DTO
 */
@Getter
@NoArgsConstructor
public class AdminPasswordResetRequest {
    
    @NotBlank(message = "새 비밀번호는 필수입니다")
    @Size(min = 8, max = 20, message = "비밀번호는 8자 이상 20자 이하여야 합니다")
    private String newPassword;
}
