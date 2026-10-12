package com.bincms.domain.post.repository;

import com.bincms.domain.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 게시글 Repository
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    /**
     * 게시판별 게시글 목록 조회 (페이징)
     */
    Page<Post> findByBoardIdAndUseYnOrderByNoticeYnDescIdDesc(Long boardId, String useYn, Pageable pageable);
    
    /**
     * 게시판별 공지글 목록 조회
     */
    List<Post> findByBoardIdAndNoticeYnAndUseYnOrderByIdDesc(Long boardId, String noticeYn, String useYn);
    
    /**
     * 전체 게시글 목록 조회 (페이징)
     */
    Page<Post> findByUseYnOrderByIdDesc(String useYn, Pageable pageable);
    
    /**
     * 게시판별 게시글 검색 (제목+내용)
     */
    @Query("SELECT p FROM Post p WHERE p.board.id = :boardId AND p.useYn = :useYn " +
           "AND (p.title LIKE %:keyword% OR p.content LIKE %:keyword%) " +
           "ORDER BY p.noticeYn DESC, p.id DESC")
    Page<Post> searchByBoardIdAndKeyword(@Param("boardId") Long boardId, 
                                         @Param("useYn") String useYn,
                                         @Param("keyword") String keyword, 
                                         Pageable pageable);
}
