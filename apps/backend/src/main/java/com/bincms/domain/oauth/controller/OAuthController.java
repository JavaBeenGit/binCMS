package com.bincms.domain.oauth.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.member.dto.LoginResponse;
import com.bincms.domain.oauth.dto.OAuthCodeRequest;
import com.bincms.domain.oauth.dto.NaverOAuthCodeRequest;
import com.bincms.domain.oauth.service.GoogleOAuthService;
import com.bincms.domain.oauth.service.KakaoOAuthService;
import com.bincms.domain.oauth.service.NaverOAuthService;
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
    private final NaverOAuthService naverOAuthService;
    private final GoogleOAuthService googleOAuthService;

    @Value("${app.oauth.kakao.client-id}")
    private String kakaoClientId;

    @Value("${app.oauth.kakao.redirect-uri}")
    private String kakaoRedirectUri;

    @Value("${app.oauth.naver.client-id}")
    private String naverClientId;

    @Value("${app.oauth.naver.redirect-uri}")
    private String naverRedirectUri;

    @Value("${app.oauth.google.client-id}")
    private String googleClientId;

    @Value("${app.oauth.google.redirect-uri}")
    private String googleRedirectUri;

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

    /**
     * 네이버 OAuth 설정 정보 (프론트엔드에서 인가 URL 구성용)
     */
    @GetMapping("/naver/config")
    public ApiResponse<Map<String, String>> getNaverConfig() {
        return ApiResponse.success(Map.of(
                "clientId", naverClientId,
                "redirectUri", naverRedirectUri,
                "authUrl", "https://nid.naver.com/oauth2.0/authorize"
        ));
    }

    /**
     * 네이버 인가 코드로 로그인
     */
    @PostMapping("/naver")
    public ApiResponse<LoginResponse> naverLogin(@Valid @RequestBody NaverOAuthCodeRequest request) {
        LoginResponse response = naverOAuthService.processNaverLogin(request.getCode(), request.getState());
        return ApiResponse.success(response, "네이버 로그인에 성공했습니다");
    }

    /**
     * 구글 OAuth 설정 정보 (프론트엔드에서 인가 URL 구성용)
     */
    @GetMapping("/google/config")
    public ApiResponse<Map<String, String>> getGoogleConfig() {
        return ApiResponse.success(Map.of(
                "clientId", googleClientId,
                "redirectUri", googleRedirectUri,
                "authUrl", "https://accounts.google.com/o/oauth2/v2/auth"
        ));
    }

    /**
     * 구글 인가 코드로 로그인
     */
    @PostMapping("/google")
    public ApiResponse<LoginResponse> googleLogin(@Valid @RequestBody OAuthCodeRequest request) {
        LoginResponse response = googleOAuthService.processGoogleLogin(request.getCode());
        return ApiResponse.success(response, "구글 로그인에 성공했습니다");
    }
}
