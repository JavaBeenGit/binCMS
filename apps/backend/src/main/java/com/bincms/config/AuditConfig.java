package com.bincms.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.AuditorAware;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * JPA Auditing 설정
 * - SecurityContext 의 principal(loginId, JWT subject)로 회원 PK 를 찾아 reg_no/mod_no 에 문자열로 저장한다.
 * - 조회는 반드시 JdbcTemplate 로 한다. JPA 리포지토리로 조회하면 flush 도중의 @PreUpdate 콜백 안에서
 *   auto-flush 가 다시 일어나 StackOverflowError 가 난다(2026-10-12 수정 API 500 원인).
 */
@Configuration
@RequiredArgsConstructor
public class AuditConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()
                    || "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.empty();
            }
            String loginId = String.valueOf(authentication.getPrincipal());
            try {
                Long id = jdbcTemplate.queryForObject("SELECT id FROM tb_members WHERE lgn_id = ?", Long.class, loginId);
                return Optional.ofNullable(id).map(String::valueOf);
            } catch (EmptyResultDataAccessException e) {
                return Optional.empty();
            }
        };
    }
}
