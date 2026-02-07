package com.bincms.domain.inquiry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InquiryCreateRequest {

    @NotBlank(message = "이름을 입력해주세요")
    @Size(max = 50)
    private String name;

    @NotBlank(message = "연락처를 입력해주세요")
    @Size(max = 20)
    private String phone;

    @Size(max = 100)
    private String email;

    @NotBlank(message = "시공 유형을 선택해주세요")
    @Size(max = 20)
    private String type;

    @Size(max = 20)
    private String budget;

    @Size(max = 500)
    private String address;

    @NotBlank(message = "문의 내용을 입력해주세요")
    private String content;
}
