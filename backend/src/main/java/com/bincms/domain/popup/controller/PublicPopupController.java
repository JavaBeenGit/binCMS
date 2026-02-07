package com.bincms.domain.popup.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.popup.dto.PopupResponse;
import com.bincms.domain.popup.service.PopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/popups")
@RequiredArgsConstructor
public class PublicPopupController {

    private final PopupService popupService;

    /**
     * 현재 노출 대상인 활성 팝업 목록 조회 (인증 불필요)
     */
    @GetMapping("/active")
    public ApiResponse<List<PopupResponse>> getActivePopups() {
        return ApiResponse.success(popupService.getActivePopups());
    }
}
