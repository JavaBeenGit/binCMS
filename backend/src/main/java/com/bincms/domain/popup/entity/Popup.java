package com.bincms.domain.popup.entity;

import com.bincms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_POPUPS", indexes = {
    @Index(name = "IDX_POPUPS_USE_YN", columnList = "USE_YN"),
    @Index(name = "IDX_POPUPS_START_DT", columnList = "START_DT"),
    @Index(name = "IDX_POPUPS_END_DT", columnList = "END_DT")
})
@Comment("팝업")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Popup extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("팝업 ID")
    private Long id;

    @Column(name = "TITLE", nullable = false, length = 200)
    @Comment("팝업 제목")
    private String title;

    @Column(name = "CONTENT", columnDefinition = "LONGTEXT")
    @Comment("팝업 내용 (HTML)")
    private String content;

    @Column(name = "POPUP_WIDTH")
    @Comment("팝업 너비 (px)")
    private Integer popupWidth;

    @Column(name = "POPUP_HEIGHT")
    @Comment("팝업 높이 (px)")
    private Integer popupHeight;

    @Column(name = "POSITION_X")
    @Comment("팝업 X 위치 (px)")
    private Integer positionX;

    @Column(name = "POSITION_Y")
    @Comment("팝업 Y 위치 (px)")
    private Integer positionY;

    @Column(name = "START_DT")
    @Comment("노출 시작일시")
    private LocalDateTime startDt;

    @Column(name = "END_DT")
    @Comment("노출 종료일시")
    private LocalDateTime endDt;

    @Column(name = "SORT_ORDER")
    @Comment("정렬 순서")
    private Integer sortOrder;

    @Column(name = "USE_YN", nullable = false, length = 1)
    @Comment("사용 여부")
    private String useYn;

    @Builder
    public Popup(String title, String content, Integer popupWidth, Integer popupHeight,
                 Integer positionX, Integer positionY,
                 LocalDateTime startDt, LocalDateTime endDt, Integer sortOrder) {
        this.title = title;
        this.content = content;
        this.popupWidth = popupWidth != null ? popupWidth : 500;
        this.popupHeight = popupHeight != null ? popupHeight : 400;
        this.positionX = positionX != null ? positionX : 100;
        this.positionY = positionY != null ? positionY : 100;
        this.startDt = startDt;
        this.endDt = endDt;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        this.useYn = "Y";
    }

    public void update(String title, String content, Integer popupWidth, Integer popupHeight,
                       Integer positionX, Integer positionY,
                       LocalDateTime startDt, LocalDateTime endDt, Integer sortOrder) {
        this.title = title;
        this.content = content;
        this.popupWidth = popupWidth;
        this.popupHeight = popupHeight;
        this.positionX = positionX;
        this.positionY = positionY;
        this.startDt = startDt;
        this.endDt = endDt;
        this.sortOrder = sortOrder;
    }

    public void activate() {
        this.useYn = "Y";
    }

    public void deactivate() {
        this.useYn = "N";
    }
}
