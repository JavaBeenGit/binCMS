package com.bincms.domain.role.dto;

import com.bincms.domain.role.entity.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 역할 응답 DTO
 */
@Getter
@Builder
public class RoleResponse {
    
    private Long id;
    private String roleCode;
    private String roleName;
    private String description;
    private Integer sortOrder;
    private String useYn;
    private List<String> permissions;
    private LocalDateTime regDt;
    private LocalDateTime modDt;
    
    public static RoleResponse from(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .roleCode(role.getRoleCode())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .sortOrder(role.getSortOrder())
                .useYn(role.getUseYn())
                .regDt(role.getRegDt())
                .modDt(role.getModDt())
                .build();
    }
    
    public static RoleResponse from(Role role, List<String> permissions) {
        return RoleResponse.builder()
                .id(role.getId())
                .roleCode(role.getRoleCode())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .sortOrder(role.getSortOrder())
                .useYn(role.getUseYn())
                .permissions(permissions)
                .regDt(role.getRegDt())
                .modDt(role.getModDt())
                .build();
    }
}
