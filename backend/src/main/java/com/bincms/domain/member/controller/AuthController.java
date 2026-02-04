package com.bincms.domain.member.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.member.dto.LoginRequest;
import com.bincms.domain.member.dto.LoginResponse;
import com.bincms.domain.member.dto.MemberResponse;
import com.bincms.domain.member.dto.SignupRequest;
import com.bincms.domain.member.service.MemberService;
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
}
