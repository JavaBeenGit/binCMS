package com.bincms.domain.email.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.email.dto.EmailSendRequest;
import com.bincms.domain.email.dto.EmailVerifyRequest;
import com.bincms.domain.email.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 이메일 인증 API 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/public/email")
@RequiredArgsConstructor
public class EmailAuthController {

    private final EmailService emailService;

    /**
     * 인증 코드 발송
     */
    @PostMapping("/send-code")
    public ApiResponse<Map<String, String>> sendVerificationCode(
            @Valid @RequestBody EmailSendRequest request) {
        emailService.sendVerificationCode(request.getEmail());
        return ApiResponse.success(
                Map.of("email", request.getEmail()),
                "인증 코드가 발송되었습니다. 이메일을 확인해주세요.");
    }

    /**
     * 인증 코드 검증
     */
    @PostMapping("/verify-code")
    public ApiResponse<Map<String, Object>> verifyCode(
            @Valid @RequestBody EmailVerifyRequest request) {
        boolean verified = emailService.verifyCode(request.getEmail(), request.getCode());
        return ApiResponse.success(
                Map.of("email", request.getEmail(), "verified", verified),
                "이메일 인증이 완료되었습니다.");
    }
}
