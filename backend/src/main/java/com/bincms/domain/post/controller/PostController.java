package com.bincms.domain.post.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.dto.PageResponse;
import com.bincms.domain.post.dto.PostCreateRequest;
import com.bincms.domain.post.dto.PostResponse;
import com.bincms.domain.post.dto.PostUpdateRequest;
import com.bincms.domain.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * 게시글 API 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {
    
    private final PostService postService;
    
    /**
     * 게시글 생성
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostResponse> createPost(@Valid @RequestBody PostCreateRequest request) {
        PostResponse response = postService.createPost(request);
        return ApiResponse.success(response, "게시글이 등록되었습니다");
    }
    
    /**
     * 게시판별 게시글 목록 조회
     */
    @GetMapping("/board/{boardId}")
    public ApiResponse<PageResponse<PostResponse>> getPostsByBoard(
            @PathVariable Long boardId,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<PostResponse> posts = postService.getPostsByBoard(boardId, pageable);
        return ApiResponse.success(posts);
    }
    
    /**
     * 전체 게시글 목록 조회
     */
    @GetMapping
    public ApiResponse<PageResponse<PostResponse>> getAllPosts(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<PostResponse> posts = postService.getAllPosts(pageable);
        return ApiResponse.success(posts);
    }
    
    /**
     * 게시글 검색
     */
    @GetMapping("/search")
    public ApiResponse<PageResponse<PostResponse>> searchPosts(
            @RequestParam Long boardId,
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<PostResponse> posts = postService.searchPosts(boardId, keyword, pageable);
        return ApiResponse.success(posts);
    }
    
    /**
     * 게시글 상세 조회
     */
    @GetMapping("/{id}")
    public ApiResponse<PostResponse> getPostById(@PathVariable Long id) {
        PostResponse post = postService.getPostById(id);
        return ApiResponse.success(post);
    }
    
    /**
     * 게시글 수정
     */
    @PutMapping("/{id}")
    public ApiResponse<PostResponse> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostUpdateRequest request) {
        PostResponse response = postService.updatePost(id, request);
        return ApiResponse.success(response, "게시글이 수정되었습니다");
    }
    
    /**
     * 게시글 삭제 (비활성화)
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ApiResponse.success(null, "게시글이 삭제되었습니다");
    }
}
