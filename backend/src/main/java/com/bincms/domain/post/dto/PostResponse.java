package com.bincms.domain.post.dto;

import com.bincms.domain.post.entity.Post;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 게시글 응답 DTO
 */
@Getter
@Builder
public class PostResponse {
    
    private Long id;
    private Long boardId;
    private String boardName;
    private String title;
    private String content;
    private Long viewCount;
    private String noticeYn;
    private String useYn;
    private LocalDateTime regDt;
    private LocalDateTime modDt;
    private String regNo;
    
    public static PostResponse from(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .boardId(post.getBoard().getId())
                .boardName(post.getBoard().getBoardName())
                .title(post.getTitle())
                .content(post.getContent())
                .viewCount(post.getViewCount())
                .noticeYn(post.getNoticeYn())
                .useYn(post.getUseYn())
                .regDt(post.getRegDt())
                .modDt(post.getModDt())
                .regNo(post.getRegNo())
                .build();
    }
}
