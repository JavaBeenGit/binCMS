package com.bincms.domain.board.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 게시판 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class BoardUpdateRequest {
    
    @NotBlank(message = "게시판 이름은 필수입니다")
    @Size(max = 100, message = "게시판 이름은 100자 이하여야 합니다")
    private String boardName;
    
    @Size(max = 500, message = "게시판 설명은 500자 이하여야 합니다")
    private String description;
    
    private Integer sortOrder;
}
