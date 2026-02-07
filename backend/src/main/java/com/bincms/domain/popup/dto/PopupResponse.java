package com.bincms.domain.popup.dto;

import com.bincms.domain.popup.entity.Popup;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PopupResponse {
    private Long id;
    private String title;
    private String content;
    private Integer popupWidth;
    private Integer popupHeight;
    private Integer positionX;
    private Integer positionY;
    private LocalDateTime startDt;
    private LocalDateTime endDt;
    private Integer sortOrder;
    private String useYn;
    private LocalDateTime regDt;
    private LocalDateTime modDt;
    private String regNo;
    private String modNo;

    public static PopupResponse from(Popup popup) {
        return PopupResponse.builder()
                .id(popup.getId())
                .title(popup.getTitle())
                .content(popup.getContent())
                .popupWidth(popup.getPopupWidth())
                .popupHeight(popup.getPopupHeight())
                .positionX(popup.getPositionX())
                .positionY(popup.getPositionY())
                .startDt(popup.getStartDt())
                .endDt(popup.getEndDt())
                .sortOrder(popup.getSortOrder())
                .useYn(popup.getUseYn())
                .regDt(popup.getRegDt())
                .modDt(popup.getModDt())
                .regNo(popup.getRegNo())
                .modNo(popup.getModNo())
                .build();
    }
}
