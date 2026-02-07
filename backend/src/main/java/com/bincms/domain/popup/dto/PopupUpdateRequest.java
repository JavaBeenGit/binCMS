package com.bincms.domain.popup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class PopupUpdateRequest {

    @NotBlank(message = "팝업 제목은 필수입니다")
    @Size(max = 200, message = "팝업 제목은 200자 이하여야 합니다")
    private String title;

    private String content;

    private Integer popupWidth;

    private Integer popupHeight;

    private Integer positionX;

    private Integer positionY;

    private LocalDateTime startDt;

    private LocalDateTime endDt;

    private Integer sortOrder;
}
