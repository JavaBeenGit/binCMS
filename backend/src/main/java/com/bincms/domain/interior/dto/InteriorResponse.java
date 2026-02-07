package com.bincms.domain.interior.dto;

import com.bincms.domain.interior.entity.Interior;
import com.bincms.domain.interior.entity.InteriorCategory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 인테리어 응답 DTO
 */
@Getter
@Builder
public class InteriorResponse {
    
    private Long id;
    private InteriorCategory category;
    private String categoryName;
    private String title;
    private String content;
    private String thumbnailUrl;
    private Long viewCount;
    private Integer sortOrder;
    private String useYn;
    private LocalDateTime regDt;
    private LocalDateTime modDt;
    private String regNo;
    
    public static InteriorResponse from(Interior interior) {
        return InteriorResponse.builder()
                .id(interior.getId())
                .category(interior.getCategory())
                .categoryName(interior.getCategory().getDisplayName())
                .title(interior.getTitle())
                .content(interior.getContent())
                .thumbnailUrl(interior.getThumbnailUrl())
                .viewCount(interior.getViewCount())
                .sortOrder(interior.getSortOrder())
                .useYn(interior.getUseYn())
                .regDt(interior.getRegDt())
                .modDt(interior.getModDt())
                .regNo(interior.getRegNo())
                .build();
    }
}
