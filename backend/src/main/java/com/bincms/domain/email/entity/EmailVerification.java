package com.bincms.domain.email.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 이메일 인증 엔티티
 */
@Entity
@Table(name = "TB_EMAIL_VERIFICATIONS", indexes = {
        @Index(name = "idx_email_verifications_email", columnList = "EMAIL"),
        @Index(name = "idx_email_verifications_email_code", columnList = "EMAIL, VERIFICATION_CODE")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VERIFICATION_ID")
    @Comment("인증 ID")
    private Long id;

    @Column(name = "EMAIL", nullable = false, length = 100)
    @Comment("이메일")
    private String email;

    @Column(name = "VERIFICATION_CODE", nullable = false, length = 10)
    @Comment("인증 코드")
    private String verificationCode;

    @Column(name = "EXPIRES_AT", nullable = false)
    @Comment("만료 시각")
    private LocalDateTime expiresAt;

    @Column(name = "VERIFIED", nullable = false)
    @Comment("인증 완료 여부")
    private Boolean verified;

    @Column(name = "VERIFIED_AT")
    @Comment("인증 완료 시각")
    private LocalDateTime verifiedAt;

    @CreatedDate
    @Column(name = "REG_DT", nullable = false, updatable = false)
    @Comment("등록일시")
    private LocalDateTime regDt;

    @Builder
    public EmailVerification(String email, String verificationCode, LocalDateTime expiresAt) {
        this.email = email;
        this.verificationCode = verificationCode;
        this.expiresAt = expiresAt;
        this.verified = false;
    }

    /**
     * 인증 완료 처리
     */
    public void verify() {
        this.verified = true;
        this.verifiedAt = LocalDateTime.now();
    }

    /**
     * 만료 여부 확인
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    /**
     * 유효한 인증인지 확인 (인증 완료 && 미만료)
     */
    public boolean isValidVerification() {
        return this.verified && !isExpired();
    }
}
