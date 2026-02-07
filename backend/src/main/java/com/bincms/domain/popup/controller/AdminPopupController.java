package com.bincms.domain.popup.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.dto.PageResponse;
import com.bincms.domain.popup.dto.PopupCreateRequest;
import com.bincms.domain.popup.dto.PopupResponse;
import com.bincms.domain.popup.dto.PopupUpdateRequest;
import com.bincms.domain.popup.service.PopupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/popups")
@RequiredArgsConstructor
public class AdminPopupController {

    private final PopupService popupService;

    @GetMapping
    public ApiResponse<PageResponse<PopupResponse>> getAllPopups(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(popupService.getAllPopups(pageable));
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<PopupResponse>> searchPopups(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(popupService.searchPopups(keyword, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<PopupResponse> getPopupById(@PathVariable Long id) {
        return ApiResponse.success(popupService.getPopupById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PopupResponse> createPopup(@Valid @RequestBody PopupCreateRequest request) {
        PopupResponse response = popupService.createPopup(request);
        return ApiResponse.success(response, "팝업이 등록되었습니다");
    }

    @PutMapping("/{id}")
    public ApiResponse<PopupResponse> updatePopup(
            @PathVariable Long id,
            @Valid @RequestBody PopupUpdateRequest request) {
        return ApiResponse.success(popupService.updatePopup(id, request), "팝업이 수정되었습니다");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePopup(@PathVariable Long id) {
        popupService.deletePopup(id);
        return ApiResponse.success(null, "팝업이 삭제되었습니다");
    }

    @PatchMapping("/{id}/activate")
    public ApiResponse<PopupResponse> activatePopup(@PathVariable Long id) {
        return ApiResponse.success(popupService.activatePopup(id), "팝업이 활성화되었습니다");
    }

    @PatchMapping("/{id}/deactivate")
    public ApiResponse<PopupResponse> deactivatePopup(@PathVariable Long id) {
        return ApiResponse.success(popupService.deactivatePopup(id), "팝업이 비활성화되었습니다");
    }
}
