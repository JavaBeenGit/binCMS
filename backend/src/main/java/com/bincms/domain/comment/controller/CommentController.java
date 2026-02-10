package com.bincms.domain.comment.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.comment.dto.CommentResponse;
import com.bincms.domain.comment.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자용 댓글 API
 */
@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /**
     * 게시글의 댓글 목록 조회
     */
    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getCommentsByPostId(
            @PathVariable Long postId) {
        List<CommentResponse> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    /**
     * 관리자 댓글 삭제 (비밀번호 확인 없이)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        commentService.deleteCommentByAdmin(id);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
