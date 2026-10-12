package com.bincms.domain.member.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.common.dto.PageResponse;
import com.bincms.domain.member.dto.*;
import com.bincms.domain.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자 회원 관리 컨트롤러 (관리자용)
 */
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class UserMemberController {
    
    private final MemberService memberService;
    
    /**
     * 사용자 회원 목록 조회
     */
    @GetMapping
    public ApiResponse<PageResponse<MemberResponse>> getUserMembers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String provider,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<MemberResponse> result = memberService.getUserMembers(keyword, provider, active, pageable);
        return ApiResponse.success(PageResponse.of(result));
    }
    
    /**
     * 사용자 회원 상세 조회
     */
    @GetMapping("/{id}")
    public ApiResponse<MemberResponse> getUserMember(@PathVariable Long id) {
        MemberResponse response = memberService.getUserMemberById(id);
        return ApiResponse.success(response);
    }
    
    /**
     * 사용자 회원 정보 수정 (로그인 ID 제외)
     */
    @PutMapping("/{id}")
    public ApiResponse<MemberResponse> updateUserMember(
            @PathVariable Long id,
            @Valid @RequestBody UserMemberUpdateRequest request) {
        MemberResponse response = memberService.updateUserMember(id, request);
        return ApiResponse.success(response, "사용자 정보가 수정되었습니다.");
    }
    
    /**
     * 사용자 비밀번호 초기화
     */
    @PatchMapping("/{id}/password")
    public ApiResponse<Void> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody AdminPasswordResetRequest request) {
        memberService.resetUserPassword(id, request);
        return ApiResponse.success(null, "비밀번호가 초기화되었습니다.");
    }
    
    /**
     * 사용자 차단
     */
    @PatchMapping("/{id}/deactivate")
    public ApiResponse<Void> deactivateUser(@PathVariable Long id) {
        memberService.deactivateUserMember(id);
        return ApiResponse.success(null, "사용자가 차단되었습니다.");
    }
    
    /**
     * 사용자 차단해제
     */
    @PatchMapping("/{id}/activate")
    public ApiResponse<Void> activateUser(@PathVariable Long id) {
        memberService.activateUserMember(id);
        return ApiResponse.success(null, "사용자 차단이 해제되었습니다.");
    }
}
