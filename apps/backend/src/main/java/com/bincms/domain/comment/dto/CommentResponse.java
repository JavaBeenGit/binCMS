package com.bincms.domain.comment.dto;

import com.bincms.domain.comment.entity.Comment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 댓글 응답 DTO
 */
@Getter
@Builder
public class CommentResponse {

    private Long id;
    private Long postId;
    private Long parentId;
    private String authorName;
    private String content;
    private LocalDateTime regDt;
    private LocalDateTime modDt;
    private List<CommentResponse> replies;

    public static CommentResponse from(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .authorName(comment.getAuthorName())
                .content(comment.getContent())
                .regDt(comment.getRegDt())
                .modDt(comment.getModDt())
                .build();
    }

    public static CommentResponse from(Comment comment, List<CommentResponse> replies) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .authorName(comment.getAuthorName())
                .content(comment.getContent())
                .regDt(comment.getRegDt())
                .modDt(comment.getModDt())
                .replies(replies)
                .build();
    }
}
