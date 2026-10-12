package com.bincms.domain.inquiry.entity;

import com.bincms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

@Entity
@Table(name = "tb_inquiries")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Comment("견적문의")
public class Inquiry extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("견적문의 ID")
    private Long id;

    @Column(name = "NAME", nullable = false, length = 50)
    @Comment("이름")
    private String name;

    @Column(name = "PHONE", nullable = false, length = 20)
    @Comment("연락처")
    private String phone;

    @Column(name = "EMAIL", length = 100)
    @Comment("이메일")
    private String email;

    @Column(name = "INQUIRY_TYPE", nullable = false, length = 20)
    @Comment("시공 유형")
    private String inquiryType;

    @Column(name = "BUDGET", length = 20)
    @Comment("예상 예산")
    private String budget;

    @Column(name = "ADDRESS", length = 500)
    @Comment("시공 장소")
    private String address;

    @Column(name = "CONTENT", nullable = false, columnDefinition = "TEXT")
    @Comment("문의 내용")
    private String content;

    @Column(name = "STATUS", nullable = false, length = 20)
    @Comment("처리 상태")
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "ADMIN_MEMO", columnDefinition = "TEXT")
    @Comment("관리자 메모")
    private String adminMemo;

    public void updateStatus(String status) {
        this.status = status;
    }

    public void updateAdminMemo(String adminMemo) {
        this.adminMemo = adminMemo;
    }
}
