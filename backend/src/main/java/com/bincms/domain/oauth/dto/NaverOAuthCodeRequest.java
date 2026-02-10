package com.bincms.domain.oauth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 네이버 OAuth 인가 코드 요청 DTO
 * 네이버는 CSRF 방지를 위한 state 파라미터가 필수
 */
@Getter
@NoArgsConstructor
public class NaverOAuthCodeRequest {

    @NotBlank(message = "인가 코드는 필수입니다")
    private String code;

    @NotBlank(message = "state 값은 필수입니다")
    private String state;
}
