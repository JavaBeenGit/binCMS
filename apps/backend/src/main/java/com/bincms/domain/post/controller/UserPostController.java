package com.bincms.domain.post.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.common.security.JwtTokenProvider;
import com.bincms.domain.post.dto.PostResponse;
import com.bincms.domain.post.dto.PostUpdateRequest;
import com.bincms.domain.post.dto.UserPostCreateRequest;
import com.bincms.domain.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자용 게시글 API 컨트롤러
 * - JWT 인증 필요
 * - 본인 글만 수정/삭제 가능
 */
@RestController
@RequestMapping("/api/v1/user/posts")
@RequiredArgsConstructor
public class UserPostController {
    
    private final PostService postService;
    private final JwtTokenProvider jwtTokenProvider;
    
    /**
     * 게시글 작성
     */
    @PostMapping("/{boardCode}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostResponse> createPost(
            @PathVariable String boardCode,
            @Valid @RequestBody UserPostCreateRequest request,
            @RequestHeader("Authorization") String authorization) {
        String loginId = extractLoginId(authorization);
        PostResponse response = postService.createUserPost(loginId, boardCode, request);
        return ApiResponse.success(response, "게시글이 등록되었습니다");
    }
    
    /**
     * 게시글 수정
     */
    @PutMapping("/{id}")
    public ApiResponse<PostResponse> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostUpdateRequest request,
            @RequestHeader("Authorization") String authorization) {
        String loginId = extractLoginId(authorization);
        PostResponse response = postService.updateUserPost(loginId, id, request);
        return ApiResponse.success(response, "게시글이 수정되었습니다");
    }
    
    /**
     * 게시글 삭제
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePost(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorization) {
        String loginId = extractLoginId(authorization);
        postService.deleteUserPost(loginId, id);
        return ApiResponse.success(null, "게시글이 삭제되었습니다");
    }
    
    /**
     * Authorization 헤더에서 loginId 추출
     */
    private String extractLoginId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "로그인이 필요합니다");
        }
        String token = authorization.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "유효하지 않은 토큰입니다");
        }
        return jwtTokenProvider.getEmailFromToken(token);
    }
}
