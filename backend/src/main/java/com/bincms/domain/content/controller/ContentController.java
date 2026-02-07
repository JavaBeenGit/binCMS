package com.bincms.domain.content.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.dto.PageResponse;
import com.bincms.domain.content.dto.ContentResponse;
import com.bincms.domain.content.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

/**
 * 컨텐츠 공개 API (사용자용)
 */
@RestController
@RequestMapping("/api/v1/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    /**
     * 활성 컨텐츠 목록 조회
     */
    @GetMapping
    public ApiResponse<PageResponse<ContentResponse>> getActiveContents(
            @PageableDefault(size = 20, sort = "sortOrder", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.success(contentService.getActiveContents(pageable));
    }

    /**
     * 카테고리별 컨텐츠 조회
     */
    @GetMapping("/category/{category}")
    public ApiResponse<PageResponse<ContentResponse>> getContentsByCategory(
            @PathVariable String category,
            @PageableDefault(size = 20, sort = "sortOrder", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.success(contentService.getContentsByCategory(category, pageable));
    }

    /**
     * 컨텐츠 키로 조회 (프론트엔드 표시용)
     */
    @GetMapping("/key/{contentKey}")
    public ApiResponse<ContentResponse> getContentByKey(@PathVariable String contentKey) {
        return ApiResponse.success(contentService.getContentByKey(contentKey));
    }
}
