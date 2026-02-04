package com.bincms.domain.member.dto;

import com.bincms.domain.member.entity.Member;
import com.bincms.domain.member.entity.MemberRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

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
    private MemberRole role;
    private Boolean active;
    private LocalDateTime regDt;
    
    public static MemberResponse from(Member member) {
        return MemberResponse.builder()
                .id(member.getId())
                .loginId(member.getLoginId())
                .email(member.getEmail())
                .name(member.getName())
                .phoneNumber(member.getPhoneNumber())
                .role(member.getRole())
                .active(member.getActive())
                .regDt(member.getRegDt())
                .build();
    }
}
