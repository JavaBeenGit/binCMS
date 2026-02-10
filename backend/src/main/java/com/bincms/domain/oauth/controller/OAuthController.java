package com.bincms.domain.oauth.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.member.dto.LoginResponse;
import com.bincms.domain.oauth.dto.OAuthCodeRequest;
import com.bincms.domain.oauth.service.KakaoOAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * OAuth 인증 API 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/public/oauth")
@RequiredArgsConstructor
public class OAuthController {

    private final KakaoOAuthService kakaoOAuthService;

    @Value("${app.oauth.kakao.client-id}")
    private String kakaoClientId;

    @Value("${app.oauth.kakao.redirect-uri}")
    private String kakaoRedirectUri;

    /**
     * 카카오 OAuth 설정 정보 (프론트엔드에서 인가 URL 구성용)
     */
    @GetMapping("/kakao/config")
    public ApiResponse<Map<String, String>> getKakaoConfig() {
        return ApiResponse.success(Map.of(
                "clientId", kakaoClientId,
                "redirectUri", kakaoRedirectUri,
                "authUrl", "https://kauth.kakao.com/oauth/authorize"
        ));
    }

    /**
     * 카카오 인가 코드로 로그인
     */
    @PostMapping("/kakao")
    public ApiResponse<LoginResponse> kakaoLogin(@Valid @RequestBody OAuthCodeRequest request) {
        LoginResponse response = kakaoOAuthService.processKakaoLogin(request.getCode());
        return ApiResponse.success(response, "카카오 로그인에 성공했습니다");
    }
}
