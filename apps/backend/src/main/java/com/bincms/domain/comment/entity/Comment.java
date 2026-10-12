package com.bincms.domain.comment.entity;

import com.bincms.common.entity.BaseEntity;
import com.bincms.domain.post.entity.Post;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 댓글 엔티티
 */
@Entity
@Table(name = "TB_COMMENTS", indexes = {
    @Index(name = "IDX_COMMENTS_POST_ID", columnList = "POST_ID"),
    @Index(name = "IDX_COMMENTS_PARENT_ID", columnList = "PARENT_ID")
})
@org.hibernate.annotations.Comment("댓글")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @org.hibernate.annotations.Comment("댓글 ID")
    private Long id;

    /**
     * 게시글 FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POST_ID", nullable = false)
    @org.hibernate.annotations.Comment("게시글 ID")
    private Post post;

    /**
     * 부모 댓글 (대댓글용)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARENT_ID")
    @org.hibernate.annotations.Comment("부모 댓글 ID")
    private Comment parent;

    /**
     * 작성자 이름
     */
    @Column(name = "AUTHOR_NAME", nullable = false, length = 50)
    @org.hibernate.annotations.Comment("작성자 이름")
    private String authorName;

    /**
     * 작성자 비밀번호 (비회원 댓글용)
     */
    @Column(name = "PASSWORD", nullable = false, length = 200)
    @org.hibernate.annotations.Comment("비밀번호")
    private String password;

    /**
     * 댓글 내용
     */
    @Column(name = "CONTENT", nullable = false, length = 2000)
    @org.hibernate.annotations.Comment("댓글 내용")
    private String content;

    /**
     * 사용 여부
     */
    @Column(name = "USE_YN", nullable = false, length = 1)
    @org.hibernate.annotations.Comment("사용 여부")
    private String useYn;

    @Builder
    public Comment(Post post, Comment parent, String authorName, String password, String content) {
        this.post = post;
        this.parent = parent;
        this.authorName = authorName;
        this.password = password;
        this.content = content;
        this.useYn = "Y";
    }

    /**
     * 댓글 수정
     */
    public void update(String content) {
        this.content = content;
    }

    /**
     * 댓글 삭제 (비활성화)
     */
    public void deactivate() {
        this.useYn = "N";
    }
}
