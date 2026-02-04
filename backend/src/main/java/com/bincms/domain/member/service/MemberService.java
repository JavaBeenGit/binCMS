package com.bincms.domain.member.service;

import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.common.security.JwtTokenProvider;
import com.bincms.domain.member.dto.*;
import com.bincms.domain.member.entity.Member;
import com.bincms.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 회원 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {
    
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    /**
     * 회원가입
     */
    @Transactional
    public MemberResponse signup(SignupRequest request) {
        // 로그인 ID 중복 체크
        if (memberRepository.existsByLoginId(request.getLoginId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 사용중인 로그인 ID입니다");
        }
        
        // 회원 생성
        Member member = Member.builder()
                .loginId(request.getLoginId())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .build();
        
        Member savedMember = memberRepository.save(member);
        return MemberResponse.from(savedMember);
    }
    
    /**
     * 로그인
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 회원 조회
        Member member = memberRepository.findByLoginIdAndActiveTrue(request.getLoginId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT_VALUE, 
                        "로그인 ID 또는 비밀번호가 올바르지 않습니다"));
        
        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, 
                    "로그인 ID 또는 비밀번호가 올바르지 않습니다");
        }
        
        // JWT 토큰 생성
        String token = jwtTokenProvider.generateToken(member.getLoginId(), member.getRole().getKey());
        
        return LoginResponse.of(token, MemberResponse.from(member));
    }
    
    /**
     * 회원 조회 (로그인 ID)
     */
    public MemberResponse getMemberByLoginId(String loginId) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND, 
                        "회원을 찾을 수 없습니다"));
        
        return MemberResponse.from(member);
    }
}
