package com.bincms.domain.post.entity;

import com.bincms.common.entity.BaseEntity;
import com.bincms.domain.board.entity.Board;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 게시글 엔티티
 */
@Entity
@Table(name = "TB_POSTS", indexes = {
    @Index(name = "IDX_POSTS_BOARD_ID", columnList = "BOARD_ID"),
    @Index(name = "IDX_POSTS_NOTICE_YN", columnList = "NOTICE_YN")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 게시판 FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BOARD_ID", nullable = false)
    private Board board;
    
    /**
     * 제목
     */
    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;
    
    /**
     * 내용
     */
    @Column(name = "CONTENT", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    /**
     * 조회수
     */
    @Column(name = "VIEW_COUNT", nullable = false)
    private Long viewCount;
    
    /**
     * 공지글 여부
     */
    @Column(name = "NOTICE_YN", nullable = false, length = 1)
    private String noticeYn;
    
    /**
     * 사용 여부
     */
    @Column(name = "USE_YN", nullable = false, length = 1)
    private String useYn;
    
    @Builder
    public Post(Board board, String title, String content, String noticeYn) {
        this.board = board;
        this.title = title;
        this.content = content;
        this.viewCount = 0L;
        this.noticeYn = noticeYn != null ? noticeYn : "N";
        this.useYn = "Y";
    }
    
    /**
     * 게시글 수정
     */
    public void update(String title, String content, String noticeYn) {
        this.title = title;
        this.content = content;
        this.noticeYn = noticeYn;
    }
    
    /**
     * 조회수 증가
     */
    public void increaseViewCount() {
        this.viewCount++;
    }
    
    /**
     * 게시글 비활성화
     */
    public void deactivate() {
        this.useYn = "N";
    }
    
    /**
     * 게시글 활성화
     */
    public void activate() {
        this.useYn = "Y";
    }
}
