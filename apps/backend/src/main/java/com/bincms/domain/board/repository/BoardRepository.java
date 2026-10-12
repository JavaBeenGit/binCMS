package com.bincms.domain.board.repository;

import com.bincms.domain.board.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 게시판 Repository
 */
@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    
    /**
     * 게시판 코드로 조회
     */
    Optional<Board> findByBoardCode(String boardCode);
    
    /**
     * 게시판 코드 존재 여부
     */
    boolean existsByBoardCode(String boardCode);
    
    /**
     * 사용 중인 게시판 목록 조회 (정렬 순서대로)
     */
    List<Board> findByUseYnOrderBySortOrder(String useYn);
    
    /**
     * 전체 게시판 목록 조회 (정렬 순서대로)
     */
    List<Board> findAllByOrderBySortOrder();
}
