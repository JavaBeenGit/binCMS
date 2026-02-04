package com.bincms.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    
    // Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "입력값이 올바르지 않습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C002", "서버 오류가 발생했습니다."),
    ENTITY_NOT_FOUND(HttpStatus.NOT_FOUND, "C003", "요청한 리소스를 찾을 수 없습니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "C004", "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "C005", "권한이 없습니다."),
    
    // Member
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "M001", "회원을 찾을 수 없습니다."),
    MEMBER_ALREADY_EXISTS(HttpStatus.CONFLICT, "M002", "이미 존재하는 회원입니다."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "M003", "비밀번호가 올바르지 않습니다."),
    
    // Board
    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "B001", "게시판을 찾을 수 없습니다."),
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "B002", "게시글을 찾을 수 없습니다."),
    
    // Site
    SITE_NOT_FOUND(HttpStatus.NOT_FOUND, "S001", "사이트를 찾을 수 없습니다."),
    
    // Content
    CONTENT_NOT_FOUND(HttpStatus.NOT_FOUND, "CO001", "콘텐츠를 찾을 수 없습니다.");
    
    private final HttpStatus status;
    private final String code;
    private final String message;
}
