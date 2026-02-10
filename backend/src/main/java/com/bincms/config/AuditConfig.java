package com.bincms.config;

import com.bincms.domain.member.entity.Member;
import com.bincms.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * JPA Auditing 설정
 * - SecurityContext에서 loginId를 꺼내 Member PK(ID)를 조회
 * - REG_NO, MOD_NO에 회원번호(PK)를 String으로 저장
 */
@Configuration
@RequiredArgsConstructor
public class AuditConfig {
    
    private final MemberRepository memberRepository;
    
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()
                    || "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.empty();
            }
            
            // principal = loginId (JWT subject)
            String loginId = (String) authentication.getPrincipal();
            
            return memberRepository.findByLoginId(loginId)
                    .map(member -> String.valueOf(member.getId()));
        };
    }
}
