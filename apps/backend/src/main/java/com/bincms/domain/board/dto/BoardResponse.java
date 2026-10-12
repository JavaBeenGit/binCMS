package com.bincms.domain.board.dto;

import com.bincms.domain.board.entity.Board;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 게시판 응답 DTO
 */
@Getter
@Builder
public class BoardResponse {
    
    private Long id;
    private String boardCode;
    private String boardName;
    private String description;
    private String useYn;
    private Integer sortOrder;
    private LocalDateTime regDt;
    private LocalDateTime modDt;
    
    public static BoardResponse from(Board board) {
        return BoardResponse.builder()
                .id(board.getId())
                .boardCode(board.getBoardCode())
                .boardName(board.getBoardName())
                .description(board.getDescription())
                .useYn(board.getUseYn())
                .sortOrder(board.getSortOrder())
                .regDt(board.getRegDt())
                .modDt(board.getModDt())
                .build();
    }
}
