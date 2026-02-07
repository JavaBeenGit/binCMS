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
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 회원 관리 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/admin/members")
@RequiredArgsConstructor
public class AdminMemberController {
    
    private final MemberService memberService;
    
    /**
     * 관리자 회원 목록 조회
     */
    @GetMapping
    public ApiResponse<PageResponse<MemberResponse>> getAdminMembers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<MemberResponse> result = memberService.getAdminMembers(keyword, pageable);
        return ApiResponse.success(PageResponse.of(result));
    }
    
    /**
     * 관리자 회원 상세 조회
     */
    @GetMapping("/{id}")
    public ApiResponse<MemberResponse> getAdminMember(@PathVariable Long id) {
        MemberResponse response = memberService.getAdminMemberById(id);
        return ApiResponse.success(response);
    }
    
    /**
     * 관리자 회원 생성
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MemberResponse> createAdminMember(
            @Valid @RequestBody AdminMemberCreateRequest request) {
        MemberResponse response = memberService.createAdminMember(request);
        return ApiResponse.success(response, "관리자 회원이 생성되었습니다.");
    }
    
    /**
     * 관리자 회원 정보 수정
     */
    @PutMapping("/{id}")
    public ApiResponse<MemberResponse> updateAdminMember(
            @PathVariable Long id,
            @Valid @RequestBody AdminMemberUpdateRequest request) {
        MemberResponse response = memberService.updateAdminMember(id, request);
        return ApiResponse.success(response, "관리자 회원 정보가 수정되었습니다.");
    }
    
    /**
     * 관리자 회원 비밀번호 초기화
     */
    @PatchMapping("/{id}/password")
    public ApiResponse<Void> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody AdminPasswordResetRequest request) {
        memberService.resetAdminPassword(id, request);
        return ApiResponse.success(null, "비밀번호가 초기화되었습니다.");
    }
    
    /**
     * 관리자 회원 비활성화
     */
    @PatchMapping("/{id}/deactivate")
    public ApiResponse<Void> deactivateAdminMember(@PathVariable Long id) {
        memberService.deactivateAdminMember(id);
        return ApiResponse.success(null, "관리자 회원이 비활성화되었습니다.");
    }
    
    /**
     * 관리자 회원 활성화
     */
    @PatchMapping("/{id}/activate")
    public ApiResponse<Void> activateAdminMember(@PathVariable Long id) {
        memberService.activateAdminMember(id);
        return ApiResponse.success(null, "관리자 회원이 활성화되었습니다.");
    }
}
