package com.bincms.domain.inquiry.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.inquiry.dto.InquiryCreateRequest;
import com.bincms.domain.inquiry.dto.InquiryResponse;
import com.bincms.domain.inquiry.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/inquiries")
@RequiredArgsConstructor
public class PublicInquiryController {

    private final InquiryService inquiryService;

    /**
     * 견적문의 등록 (비로그인 사용자 가능)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<InquiryResponse>> createInquiry(
            @Valid @RequestBody InquiryCreateRequest request) {
        InquiryResponse response = inquiryService.createInquiry(request);
        return ResponseEntity.ok(ApiResponse.success(response, "견적문의가 접수되었습니다."));
    }
}
