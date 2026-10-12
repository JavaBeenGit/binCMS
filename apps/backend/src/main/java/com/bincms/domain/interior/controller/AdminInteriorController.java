package com.bincms.domain.interior.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.dto.PageResponse;
import com.bincms.domain.interior.dto.InteriorCreateRequest;
import com.bincms.domain.interior.dto.InteriorResponse;
import com.bincms.domain.interior.dto.InteriorUpdateRequest;
import com.bincms.domain.interior.entity.InteriorCategory;
import com.bincms.domain.interior.service.InteriorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * 인테리어 관리 API 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/admin/interiors")
@RequiredArgsConstructor
public class AdminInteriorController {
    
    private final InteriorService interiorService;
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<InteriorResponse> create(@Valid @RequestBody InteriorCreateRequest request) {
        InteriorResponse response = interiorService.create(request);
        return ApiResponse.success(response, "인테리어가 등록되었습니다");
    }
    
    @GetMapping
    public ApiResponse<PageResponse<InteriorResponse>> getAll(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<InteriorResponse> list = interiorService.getAll(pageable);
        return ApiResponse.success(list);
    }
    
    @GetMapping("/category/{category}")
    public ApiResponse<PageResponse<InteriorResponse>> getByCategory(
            @PathVariable InteriorCategory category,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<InteriorResponse> list = interiorService.getByCategory(category, pageable);
        return ApiResponse.success(list);
    }
    
    @GetMapping("/search")
    public ApiResponse<PageResponse<InteriorResponse>> search(
            @RequestParam(required = false) InteriorCategory category,
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<InteriorResponse> list = interiorService.search(category, keyword, pageable);
        return ApiResponse.success(list);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<InteriorResponse> getById(@PathVariable Long id) {
        InteriorResponse response = interiorService.getById(id);
        return ApiResponse.success(response);
    }
    
    @PutMapping("/{id}")
    public ApiResponse<InteriorResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody InteriorUpdateRequest request) {
        InteriorResponse response = interiorService.update(id, request);
        return ApiResponse.success(response, "인테리어가 수정되었습니다");
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        interiorService.delete(id);
        return ApiResponse.success(null, "인테리어가 삭제되었습니다");
    }
}
