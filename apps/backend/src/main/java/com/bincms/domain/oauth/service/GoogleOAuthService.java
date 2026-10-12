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
 * 구글 OAuth 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final MemberService memberService;
    private final ObjectMapper objectMapper;

    @Value("${app.oauth.google.client-id}")
    private String clientId;

    @Value("${app.oauth.google.client-secret}")
    private String clientSecret;

    @Value("${app.oauth.google.redirect-uri}")
    private String redirectUri;

    @Value("${app.oauth.google.token-url}")
    private String tokenUrl;

    @Value("${app.oauth.google.user-info-url}")
    private String userInfoUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 구글 인가 코드로 로그인 처리
     */
    public LoginResponse processGoogleLogin(String authorizationCode) {
        // 1. 인가 코드 → 액세스 토큰
        String accessToken = getAccessToken(authorizationCode);

        // 2. 액세스 토큰 → 사용자 정보
        GoogleUserInfo userInfo = getUserInfo(accessToken);

        log.info("구글 로그인 - id: {}, name: {}, email: {}",
                userInfo.id, userInfo.name, userInfo.email);

        // 3. 회원 조회/생성 → JWT 발급
        return memberService.socialLogin(
                "GOOGLE",
                userInfo.id,
                userInfo.email,
                userInfo.name
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
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            if (jsonNode.has("error")) {
                log.error("구글 토큰 요청 실패: {}", jsonNode.get("error_description").asText());
                throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "구글 인증에 실패했습니다.");
            }

            return jsonNode.get("access_token").asText();
        } catch (BusinessException e) {
            throw e;
        } catch (HttpClientErrorException e) {
            log.error("구글 토큰 요청 HTTP 에러 - status: {}, body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "구글 인증에 실패했습니다: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("구글 토큰 요청 중 오류 - class: {}, message: {}", e.getClass().getName(), e.getMessage(), e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "구글 인증 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 액세스 토큰으로 사용자 정보 요청
     */
    private GoogleUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    userInfoUrl, HttpMethod.GET, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            // sub = 구글 고유 사용자 ID
            String id = jsonNode.get("sub").asText();

            // 이름
            String name = null;
            if (jsonNode.has("name") && !jsonNode.get("name").isNull()) {
                name = jsonNode.get("name").asText();
            }

            // 이메일
            String email = null;
            if (jsonNode.has("email") && !jsonNode.get("email").isNull()) {
                email = jsonNode.get("email").asText();
            }

            return new GoogleUserInfo(id, name, email);
        } catch (Exception e) {
            log.error("구글 사용자 정보 요청 중 오류: {}", e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "구글 사용자 정보를 가져올 수 없습니다.");
        }
    }

    /**
     * 구글 사용자 정보
     */
    private record GoogleUserInfo(String id, String name, String email) {
    }
}
