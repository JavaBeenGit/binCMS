package com.bincms.domain.email.repository;

import com.bincms.domain.email.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 이메일 인증 Repository
 */
@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    /**
     * 이메일과 인증코드로 조회
     */
    Optional<EmailVerification> findByEmailAndVerificationCode(String email, String verificationCode);

    /**
     * 이메일로 가장 최근 인증 완료 건 조회
     */
    Optional<EmailVerification> findTopByEmailAndVerifiedTrueOrderByVerifiedAtDesc(String email);

    /**
     * 이메일로 최근 N분 이내 발송 건수 조회 (악용 방지)
     */
    long countByEmailAndRegDtAfter(String email, LocalDateTime after);

    /**
     * 만료된 인증 건 삭제
     */
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
