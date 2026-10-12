package com.bincms.domain.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * 댓글 수정 요청 DTO
 */
@Getter
@Setter
public class CommentUpdateRequest {

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;

    @NotBlank(message = "댓글 내용은 필수입니다")
    @Size(max = 2000, message = "댓글 내용은 2000자 이내여야 합니다")
    private String content;
}
