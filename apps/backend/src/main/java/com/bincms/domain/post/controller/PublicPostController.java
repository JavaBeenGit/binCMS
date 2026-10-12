package com.bincms.domain.post.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.dto.PageResponse;
import com.bincms.domain.board.entity.Board;
import com.bincms.domain.board.repository.BoardRepository;
import com.bincms.domain.post.dto.PostResponse;
import com.bincms.domain.post.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자 화면용 게시글 Public API
 * - 인증 불필요
 * - boardCode 기반 조회
 */
@RestController
@RequestMapping("/api/v1/public/posts")
@RequiredArgsConstructor
public class PublicPostController {

    private final PostService postService;
    private final BoardRepository boardRepository;

    /**
     * 게시판 코드로 게시글 목록 조회
     */
    @GetMapping("/board/{boardCode}")
    public ResponseEntity<ApiResponse<PageResponse<PostResponse>>> getPostsByBoardCode(
            @PathVariable String boardCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Board board = boardRepository.findByBoardCode(boardCode)
                .orElseThrow(() -> new RuntimeException("게시판을 찾을 수 없습니다: " + boardCode));

        Pageable pageable = PageRequest.of(page, size);
        PageResponse<PostResponse> result = postService.getPostsByBoard(board.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 게시글 상세 조회 (조회수 증가)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(@PathVariable Long id) {
        PostResponse post = postService.getPostById(id);
        return ResponseEntity.ok(ApiResponse.success(post));
    }
}
