package com.bincms.domain.interior.entity;

import com.bincms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

/**
 * 인테리어 엔티티 (갤러리형 게시판)
 */
@Entity
@Table(name = "TB_INTERIORS", indexes = {
    @Index(name = "IDX_INTERIORS_CATEGORY", columnList = "CATEGORY"),
    @Index(name = "IDX_INTERIORS_USE_YN", columnList = "USE_YN")
})
@Comment("인테리어")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Interior extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("인테리어 ID")
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "CATEGORY", nullable = false, length = 20)
    @Comment("카테고리")
    private InteriorCategory category;
    
    @Column(name = "TITLE", nullable = false, length = 200)
    @Comment("제목")
    private String title;
    
    @Column(name = "CONTENT", nullable = false, columnDefinition = "LONGTEXT")
    @Comment("내용")
    private String content;
    
    @Column(name = "THUMBNAIL_URL", length = 500)
    @Comment("대표 이미지 URL")
    private String thumbnailUrl;
    
    @Column(name = "VIEW_COUNT", nullable = false)
    @Comment("조회수")
    private Long viewCount;
    
    @Column(name = "SORT_ORDER", nullable = false)
    @Comment("정렬 순서")
    private Integer sortOrder;
    
    @Column(name = "USE_YN", nullable = false, length = 1)
    @Comment("사용 여부")
    private String useYn;
    
    @Builder
    public Interior(InteriorCategory category, String title, String content,
                    String thumbnailUrl, Integer sortOrder) {
        this.category = category;
        this.title = title;
        this.content = content;
        this.thumbnailUrl = thumbnailUrl;
        this.viewCount = 0L;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        this.useYn = "Y";
    }
    
    public void update(String title, String content, String thumbnailUrl, Integer sortOrder) {
        this.title = title;
        this.content = content;
        this.thumbnailUrl = thumbnailUrl;
        this.sortOrder = sortOrder != null ? sortOrder : this.sortOrder;
    }
    
    public void increaseViewCount() {
        this.viewCount++;
    }
    
    public void deactivate() {
        this.useYn = "N";
    }
    
    public void activate() {
        this.useYn = "Y";
    }
}
