package com.bincms.domain.member.dto;

import com.bincms.domain.member.entity.Member;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 회원 응답 DTO
 */
@Getter
@Builder
public class MemberResponse {

    private Long id;
    private String loginId;
    private String email;
    private String name;
    private String phoneNumber;
    private String roleCode;
    private String roleName;
    private String provider;
    private Boolean emailVerified;
    private List<String> permissions;
    private Boolean active;
    private LocalDateTime regDt;

    public static MemberResponse from(Member member) {
        return from(member, null);
    }

    public static MemberResponse from(Member member, List<String> permissions) {
        return MemberResponse.builder()
                .id(member.getId())
                .loginId(member.getLoginId())
                .email(member.getEmail())
                .name(member.getName())
                .phoneNumber(member.getPhoneNumber())
                .roleCode(member.getRole() != null ? member.getRole().getRoleCode() : null)
                .roleName(member.getRole() != null ? member.getRole().getRoleName() : null)
                .provider(member.getProvider())
                .emailVerified(member.getEmailVerified())
                .permissions(permissions)
                .active(member.getActive())
                .regDt(member.getRegDt())
                .build();
    }
}
