package com.bincms.domain.comment.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.comment.dto.CommentCreateRequest;
import com.bincms.domain.comment.dto.CommentDeleteRequest;
import com.bincms.domain.comment.dto.CommentResponse;
import com.bincms.domain.comment.dto.CommentUpdateRequest;
import com.bincms.domain.comment.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 사용자용 댓글 Public API (인증 불필요)
 */
@RestController
@RequestMapping("/api/v1/public/comments")
@RequiredArgsConstructor
public class PublicCommentController {

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
     * 게시글의 댓글 수 조회
     */
    @GetMapping("/post/{postId}/count")
    public ResponseEntity<ApiResponse<Long>> getCommentCount(@PathVariable Long postId) {
        long count = commentService.getCommentCount(postId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /**
     * 댓글 작성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @Valid @RequestBody CommentCreateRequest request) {
        CommentResponse response = commentService.createComment(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 댓글 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentUpdateRequest request) {
        CommentResponse response = commentService.updateComment(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 댓글 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentDeleteRequest request) {
        commentService.deleteComment(id, request);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
