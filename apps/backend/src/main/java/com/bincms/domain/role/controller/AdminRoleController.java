package com.bincms.domain.role.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.role.dto.*;
import com.bincms.domain.role.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 역할 관리 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/admin/roles")
@RequiredArgsConstructor
public class AdminRoleController {
    
    private final RoleService roleService;
    
    /**
     * 전체 역할 목록 조회
     */
    @GetMapping
    public ApiResponse<List<RoleResponse>> getAllRoles() {
        return ApiResponse.success(roleService.getAllRoles());
    }
    
    /**
     * 관리자 역할 목록 조회 (USER 제외, 셀렉트박스용)
     */
    @GetMapping("/admin")
    public ApiResponse<List<RoleResponse>> getAdminRoles() {
        return ApiResponse.success(roleService.getAdminRoles());
    }
    
    /**
     * 역할 상세 조회
     */
    @GetMapping("/{id}")
    public ApiResponse<RoleResponse> getRole(@PathVariable Long id) {
        return ApiResponse.success(roleService.getRoleById(id));
    }
    
    /**
     * 역할 생성
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RoleResponse> createRole(@Valid @RequestBody RoleCreateRequest request) {
        RoleResponse response = roleService.createRole(request);
        return ApiResponse.success(response, "역할이 생성되었습니다.");
    }
    
    /**
     * 역할 수정
     */
    @PutMapping("/{id}")
    public ApiResponse<RoleResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {
        RoleResponse response = roleService.updateRole(id, request);
        return ApiResponse.success(response, "역할이 수정되었습니다.");
    }
    
    /**
     * 전체 권한 목록 조회
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ApiResponse.success(null, "역할이 삭제되었습니다.");
    }
    
    @PatchMapping("/{id}/activate")
    public ApiResponse<RoleResponse> activateRole(@PathVariable Long id) {
        return ApiResponse.success(roleService.activateRole(id), "역할이 활성화되었습니다.");
    }
    
    @PatchMapping("/{id}/deactivate")
    public ApiResponse<RoleResponse> deactivateRole(@PathVariable Long id) {
        return ApiResponse.success(roleService.deactivateRole(id), "역할이 비활성화되었습니다.");
    }
    
    @GetMapping("/permissions")
    public ApiResponse<List<PermissionResponse>> getAllPermissions() {
        return ApiResponse.success(roleService.getAllPermissions());
    }
}
