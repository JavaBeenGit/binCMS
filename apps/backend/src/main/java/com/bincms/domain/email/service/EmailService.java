package com.bincms.domain.email.service;

import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.email.entity.EmailVerification;
import com.bincms.domain.email.repository.EmailVerificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * 이메일 인증 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailVerificationRepository emailVerificationRepository;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Value("${app.mail.verification-code-expiry:300}")
    private int verificationCodeExpiry; // 초 단위

    private static final int CODE_LENGTH = 6;
    private static final int MAX_SEND_PER_HOUR = 5; // 시간당 최대 발송 횟수

    /**
     * 인증 코드 발송
     */
    @Transactional
    public void sendVerificationCode(String email) {
        // 1시간 이내 발송 횟수 체크 (악용 방지)
        long recentCount = emailVerificationRepository.countByEmailAndRegDtAfter(
                email, LocalDateTime.now().minusHours(1));
        
        if (recentCount >= MAX_SEND_PER_HOUR) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE,
                    "인증 코드 발송 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.");
        }

        // 6자리 인증 코드 생성
        String code = generateCode();

        // DB에 인증 정보 저장
        EmailVerification verification = EmailVerification.builder()
                .email(email)
                .verificationCode(code)
                .expiresAt(LocalDateTime.now().plusSeconds(verificationCodeExpiry))
                .build();

        emailVerificationRepository.save(verification);

        // 이메일 발송
        sendEmail(email, code);

        log.info("인증 코드 발송 완료: email={}", email);
    }

    /**
     * 인증 코드 검증
     */
    @Transactional
    public boolean verifyCode(String email, String code) {
        EmailVerification verification = emailVerificationRepository
                .findByEmailAndVerificationCode(email, code)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT_VALUE,
                        "인증 코드가 올바르지 않습니다."));

        if (verification.isExpired()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE,
                    "인증 코드가 만료되었습니다. 다시 발송해주세요.");
        }

        if (verification.getVerified()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE,
                    "이미 인증이 완료된 코드입니다.");
        }

        verification.verify();
        return true;
    }

    /**
     * 이메일 인증 여부 확인 (회원가입 시 사용)
     */
    public boolean isEmailVerified(String email) {
        return emailVerificationRepository
                .findTopByEmailAndVerifiedTrueOrderByVerifiedAtDesc(email)
                .map(v -> {
                    // 인증 후 30분 이내만 유효 (회원가입 시간 제한)
                    return v.getVerifiedAt() != null &&
                           v.getVerifiedAt().isAfter(LocalDateTime.now().minusMinutes(30));
                })
                .orElse(false);
    }

    /**
     * 6자리 숫자 코드 생성
     */
    private String generateCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(900000) + 100000; // 100000 ~ 999999
        return String.valueOf(code);
    }

    /**
     * 인증 이메일 발송
     */
    private void sendEmail(String to, String code) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("[BIN INTERIOR] 이메일 인증 코드");
            helper.setText(buildEmailContent(code), true);

            mailSender.send(mimeMessage);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("이메일 발송 실패: to={}, error={}", to, e.getMessage());
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    /**
     * 인증 이메일 HTML 내용 생성
     */
    private String buildEmailContent(String code) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
                        .header { background: #1a1a2e; padding: 32px; text-align: center; }
                        .header h1 { color: #c9a96e; font-size: 22px; margin: 0; font-weight: 600; letter-spacing: 2px; }
                        .content { padding: 40px 32px; }
                        .content p { color: #333; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
                        .code-box { background: #f8f4ee; border: 2px dashed #c9a96e; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; }
                        .code-box .code { font-size: 36px; font-weight: 700; color: #1a1a2e; letter-spacing: 8px; }
                        .code-box .notice { font-size: 13px; color: #888; margin-top: 8px; }
                        .footer { background: #fafafa; padding: 20px 32px; text-align: center; border-top: 1px solid #eee; }
                        .footer p { color: #999; font-size: 12px; margin: 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>BIN INTERIOR</h1>
                        </div>
                        <div class="content">
                            <p>안녕하세요,<br><strong>BIN INTERIOR</strong> 회원가입을 위한 이메일 인증 코드입니다.</p>
                            <div class="code-box">
                                <div class="code">%s</div>
                                <div class="notice">인증 코드는 %d분간 유효합니다.</div>
                            </div>
                            <p>본인이 요청하지 않은 경우 이 이메일을 무시해 주세요.</p>
                        </div>
                        <div class="footer">
                            <p>ⓒ BIN INTERIOR. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(code, verificationCodeExpiry / 60);
    }
}
