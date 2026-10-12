package com.bincms.domain.inquiry.dto;

import com.bincms.domain.inquiry.entity.Inquiry;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InquiryResponse {

    private Long id;
    private String name;
    private String phone;
    private String email;
    private String inquiryType;
    private String budget;
    private String address;
    private String content;
    private String status;
    private String adminMemo;
    private LocalDateTime regDt;
    private LocalDateTime modDt;

    public static InquiryResponse from(Inquiry inquiry) {
        return InquiryResponse.builder()
                .id(inquiry.getId())
                .name(inquiry.getName())
                .phone(inquiry.getPhone())
                .email(inquiry.getEmail())
                .inquiryType(inquiry.getInquiryType())
                .budget(inquiry.getBudget())
                .address(inquiry.getAddress())
                .content(inquiry.getContent())
                .status(inquiry.getStatus())
                .adminMemo(inquiry.getAdminMemo())
                .regDt(inquiry.getRegDt())
                .modDt(inquiry.getModDt())
                .build();
    }
}
