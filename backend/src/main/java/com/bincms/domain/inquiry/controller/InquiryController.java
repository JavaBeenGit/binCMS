package com.bincms.domain.inquiry.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.dto.PageResponse;
import com.bincms.domain.inquiry.dto.InquiryResponse;
import com.bincms.domain.inquiry.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    /**
     * 견적문의 목록 조회 (관리자)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<InquiryResponse>>> getInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        PageResponse<InquiryResponse> response;
        if (status != null && !status.isEmpty()) {
            response = inquiryService.getInquiriesByStatus(status, page, size);
        } else {
            response = inquiryService.getInquiries(page, size);
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 견적문의 상세 조회 (관리자)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InquiryResponse>> getInquiry(@PathVariable Long id) {
        InquiryResponse response = inquiryService.getInquiry(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 견적문의 상태 변경 (관리자)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<InquiryResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        InquiryResponse response = inquiryService.updateStatus(id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 견적문의 메모 수정 (관리자)
     */
    @PatchMapping("/{id}/memo")
    public ResponseEntity<ApiResponse<InquiryResponse>> updateMemo(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        InquiryResponse response = inquiryService.updateMemo(id, body.get("memo"));
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
