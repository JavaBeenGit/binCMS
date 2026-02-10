package com.bincms.domain.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * 댓글 생성 요청 DTO
 */
@Getter
@Setter
public class CommentCreateRequest {

    private Long postId;

    /**
     * 부모 댓글 ID (대댓글인 경우)
     */
    private Long parentId;

    @NotBlank(message = "작성자 이름은 필수입니다")
    @Size(max = 50, message = "작성자 이름은 50자 이내여야 합니다")
    private String authorName;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 4, max = 20, message = "비밀번호는 4~20자여야 합니다")
    private String password;

    @NotBlank(message = "댓글 내용은 필수입니다")
    @Size(max = 2000, message = "댓글 내용은 2000자 이내여야 합니다")
    private String content;
}
