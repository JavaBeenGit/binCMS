package com.bincms.domain.board.service;

import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.board.dto.BoardCreateRequest;
import com.bincms.domain.board.dto.BoardResponse;
import com.bincms.domain.board.dto.BoardUpdateRequest;
import com.bincms.domain.board.entity.Board;
import com.bincms.domain.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 게시판 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {
    
    private final BoardRepository boardRepository;
    
    /**
     * 게시판 생성
     */
    @Transactional
    public BoardResponse createBoard(BoardCreateRequest request) {
        // 게시판 코드 중복 체크
        if (boardRepository.existsByBoardCode(request.getBoardCode())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 존재하는 게시판 코드입니다");
        }
        
        Board board = Board.builder()
                .boardCode(request.getBoardCode())
                .boardName(request.getBoardName())
                .description(request.getDescription())
                .sortOrder(request.getSortOrder())
                .build();
        
        Board savedBoard = boardRepository.save(board);
        return BoardResponse.from(savedBoard);
    }
    
    /**
     * 게시판 목록 조회
     */
    public List<BoardResponse> getAllBoards() {
        return boardRepository.findAllByOrderBySortOrder().stream()
                .map(BoardResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 사용 중인 게시판 목록 조회
     */
    public List<BoardResponse> getActiveBoards() {
        return boardRepository.findByUseYnOrderBySortOrder("Y").stream()
                .map(BoardResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 게시판 상세 조회 (ID)
     */
    public BoardResponse getBoardById(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시판을 찾을 수 없습니다"));
        return BoardResponse.from(board);
    }
    
    /**
     * 게시판 상세 조회 (코드)
     */
    public BoardResponse getBoardByCode(String boardCode) {
        Board board = boardRepository.findByBoardCode(boardCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시판을 찾을 수 없습니다"));
        return BoardResponse.from(board);
    }
    
    /**
     * 게시판 수정
     */
    @Transactional
    public BoardResponse updateBoard(Long id, BoardUpdateRequest request) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시판을 찾을 수 없습니다"));
        
        board.update(request.getBoardName(), request.getDescription(), request.getSortOrder());
        return BoardResponse.from(board);
    }
    
    /**
     * 게시판 삭제 (비활성화)
     */
    @Transactional
    public void deleteBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시판을 찾을 수 없습니다"));
        
        board.deactivate();
    }
    
    /**
     * 게시판 활성화
     */
    @Transactional
    public void activateBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, "게시판을 찾을 수 없습니다"));
        
        board.activate();
    }
}
