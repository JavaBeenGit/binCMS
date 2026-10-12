package com.bincms.domain.oauth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * OAuth 인가 코드 요청 DTO
 */
@Getter
@NoArgsConstructor
public class OAuthCodeRequest {

    @NotBlank(message = "인가 코드는 필수입니다")
    private String code;
}
