package com.bincms.domain.role.dto;

import com.bincms.domain.role.entity.Permission;
import lombok.Builder;
import lombok.Getter;

/**
 * 권한 응답 DTO
 */
@Getter
@Builder
public class PermissionResponse {
    
    private Long id;
    private String permCode;
    private String permName;
    private String permGroup;
    private String description;
    private Integer sortOrder;
    private String useYn;
    
    public static PermissionResponse from(Permission permission) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .permCode(permission.getPermCode())
                .permName(permission.getPermName())
                .permGroup(permission.getPermGroup())
                .description(permission.getDescription())
                .sortOrder(permission.getSortOrder())
                .useYn(permission.getUseYn())
                .build();
    }
}
