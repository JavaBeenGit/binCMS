package com.bincms.domain.member.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 회원 수정 요청 DTO (관리자에서 수정)
 */
@Getter
@NoArgsConstructor
public class UserMemberUpdateRequest {
    
    @NotBlank(message = "이름은 필수입니다")
    @Size(min = 2, max = 50, message = "이름은 2자 이상 50자 이하여야 합니다")
    private String name;
    
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;
    
    @Pattern(regexp = "^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$", message = "올바른 전화번호 형식이 아닙니다")
    private String phoneNumber;
    
    private Boolean active;
}
