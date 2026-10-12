package com.bincms.domain.member.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.common.security.JwtTokenProvider;
import com.bincms.domain.member.dto.LoginRequest;
import com.bincms.domain.member.dto.LoginResponse;
import com.bincms.domain.member.dto.MemberResponse;
import com.bincms.domain.member.dto.SignupRequest;
import com.bincms.domain.member.dto.WithdrawRequest;
import com.bincms.domain.member.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 API 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final MemberService memberService;
    private final JwtTokenProvider jwtTokenProvider;
    
    /**
     * 회원가입
     */
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MemberResponse> signup(@Valid @RequestBody SignupRequest request) {
        MemberResponse response = memberService.signup(request);
        return ApiResponse.success(response, "회원가입이 완료되었습니다");
    }
    
    /**
     * 로그인
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = memberService.login(request);
        return ApiResponse.success(response, "로그인에 성공했습니다");
    }
    
    /**
     * 회원탈퇴
     */
    @PostMapping("/withdraw")
    public ApiResponse<Void> withdraw(@RequestBody WithdrawRequest request,
                                       HttpServletRequest httpRequest) {
        String loginId = extractLoginIdFromToken(httpRequest);
        memberService.withdrawMember(loginId, request);
        return ApiResponse.success(null, "회원탈퇴가 완료되었습니다");
    }
    
    /**
     * Authorization 헤더에서 JWT 토큰을 추출하여 loginId를 반환
     */
    private String extractLoginIdFromToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "로그인이 필요합니다");
        }
        String token = bearerToken.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "유효하지 않은 토큰입니다");
        }
        return jwtTokenProvider.getEmailFromToken(token);
    }
}
