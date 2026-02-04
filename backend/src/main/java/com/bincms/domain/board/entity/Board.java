package com.bincms.domain.board.entity;

import com.bincms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

/**
 * 게시판 엔티티
 */
@Entity
@Table(name = "TB_BOARDS", indexes = {
    @Index(name = "IDX_BOARDS_CODE", columnList = "BOARD_CODE")
})
@Comment("게시판")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Board extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("게시판 ID")
    private Long id;
    
    /**
     * 게시판 코드 (unique)
     */
    @Column(name = "BOARD_CODE", nullable = false, unique = true, length = 50)
    @Comment("게시판 코드")
    private String boardCode;
    
    /**
     * 게시판 이름
     */
    @Column(name = "BOARD_NAME", nullable = false, length = 100)
    @Comment("게시판 이름")
    private String boardName;
    
    /**
     * 게시판 설명
     */
    @Column(name = "DESCRIPTION", length = 500)
    @Comment("게시판 설명")
    private String description;
    
    /**
     * 사용 여부
     */
    @Column(name = "USE_YN", nullable = false, length = 1)
    @Comment("사용 여부")
    private String useYn;
    
    /**
     * 정렬 순서
     */
    @Column(name = "SORT_ORDER")
    @Comment("정렬 순서")
    private Integer sortOrder;
    
    @Builder
    public Board(String boardCode, String boardName, String description, Integer sortOrder) {
        this.boardCode = boardCode;
        this.boardName = boardName;
        this.description = description;
        this.useYn = "Y";
        this.sortOrder = sortOrder != null ? sortOrder : 0;
    }
    
    /**
     * 게시판 정보 수정
     */
    public void update(String boardName, String description, Integer sortOrder) {
        this.boardName = boardName;
        this.description = description;
        this.sortOrder = sortOrder;
    }
    
    /**
     * 사용 여부 변경
     */
    public void changeUseYn(String useYn) {
        this.useYn = useYn;
    }
    
    /**
     * 게시판 비활성화
     */
    public void deactivate() {
        this.useYn = "N";
    }
    
    /**
     * 게시판 활성화
     */
    public void activate() {
        this.useYn = "Y";
    }
}
