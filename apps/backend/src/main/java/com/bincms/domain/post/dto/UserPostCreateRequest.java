package com.bincms.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 게시글 생성 요청 DTO (boardCode는 PathVariable로 받으므로 boardId 불필요)
 */
@Getter
@NoArgsConstructor
public class UserPostCreateRequest {
    
    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자 이하여야 합니다")
    private String title;
    
    @NotBlank(message = "내용은 필수입니다")
    private String content;
}
