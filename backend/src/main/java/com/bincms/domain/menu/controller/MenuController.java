package com.bincms.domain.menu.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.menu.dto.MenuCreateRequest;
import com.bincms.domain.menu.dto.MenuResponse;
import com.bincms.domain.menu.dto.MenuUpdateRequest;
import com.bincms.domain.menu.entity.MenuType;
import com.bincms.domain.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class MenuController {
    
    private final MenuService menuService;
    
    /**
     * 메뉴 생성
     */
    @PostMapping
    public ApiResponse<MenuResponse> createMenu(@Valid @RequestBody MenuCreateRequest request) {
        MenuResponse response = menuService.createMenu(request);
        return ApiResponse.success(response);
    }
    
    /**
     * 메뉴 타입별 계층 구조 조회
     */
    @GetMapping("/type/{menuType}")
    public ApiResponse<List<MenuResponse>> getMenusByType(
            @PathVariable MenuType menuType,
            @RequestParam(defaultValue = "false") boolean includeInactive) {
        List<MenuResponse> menus = menuService.getMenusByType(menuType, includeInactive);
        return ApiResponse.success(menus);
    }
    
    /**
     * 전체 메뉴 조회
     */
    @GetMapping
    public ApiResponse<List<MenuResponse>> getAllMenus() {
        List<MenuResponse> menus = menuService.getAllMenus();
        return ApiResponse.success(menus);
    }
    
    /**
     * 메뉴 상세 조회
     */
    @GetMapping("/{id}")
    public ApiResponse<MenuResponse> getMenuById(@PathVariable Long id) {
        MenuResponse menu = menuService.getMenuById(id);
        return ApiResponse.success(menu);
    }
    
    /**
     * 메뉴 수정
     */
    @PutMapping("/{id}")
    public ApiResponse<MenuResponse> updateMenu(
            @PathVariable Long id,
            @Valid @RequestBody MenuUpdateRequest request) {
        MenuResponse response = menuService.updateMenu(id, request);
        return ApiResponse.success(response);
    }
    
    /**
     * 메뉴 삭제 (비활성화)
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ApiResponse.success();
    }
    
    /**
     * 메뉴 활성화
     */
    @PatchMapping("/{id}/activate")
    public ApiResponse<Void> activateMenu(@PathVariable Long id) {
        menuService.activateMenu(id);
        return ApiResponse.success();
    }
}
