package com.bincms.inquiry;

import com.bincms.support.AbstractIntegrationTest;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.context.TestPropertySource;

import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 새 견적문의가 접수되면 운영자 메일(app.inquiry.notify-to)로 알림을 보낸다. 발송은 비동기이며 실패해도 접수는 성공.
 * 기대값 정본: docs/30-dev/guides/features/50-견적문의.md
 */
@TestPropertySource(properties = "app.inquiry.notify-to=owner@example.com")
class InquiryNotifyTest extends AbstractIntegrationTest {

    @MockBean
    JavaMailSender mailSender;

    @Test
    @DisplayName("접수되면 notify-to 로 '[수디자인] 새 견적문의' 메일이 1통 간다")
    void sendsMailOnNewInquiry() throws Exception {
        MimeMessage mime = new JavaMailSenderImpl().createMimeMessage();
        when(mailSender.createMimeMessage()).thenReturn(mime);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        mockMvc.perform(post("/api/v1/public/inquiries").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"notify-tester\",\"phone\":\"010-0000-0000\",\"type\":\"store\","
                                + "\"budget\":\"consult\",\"content\":\"notify me\"}"))
                .andExpect(status().is2xxSuccessful());

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, timeout(TimeUnit.SECONDS.toMillis(5))).send(captor.capture());
        MimeMessage sent = captor.getValue();
        assertThat(sent.getSubject()).contains("새 견적문의").contains("notify-tester");
        assertThat(sent.getAllRecipients()[0].toString()).isEqualTo("owner@example.com");
    }
}
