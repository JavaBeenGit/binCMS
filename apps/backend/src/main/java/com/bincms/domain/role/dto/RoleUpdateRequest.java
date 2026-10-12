package com.bincms.domain.role.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 역할 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class RoleUpdateRequest {
    
    @NotBlank(message = "역할명은 필수입니다")
    @Size(max = 50, message = "역할명은 50자 이하여야 합니다")
    private String roleName;
    
    @Size(max = 200, message = "설명은 200자 이하여야 합니다")
    private String description;
    
    private Integer sortOrder;
    
    /**
     * 권한 코드 목록
     */
    private List<String> permissionCodes;
}
