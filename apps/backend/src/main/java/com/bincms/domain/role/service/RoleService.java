package com.bincms.domain.role.service;

import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.role.dto.*;
import com.bincms.domain.role.entity.Permission;
import com.bincms.domain.role.entity.Role;
import com.bincms.domain.role.entity.RolePermission;
import com.bincms.domain.role.repository.PermissionRepository;
import com.bincms.domain.role.repository.RolePermissionRepository;
import com.bincms.domain.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 역할/권한 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {
    
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    
    // ==================== 역할 ====================
    
    /**
     * 전체 역할 목록 조회
     */
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(role -> {
                    List<String> permCodes = rolePermissionRepository.findPermCodesByRoleCode(role.getRoleCode());
                    return RoleResponse.from(role, permCodes);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 사용 중인 역할 목록 조회
     */
    public List<RoleResponse> getActiveRoles() {
        return roleRepository.findAllActive().stream()
                .map(RoleResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 관리자 역할 목록 조회 (USER 제외)
     */
    public List<RoleResponse> getAdminRoles() {
        return roleRepository.findAdminRoles().stream()
                .map(RoleResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 역할 상세 조회
     */
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "역할을 찾을 수 없습니다"));
        List<String> permCodes = rolePermissionRepository.findPermCodesByRoleCode(role.getRoleCode());
        return RoleResponse.from(role, permCodes);
    }
    
    /**
     * 역할 코드로 조회
     */
    public Role getRoleByCode(String roleCode) {
        return roleRepository.findByRoleCode(roleCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "역할을 찾을 수 없습니다: " + roleCode));
    }
    
    /**
     * 역할 생성
     */
    @Transactional
    public RoleResponse createRole(RoleCreateRequest request) {
        if (roleRepository.existsByRoleCode(request.getRoleCode())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 존재하는 역할 코드입니다");
        }
        
        Role role = Role.builder()
                .roleCode(request.getRoleCode())
                .roleName(request.getRoleName())
                .description(request.getDescription())
                .sortOrder(request.getSortOrder())
                .build();
        
        Role savedRole = roleRepository.save(role);
        
        // 권한 매핑
        if (request.getPermissionCodes() != null && !request.getPermissionCodes().isEmpty()) {
            assignPermissionsToRole(savedRole, request.getPermissionCodes());
        }
        
        List<String> permCodes = rolePermissionRepository.findPermCodesByRoleCode(savedRole.getRoleCode());
        return RoleResponse.from(savedRole, permCodes);
    }
    
    /**
     * 역할 수정
     */
    @Transactional
    public RoleResponse updateRole(Long id, RoleUpdateRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "역할을 찾을 수 없습니다"));
        
        role.update(request.getRoleName(), request.getDescription(), request.getSortOrder());
        
        // 권한 재매핑
        if (request.getPermissionCodes() != null) {
            role.clearPermissions();
            rolePermissionRepository.deleteByRoleId(role.getId());
            if (!request.getPermissionCodes().isEmpty()) {
                assignPermissionsToRole(role, request.getPermissionCodes());
            }
        }
        
        List<String> permCodes = rolePermissionRepository.findPermCodesByRoleCode(role.getRoleCode());
        return RoleResponse.from(role, permCodes);
    }
    
    /**
     * 역할에 권한 매핑
     */
    private void assignPermissionsToRole(Role role, List<String> permissionCodes) {
        for (String permCode : permissionCodes) {
            Permission permission = permissionRepository.findByPermCode(permCode)
                    .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, 
                            "권한을 찾을 수 없습니다: " + permCode));
            
            RolePermission rolePermission = RolePermission.builder()
                    .role(role)
                    .permission(permission)
                    .build();
            
            role.addPermission(rolePermission);
            rolePermissionRepository.save(rolePermission);
        }
    }
    
    // ==================== 권한 ====================
    
    /**
     * 전체 권한 목록 조회
     */
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAllActive().stream()
                .map(PermissionResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 역할 삭제 (기본 역할은 삭제 불가)
     */
    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "역할을 찾을 수 없습니다"));
        if (List.of("USER", "SYSTEM_ADMIN").contains(role.getRoleCode())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "기본 역할은 삭제할 수 없습니다");
        }
        rolePermissionRepository.deleteByRoleId(id);
        roleRepository.delete(role);
    }
    
    /**
     * 역할 활성화
     */
    @Transactional
    public RoleResponse activateRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "역할을 찾을 수 없습니다"));
        role.activate();
        return RoleResponse.from(role);
    }
    
    /**
     * 역할 비활성화 (기본 역할은 비활성화 불가)
     */
    @Transactional
    public RoleResponse deactivateRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "역할을 찾을 수 없습니다"));
        if (List.of("USER", "SYSTEM_ADMIN").contains(role.getRoleCode())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "기본 역할은 비활성화할 수 없습니다");
        }
        role.deactivate();
        return RoleResponse.from(role);
    }
    
    /**
     * 역할 코드별 권한 코드 목록 조회
     */
    public List<String> getPermissionsByRoleCode(String roleCode) {
        return rolePermissionRepository.findPermCodesByRoleCode(roleCode);
    }
}
