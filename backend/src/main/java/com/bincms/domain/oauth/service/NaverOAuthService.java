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
 * 네이버 OAuth 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NaverOAuthService {

    private final MemberService memberService;
    private final ObjectMapper objectMapper;

    @Value("${app.oauth.naver.client-id}")
    private String clientId;

    @Value("${app.oauth.naver.client-secret}")
    private String clientSecret;

    @Value("${app.oauth.naver.redirect-uri}")
    private String redirectUri;

    @Value("${app.oauth.naver.token-url}")
    private String tokenUrl;

    @Value("${app.oauth.naver.user-info-url}")
    private String userInfoUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 네이버 인가 코드로 로그인 처리
     */
    public LoginResponse processNaverLogin(String authorizationCode, String state) {
        // 1. 인가 코드 → 액세스 토큰
        String accessToken = getAccessToken(authorizationCode, state);

        // 2. 액세스 토큰 → 사용자 정보
        NaverUserInfo userInfo = getUserInfo(accessToken);

        log.info("네이버 로그인 - id: {}, nickname: {}, email: {}",
                userInfo.id, userInfo.nickname, userInfo.email);

        // 3. 회원 조회/생성 → JWT 발급
        return memberService.socialLogin(
                "NAVER",
                userInfo.id,
                userInfo.email,
                userInfo.nickname
        );
    }

    /**
     * 인가 코드로 액세스 토큰 요청
     */
    private String getAccessToken(String code, String state) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);
        params.add("state", state);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            if (jsonNode.has("error")) {
                log.error("네이버 토큰 요청 실패: {}", jsonNode.get("error_description").asText());
                throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "네이버 인증에 실패했습니다.");
            }

            return jsonNode.get("access_token").asText();
        } catch (BusinessException e) {
            throw e;
        } catch (HttpClientErrorException e) {
            log.error("네이버 토큰 요청 HTTP 에러 - status: {}, body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "네이버 인증에 실패했습니다: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("네이버 토큰 요청 중 오류 - class: {}, message: {}", e.getClass().getName(), e.getMessage(), e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "네이버 인증 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 액세스 토큰으로 사용자 정보 요청
     */
    private NaverUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    userInfoUrl, HttpMethod.GET, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            // 네이버 API 응답 코드 확인
            String resultCode = jsonNode.get("resultcode").asText();
            if (!"00".equals(resultCode)) {
                log.error("네이버 사용자 정보 요청 실패 - resultcode: {}, message: {}",
                        resultCode, jsonNode.get("message").asText());
                throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "네이버 사용자 정보를 가져올 수 없습니다.");
            }

            JsonNode responseNode = jsonNode.get("response");
            String id = responseNode.get("id").asText();

            // 닉네임 (nickname이 없으면 name 사용)
            String nickname = null;
            if (responseNode.has("nickname") && !responseNode.get("nickname").isNull()) {
                nickname = responseNode.get("nickname").asText();
            } else if (responseNode.has("name") && !responseNode.get("name").isNull()) {
                nickname = responseNode.get("name").asText();
            }

            // 이메일
            String email = null;
            if (responseNode.has("email") && !responseNode.get("email").isNull()) {
                email = responseNode.get("email").asText();
            }

            return new NaverUserInfo(id, nickname, email);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("네이버 사용자 정보 요청 중 오류: {}", e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "네이버 사용자 정보를 가져올 수 없습니다.");
        }
    }

    /**
     * 네이버 사용자 정보
     */
    private record NaverUserInfo(String id, String nickname, String email) {
    }
}
