package com.bincms.domain.board.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 게시판 생성 요청 DTO
 */
@Getter
@NoArgsConstructor
public class BoardCreateRequest {
    
    @NotBlank(message = "게시판 코드는 필수입니다")
    @Pattern(regexp = "^[a-z0-9_]+$", message = "게시판 코드는 영문 소문자, 숫자, 언더스코어만 사용 가능합니다")
    @Size(max = 50, message = "게시판 코드는 50자 이하여야 합니다")
    private String boardCode;
    
    @NotBlank(message = "게시판 이름은 필수입니다")
    @Size(max = 100, message = "게시판 이름은 100자 이하여야 합니다")
    private String boardName;
    
    @Size(max = 500, message = "게시판 설명은 500자 이하여야 합니다")
    private String description;
    
    private Integer sortOrder;
}
