package com.bincms.domain.content.dto;

import com.bincms.domain.content.entity.Content;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ContentResponse {
    private Long id;
    private String contentKey;
    private String title;
    private String content;
    private String category;
    private String description;
    private Long viewCount;
    private String useYn;
    private Integer sortOrder;
    private LocalDateTime regDt;
    private LocalDateTime modDt;
    private String regNo;
    private String modNo;

    public static ContentResponse from(Content content) {
        return ContentResponse.builder()
                .id(content.getId())
                .contentKey(content.getContentKey())
                .title(content.getTitle())
                .content(content.getContent())
                .category(content.getCategory())
                .description(content.getDescription())
                .viewCount(content.getViewCount())
                .useYn(content.getUseYn())
                .sortOrder(content.getSortOrder())
                .regDt(content.getRegDt())
                .modDt(content.getModDt())
                .regNo(content.getRegNo())
                .modNo(content.getModNo())
                .build();
    }
}
