package com.bincms.domain.content.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.dto.PageResponse;
import com.bincms.domain.content.dto.ContentCreateRequest;
import com.bincms.domain.content.dto.ContentResponse;
import com.bincms.domain.content.dto.ContentUpdateRequest;
import com.bincms.domain.content.service.ContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * 컨텐츠 관리 API (관리자)
 */
@RestController
@RequestMapping("/api/v1/admin/contents")
@RequiredArgsConstructor
public class AdminContentController {

    private final ContentService contentService;

    /**
     * 컨텐츠 목록 조회 (전체 - 관리자용)
     */
    @GetMapping
    public ApiResponse<PageResponse<ContentResponse>> getAllContents(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(contentService.getAllContents(pageable));
    }

    /**
     * 컨텐츠 검색
     */
    @GetMapping("/search")
    public ApiResponse<PageResponse<ContentResponse>> searchContents(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(contentService.searchContents(keyword, pageable));
    }

    /**
     * 컨텐츠 단건 조회
     */
    @GetMapping("/{id}")
    public ApiResponse<ContentResponse> getContentById(@PathVariable Long id) {
        return ApiResponse.success(contentService.getContentById(id));
    }

    /**
     * 컨텐츠 생성
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ContentResponse> createContent(@Valid @RequestBody ContentCreateRequest request) {
        ContentResponse response = contentService.createContent(request);
        return ApiResponse.success(response, "컨텐츠가 등록되었습니다");
    }

    /**
     * 컨텐츠 수정
     */
    @PutMapping("/{id}")
    public ApiResponse<ContentResponse> updateContent(
            @PathVariable Long id,
            @Valid @RequestBody ContentUpdateRequest request) {
        return ApiResponse.success(contentService.updateContent(id, request), "컨텐츠가 수정되었습니다");
    }

    /**
     * 컨텐츠 삭제 (소프트)
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteContent(@PathVariable Long id) {
        contentService.deleteContent(id);
        return ApiResponse.success(null, "컨텐츠가 삭제되었습니다");
    }

    /**
     * 컨텐츠 활성화
     */
    @PatchMapping("/{id}/activate")
    public ApiResponse<ContentResponse> activateContent(@PathVariable Long id) {
        return ApiResponse.success(contentService.activateContent(id), "컨텐츠가 활성화되었습니다");
    }

    /**
     * 컨텐츠 비활성화
     */
    @PatchMapping("/{id}/deactivate")
    public ApiResponse<ContentResponse> deactivateContent(@PathVariable Long id) {
        return ApiResponse.success(contentService.deactivateContent(id), "컨텐츠가 비활성화되었습니다");
    }
}
