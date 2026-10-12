package com.bincms.domain.menu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MenuUpdateRequest {
    
    @NotBlank(message = "메뉴명은 필수입니다.")
    @Size(max = 100, message = "메뉴명은 100자 이내로 입력해주세요.")
    private String menuName;
    
    @Size(max = 200, message = "메뉴 URL은 200자 이내로 입력해주세요.")
    private String menuUrl;
    
    private Integer sortOrder;
    
    @Size(max = 50, message = "아이콘은 50자 이내로 입력해주세요.")
    private String icon;
    
    @Size(max = 500, message = "설명은 500자 이내로 입력해주세요.")
    private String description;
}
