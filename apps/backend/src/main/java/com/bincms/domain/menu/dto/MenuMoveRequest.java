package com.bincms.domain.menu.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메뉴 순서 이동 요청 — 같은 부모 아래 형제와 자리를 바꾼다.
 */
@Getter
@NoArgsConstructor
public class MenuMoveRequest {

    @Pattern(regexp = "up|down", message = "direction 은 up 또는 down 이어야 합니다.")
    private String direction;
}
