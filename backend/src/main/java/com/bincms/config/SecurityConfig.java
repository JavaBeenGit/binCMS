package com.bincms.config;

import com.bincms.common.security.ApiAccessDeniedHandler;
import com.bincms.common.security.ApiAuthenticationEntryPoint;
import com.bincms.common.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * 접두어 기반 권한 규칙 (ADR-0003).
 *
 * <pre>
 *   /api/v1/public/**, /uploads/**, /api/v1/health, /api/v1/auth/{login,signup}  → 익명 허용
 *   /api/v1/user/**, /api/v1/auth/withdraw                                       → 로그인 회원(아무 역할)
 *   /api/v1/admin/**                                                             → 관리자 3역할
 *   그 외                                                                         → 로그인 필요
 * </pre>
 * 인증 없음은 401(C004), 역할 부족은 403(C005)을 표준 ApiResponse JSON으로 돌려준다.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    /** 관리자 축 역할 3코드 — 하나로 합치지 않는다(ADR-0003). */
    private static final String[] ADMIN_ROLES = {"SYSTEM_ADMIN", "OPERATION_ADMIN", "GENERAL_ADMIN"};

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ApiAuthenticationEntryPoint authenticationEntryPoint;
    private final ApiAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                // 익명 허용
                .requestMatchers("/api/v1/public/**", "/uploads/**", "/api/v1/health").permitAll()
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/signup").permitAll()
                .requestMatchers("/api/v1/contents/**").permitAll()   // Task 3에서 /public/contents 로 이동 후 삭제
                // 로그인 회원
                .requestMatchers("/api/v1/user/**", "/api/v1/auth/withdraw").authenticated()
                // 관리자
                .requestMatchers("/api/v1/admin/**").hasAnyRole(ADMIN_ROLES)
                .requestMatchers("/api/v1/boards/**", "/api/v1/posts/**", "/api/v1/comments/**",
                                 "/api/v1/menus/**", "/api/v1/files/**", "/api/v1/inquiries/**")
                    .hasAnyRole(ADMIN_ROLES)                            // Task 3에서 /admin 으로 이동 후 삭제
                .anyRequest().authenticated()
            )
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
