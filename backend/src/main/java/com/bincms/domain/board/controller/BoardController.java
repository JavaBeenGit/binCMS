package com.bincms.domain.board.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.board.dto.BoardCreateRequest;
import com.bincms.domain.board.dto.BoardResponse;
import com.bincms.domain.board.dto.BoardUpdateRequest;
import com.bincms.domain.board.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 게시판 API 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
public class BoardController {
    
    private final BoardService boardService;
    
    /**
     * 게시판 생성
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BoardResponse> createBoard(@Valid @RequestBody BoardCreateRequest request) {
        BoardResponse response = boardService.createBoard(request);
        return ApiResponse.success(response, "게시판이 생성되었습니다");
    }
    
    /**
     * 전체 게시판 목록 조회
     */
    @GetMapping
    public ApiResponse<List<BoardResponse>> getAllBoards() {
        List<BoardResponse> boards = boardService.getAllBoards();
        return ApiResponse.success(boards);
    }
    
    /**
     * 사용 중인 게시판 목록 조회
     */
    @GetMapping("/active")
    public ApiResponse<List<BoardResponse>> getActiveBoards() {
        List<BoardResponse> boards = boardService.getActiveBoards();
        return ApiResponse.success(boards);
    }
    
    /**
     * 게시판 상세 조회 (ID)
     */
    @GetMapping("/{id}")
    public ApiResponse<BoardResponse> getBoardById(@PathVariable Long id) {
        BoardResponse board = boardService.getBoardById(id);
        return ApiResponse.success(board);
    }
    
    /**
     * 게시판 상세 조회 (코드)
     */
    @GetMapping("/code/{boardCode}")
    public ApiResponse<BoardResponse> getBoardByCode(@PathVariable String boardCode) {
        BoardResponse board = boardService.getBoardByCode(boardCode);
        return ApiResponse.success(board);
    }
    
    /**
     * 게시판 수정
     */
    @PutMapping("/{id}")
    public ApiResponse<BoardResponse> updateBoard(
            @PathVariable Long id,
            @Valid @RequestBody BoardUpdateRequest request) {
        BoardResponse response = boardService.updateBoard(id, request);
        return ApiResponse.success(response, "게시판이 수정되었습니다");
    }
    
    /**
     * 게시판 삭제 (비활성화)
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ApiResponse.success(null, "게시판이 비활성화되었습니다");
    }
    
    /**
     * 게시판 활성화
     */
    @PatchMapping("/{id}/activate")
    public ApiResponse<Void> activateBoard(@PathVariable Long id) {
        boardService.activateBoard(id);
        return ApiResponse.success(null, "게시판이 활성화되었습니다");
    }
}
