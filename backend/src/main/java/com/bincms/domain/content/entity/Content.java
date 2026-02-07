package com.bincms.domain.content.entity;

import com.bincms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "TB_CONTENTS", indexes = {
    @Index(name = "IDX_CONTENTS_CONTENT_KEY", columnList = "CONTENT_KEY"),
    @Index(name = "IDX_CONTENTS_CATEGORY", columnList = "CATEGORY")
})
@Comment("컨텐츠")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Content extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("컨텐츠 ID")
    private Long id;

    @Column(name = "CONTENT_KEY", nullable = false, unique = true, length = 100)
    @Comment("컨텐츠 키")
    private String contentKey;

    @Column(name = "TITLE", nullable = false, length = 200)
    @Comment("제목")
    private String title;

    @Column(name = "CONTENT", columnDefinition = "LONGTEXT")
    @Comment("내용")
    private String content;

    @Column(name = "CATEGORY", length = 50)
    @Comment("카테고리")
    private String category;

    @Column(name = "DESCRIPTION", length = 500)
    @Comment("설명")
    private String description;

    @Column(name = "VIEW_COUNT", nullable = false)
    @Comment("조회수")
    private Long viewCount;

    @Column(name = "USE_YN", nullable = false, length = 1)
    @Comment("사용 여부")
    private String useYn;

    @Column(name = "SORT_ORDER")
    @Comment("정렬 순서")
    private Integer sortOrder;

    @Builder
    public Content(String contentKey, String title, String content,
                   String category, String description, Integer sortOrder) {
        this.contentKey = contentKey;
        this.title = title;
        this.content = content;
        this.category = category;
        this.description = description;
        this.viewCount = 0L;
        this.useYn = "Y";
        this.sortOrder = sortOrder != null ? sortOrder : 0;
    }

    public void update(String title, String content, String category,
                       String description, Integer sortOrder) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.description = description;
        this.sortOrder = sortOrder;
    }

    public void increaseViewCount() {
        this.viewCount++;
    }

    public void activate() {
        this.useYn = "Y";
    }

    public void deactivate() {
        this.useYn = "N";
    }
}
