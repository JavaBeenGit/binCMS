package com.bincms.domain.oauth.service;

import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.member.dto.LoginResponse;
import com.bincms.domain.member.service.MemberService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * 카카오 OAuth 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoOAuthService {

    private final MemberService memberService;
    private final ObjectMapper objectMapper;

    @Value("${app.oauth.kakao.client-id}")
    private String clientId;

    @Value("${app.oauth.kakao.redirect-uri}")
    private String redirectUri;

    @Value("${app.oauth.kakao.token-url}")
    private String tokenUrl;

    @Value("${app.oauth.kakao.user-info-url}")
    private String userInfoUrl;

    @Value("${app.oauth.kakao.client-secret:}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 카카오 인가 코드로 로그인 처리
     */
    public LoginResponse processKakaoLogin(String authorizationCode) {
        // 1. 인가 코드 → 액세스 토큰
        String accessToken = getAccessToken(authorizationCode);

        // 2. 액세스 토큰 → 사용자 정보
        KakaoUserInfo userInfo = getUserInfo(accessToken);

        log.info("카카오 로그인 - id: {}, nickname: {}, email: {}",
                userInfo.id, userInfo.nickname, userInfo.email);

        // 3. 회원 조회/생성 → JWT 발급
        return memberService.socialLogin(
                "KAKAO",
                String.valueOf(userInfo.id),
                userInfo.email,
                userInfo.nickname
        );
    }

    /**
     * 인가 코드로 액세스 토큰 요청
     */
    private String getAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        // Client Secret이 설정된 경우 추가
        if (clientSecret != null && !clientSecret.isBlank()) {
            params.add("client_secret", clientSecret);
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            if (jsonNode.has("error")) {
                log.error("카카오 토큰 요청 실패: {}", jsonNode.get("error_description").asText());
                throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "카카오 인증에 실패했습니다.");
            }

            return jsonNode.get("access_token").asText();
        } catch (BusinessException e) {
            throw e;
        } catch (HttpClientErrorException e) {
            log.error("카카오 토큰 요청 HTTP 에러 - status: {}, body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "카카오 인증에 실패했습니다: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("카카오 토큰 요청 중 오류 - class: {}, message: {}", e.getClass().getName(), e.getMessage(), e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "카카오 인증 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 액세스 토큰으로 사용자 정보 요청
     */
    private KakaoUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    userInfoUrl, HttpMethod.GET, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            long id = jsonNode.get("id").asLong();

            // 닉네임
            String nickname = null;
            JsonNode properties = jsonNode.get("properties");
            if (properties != null && properties.has("nickname")) {
                nickname = properties.get("nickname").asText();
            }

            // 이메일 (동의 항목에서 설정 필요)
            String email = null;
            JsonNode kakaoAccount = jsonNode.get("kakao_account");
            if (kakaoAccount != null && kakaoAccount.has("email")) {
                email = kakaoAccount.get("email").asText();
            }

            return new KakaoUserInfo(id, nickname, email);
        } catch (Exception e) {
            log.error("카카오 사용자 정보 요청 중 오류: {}", e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "카카오 사용자 정보를 가져올 수 없습니다.");
        }
    }

    /**
     * 카카오 사용자 정보
     */
    private record KakaoUserInfo(long id, String nickname, String email) {
    }
}
