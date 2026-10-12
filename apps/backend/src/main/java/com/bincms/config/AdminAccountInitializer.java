package com.bincms.config;

import com.bincms.domain.member.entity.Member;
import com.bincms.domain.member.repository.MemberRepository;
import com.bincms.domain.role.entity.Role;
import com.bincms.domain.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 최초 기동 시 시스템 관리자 계정 1개를 만든다.
 *
 * 스키마·역할·권한·메뉴는 Flyway(V1·V2)가 만들지만, 비밀번호 해시(BCrypt)는 SQL 로 넣을 수 없어 여기서 처리한다.
 * - 관리자 역할(SYSTEM/OPERATION/GENERAL_ADMIN) 계정이 하나라도 있으면 아무것도 하지 않는다.
 * - 없는데 {@code app.admin.initial-password} 가 비어 있으면 기동을 실패시킨다(운영에서 기본 비밀번호로 열리는 것을 막기 위해).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminAccountInitializer implements ApplicationRunner {

    static final String ADMIN_LOGIN_ID = "admin";
    private static final List<String> ADMIN_ROLE_CODES = List.of("SYSTEM_ADMIN", "OPERATION_ADMIN", "GENERAL_ADMIN");

    private final MemberRepository memberRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.initial-password:}")
    private String initialPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (memberRepository.existsByLoginId(ADMIN_LOGIN_ID) || adminExists()) {
            return;
        }
        if (!StringUtils.hasText(initialPassword)) {
            throw new IllegalStateException(
                    "관리자 계정이 없는데 app.admin.initial-password(환경변수 ADMIN_INITIAL_PASSWORD)가 비어 있습니다. "
                    + "최초 기동 시 반드시 지정하세요.");
        }
        Role systemAdmin = roleRepository.findByRoleCode("SYSTEM_ADMIN")
                .orElseThrow(() -> new IllegalStateException("SYSTEM_ADMIN 역할이 없습니다. Flyway V2 시드를 확인하세요."));

        Member admin = Member.builder()
                .loginId(ADMIN_LOGIN_ID)
                .password(passwordEncoder.encode(initialPassword))
                .name("관리자")
                .role(systemAdmin)
                .build();
        memberRepository.save(admin);
        log.info("시스템 관리자 계정 생성: loginId={} (비밀번호는 app.admin.initial-password)", ADMIN_LOGIN_ID);
    }

    private boolean adminExists() {
        List<Role> adminRoles = roleRepository.findByRoleCodes(ADMIN_ROLE_CODES);
        return !adminRoles.isEmpty() && memberRepository.existsByRoleIn(adminRoles);
    }
}
