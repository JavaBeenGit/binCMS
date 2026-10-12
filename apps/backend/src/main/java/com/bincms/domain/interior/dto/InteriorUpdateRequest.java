package com.bincms.domain.interior.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 인테리어 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class InteriorUpdateRequest {
    
    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자 이하여야 합니다")
    private String title;
    
    @NotBlank(message = "내용은 필수입니다")
    private String content;
    
    private String thumbnailUrl;
    
    private Integer sortOrder;
}
