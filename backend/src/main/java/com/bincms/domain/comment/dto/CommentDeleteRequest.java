package com.bincms.domain.comment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * 댓글 삭제 요청 DTO
 */
@Getter
@Setter
public class CommentDeleteRequest {

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}
