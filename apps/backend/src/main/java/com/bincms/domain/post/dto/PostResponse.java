package com.bincms.domain.post.dto;

import com.bincms.domain.member.entity.Member;
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
    
    // 작성자 정보
    private Long authorId;
    private String authorName;
    private String authorLoginId;
    
    /** 화면 표시용 작성자명 (관리자→"관리자", 사용자→이름 마스킹) */
    private String displayAuthorName;
    
    /**
     * Post 엔티티 → PostResponse 변환 (작성자 정보 없음)
     */
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
    
    /**
     * Post 엔티티 + Member → PostResponse 변환 (작성자 정보 포함)
     */
    public static PostResponse from(Post post, Member author) {
        PostResponseBuilder builder = PostResponse.builder()
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
                .regNo(post.getRegNo());
        
        if (author != null) {
            builder.authorId(author.getId())
                   .authorName(author.getName())
                   .authorLoginId(author.getLoginId())
                   .displayAuthorName(buildDisplayName(author));
        }
        
        return builder.build();
    }
    
    /**
     * 화면 표시용 작성자명 생성
     * - 관리자 역할(ADMIN 포함)이면 "관리자"
     * - 일반 사용자면 첫 글자만 표시하고 나머지는 * (예: 홍길동 → 홍**)
     */
    private static String buildDisplayName(Member author) {
        if (author == null) {
            return "익명";
        }
        
        String roleCode = author.getRole() != null 
                ? author.getRole().getRoleCode() : "";
        
        // 관리자 역할이면 "관리자"로 표시
        if (roleCode.contains("ADMIN")) {
            return "관리자";
        }
        
        // 일반 사용자: 이름 마스킹
        String name = author.getName();
        if (name == null || name.isEmpty()) {
            return "익명";
        }
        if (name.length() == 1) {
            return name;
        }
        return name.charAt(0) + "*".repeat(name.length() - 1);
    }
}
