package com.bincms.domain.comment.repository;

import com.bincms.domain.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 댓글 리포지토리
 */
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * 게시글의 최상위 댓글 목록 조회 (부모가 없는 댓글)
     */
    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId AND c.parent IS NULL AND c.useYn = 'Y' ORDER BY c.id ASC")
    List<Comment> findRootCommentsByPostId(@Param("postId") Long postId);

    /**
     * 부모 댓글의 대댓글 목록 조회
     */
    @Query("SELECT c FROM Comment c WHERE c.parent.id = :parentId AND c.useYn = 'Y' ORDER BY c.id ASC")
    List<Comment> findRepliesByParentId(@Param("parentId") Long parentId);

    /**
     * 게시글의 전체 댓글 수
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post.id = :postId AND c.useYn = 'Y'")
    long countByPostId(@Param("postId") Long postId);
}
