package com.bincms.config;

import com.bincms.domain.member.entity.Member;
import com.bincms.domain.member.entity.MemberRole;
import com.bincms.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 애플리케이션 초기 데이터 생성
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {
    
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(ApplicationArguments args) {
        initAdminAccount();
    }
    
    /**
     * Admin 계정 초기화
     */
    private void initAdminAccount() {
        String adminEmail = "admin";
        
        // 이미 admin 계정이 있으면 스킵
        if (memberRepository.existsByEmail(adminEmail)) {
            log.info("Admin account already exists");
            return;
        }
        
        // Admin 계정 생성
        Member admin = Member.builder()
                .email(adminEmail)
                .password(passwordEncoder.encode("1234"))
                .name("관리자")
                .role(MemberRole.ADMIN)
                .build();
        
        memberRepository.save(admin);
        log.info("Admin account created - email: admin, password: 1234");
    }
}
