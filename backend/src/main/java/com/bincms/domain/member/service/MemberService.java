package com.bincms.domain.member.service;

import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.common.security.JwtTokenProvider;
import com.bincms.domain.member.dto.*;
import com.bincms.domain.member.entity.Member;
import com.bincms.domain.member.repository.MemberRepository;
import com.bincms.domain.role.entity.Role;
import com.bincms.domain.role.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
    private final RoleService roleService;
    
    /**
     * 회원가입
     */
    @Transactional
    public MemberResponse signup(SignupRequest request) {
        // 로그인 ID 중복 체크
        if (memberRepository.existsByLoginId(request.getLoginId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 사용중인 로그인 ID입니다");
        }
        
        // 기본 역할: USER
        Role userRole = roleService.getRoleByCode("USER");
        
        // 회원 생성
        Member member = Member.builder()
                .loginId(request.getLoginId())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .role(userRole)
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
        
        // JWT 토큰 생성 (역할 코드 사용)
        String token = jwtTokenProvider.generateToken(member.getLoginId(), member.getRole().getRoleCode());
        
        // 사용자 권한 목록 조회
        List<String> permissions = roleService.getPermissionsByRoleCode(member.getRole().getRoleCode());
        
        return LoginResponse.of(token, MemberResponse.from(member, permissions));
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
    
    // ==================== 관리자 회원 관리 ====================
    
    /**
     * 관리자 회원 목록 조회 (페이징, 검색)
     */
    public Page<MemberResponse> getAdminMembers(String keyword, Pageable pageable) {
        List<String> adminRoleCodes = List.of("SYSTEM_ADMIN", "OPERATION_ADMIN", "GENERAL_ADMIN");
        Page<Member> members = memberRepository.findByRoleCodesAndKeyword(adminRoleCodes, keyword, pageable);
        return members.map(MemberResponse::from);
    }
    
    /**
     * 관리자 회원 상세 조회
     */
    public MemberResponse getAdminMemberById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        return MemberResponse.from(member);
    }
    
    /**
     * 관리자 회원 생성
     */
    @Transactional
    public MemberResponse createAdminMember(AdminMemberCreateRequest request) {
        if (memberRepository.existsByLoginId(request.getLoginId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 사용중인 로그인 ID입니다");
        }
        
        Role role = roleService.getRoleByCode(request.getRoleCode());
        
        Member member = Member.builder()
                .loginId(request.getLoginId())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .role(role)
                .build();
        
        Member savedMember = memberRepository.save(member);
        return MemberResponse.from(savedMember);
    }
    
    /**
     * 관리자 회원 정보 수정
     */
    @Transactional
    public MemberResponse updateAdminMember(Long id, AdminMemberUpdateRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        
        member.updateAdminInfo(request.getName(), request.getEmail(), request.getPhoneNumber());
        
        Role role = roleService.getRoleByCode(request.getRoleCode());
        member.changeRole(role);
        
        return MemberResponse.from(member);
    }
    
    /**
     * 관리자 회원 비밀번호 초기화
     */
    @Transactional
    public void resetAdminPassword(Long id, AdminPasswordResetRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        
        member.changePassword(passwordEncoder.encode(request.getNewPassword()));
    }
    
    /**
     * 관리자 회원 비활성화
     */
    @Transactional
    public void deactivateAdminMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        member.deactivate();
    }
    
    /**
     * 관리자 회원 활성화
     */
    @Transactional
    public void activateAdminMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        member.activate();
    }
}
