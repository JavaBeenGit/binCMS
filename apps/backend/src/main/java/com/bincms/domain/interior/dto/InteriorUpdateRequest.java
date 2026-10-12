package com.bincms.domain.interior.dto;

import com.bincms.domain.interior.entity.InteriorCategory;
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
    
    /** 선택: 주면 카테고리를 바꾼다(블로그 이관 도구의 재실행 매핑 변경용). 생략하면 유지. */
    private InteriorCategory category;
}
