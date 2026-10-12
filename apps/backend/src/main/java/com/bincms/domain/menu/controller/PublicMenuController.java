package com.bincms.domain.menu.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.menu.dto.MenuResponse;
import com.bincms.domain.menu.entity.MenuType;
import com.bincms.domain.menu.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 홈페이지 상단 메뉴 API — 사용자 헤더가 읽는다 (2026-10-13 홈페이지 메뉴 연동).
 * 비로그인 방문자의 헤더도 그려야 하므로 공개 접두어(/api/v1/public)다.
 * 켜진(use_yn=Y) 사용자 메뉴만 트리로 내려가며, 부모가 꺼지면 자식도 함께 빠진다.
 * 프론트는 이 API 가 실패하면 코드에 둔 기본 메뉴로 대신 그린다(메뉴 장애가 사이트를 못 죽이게).
 */
@RestController
@RequestMapping("/api/v1/public/menus")
@RequiredArgsConstructor
public class PublicMenuController {

    private final MenuService menuService;

    @GetMapping
    public ApiResponse<List<MenuResponse>> siteMenus() {
        return ApiResponse.success(menuService.getMenusByType(MenuType.USER, false));
    }
}
