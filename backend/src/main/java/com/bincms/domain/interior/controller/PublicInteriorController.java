package com.bincms.domain.interior.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.dto.PageResponse;
import com.bincms.domain.interior.dto.InteriorResponse;
import com.bincms.domain.interior.entity.InteriorCategory;
import com.bincms.domain.interior.service.InteriorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자 화면용 인테리어 Public API
 * - 인증 불필요
 */
@RestController
@RequestMapping("/api/v1/public/interiors")
@RequiredArgsConstructor
public class PublicInteriorController {

    private final InteriorService interiorService;

    /**
     * 카테고리별 인테리어 목록 조회
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<PageResponse<InteriorResponse>>> getByCategory(
            @PathVariable InteriorCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PageResponse<InteriorResponse> result = interiorService.getByCategory(category, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 인테리어 상세 조회 (조회수 증가)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InteriorResponse>> getById(@PathVariable Long id) {
        InteriorResponse interior = interiorService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(interior));
    }
}
