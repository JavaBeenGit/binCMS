package com.bincms.domain.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ContentCreateRequest {

    @NotBlank(message = "컨텐츠 키는 필수입니다")
    @Size(max = 100, message = "컨텐츠 키는 100자 이하여야 합니다")
    private String contentKey;

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자 이하여야 합니다")
    private String title;

    private String content;

    @Size(max = 50, message = "카테고리는 50자 이하여야 합니다")
    private String category;

    @Size(max = 500, message = "설명은 500자 이하여야 합니다")
    private String description;

    private Integer sortOrder;
}
