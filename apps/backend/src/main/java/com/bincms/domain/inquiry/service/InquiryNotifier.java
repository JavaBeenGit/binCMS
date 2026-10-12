package com.bincms.domain.inquiry.service;

import com.bincms.domain.inquiry.entity.Inquiry;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * 새 견적문의 메일 알림. app.inquiry.notify-to(환경변수 INQUIRY_NOTIFY_TO)가 비어 있으면 아무것도 하지 않는다.
 * 비동기로 보내며, 실패해도 접수는 이미 끝난 뒤라 영향이 없다(로그만).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InquiryNotifier {

    private final JavaMailSender mailSender;

    @Value("${app.inquiry.notify-to:}")
    private String notifyTo;

    @Value("${app.mail.from:}")
    private String from;

    @Value("${app.mail.from-name:수디자인}")
    private String fromName;

    @Value("${app.site.base-url:http://localhost:3000}")
    private String baseUrl;

    public boolean isEnabled() {
        return StringUtils.hasText(notifyTo);
    }

    @Async
    public void notifyNewInquiry(Inquiry inquiry) {
        if (!isEnabled()) {
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(notifyTo);
            if (StringUtils.hasText(from)) {
                helper.setFrom(from, fromName);
            }
            helper.setSubject("[수디자인] 새 견적문의: " + inquiry.getName());
            helper.setText(body(inquiry), false);
            mailSender.send(message);
            log.info("견적문의 알림 발송: inquiryId={}, to={}", inquiry.getId(), notifyTo);
        } catch (Exception e) {
            log.error("견적문의 알림 발송 실패: inquiryId={}", inquiry.getId(), e);
        }
    }

    private String body(Inquiry inquiry) {
        return "새 견적문의가 접수되었습니다.\n\n"
                + "이름: " + nz(inquiry.getName()) + "\n"
                + "연락처: " + nz(inquiry.getPhone()) + "\n"
                + "이메일: " + nz(inquiry.getEmail()) + "\n"
                + "시공 유형: " + nz(inquiry.getInquiryType()) + "\n"
                + "예산: " + nz(inquiry.getBudget()) + "\n"
                + "시공 장소: " + nz(inquiry.getAddress()) + "\n\n"
                + "문의 내용:\n" + nz(inquiry.getContent()) + "\n\n"
                + "관리자 화면: " + baseUrl + "/admin/posts/qna\n";
    }

    private static String nz(String s) {
        return s == null ? "-" : s;
    }
}
