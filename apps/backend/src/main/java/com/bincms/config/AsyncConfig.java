package com.bincms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/** @Async 활성화 — 견적문의 메일 알림(InquiryNotifier)처럼 요청 응답과 분리해야 하는 작업용. */
@Configuration
@EnableAsync
public class AsyncConfig {
}
