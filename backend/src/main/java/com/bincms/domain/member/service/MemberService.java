package com.bincms.domain.member.service;

import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.common.security.JwtTokenProvider;
import com.bincms.domain.email.service.EmailService;
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
    private final EmailService emailService;
    
    /**
     * 회원가입 (이메일 인증 기반)
     */
    @Transactional
    public MemberResponse signup(SignupRequest request) {
        // 로그인 ID 중복 체크
        if (memberRepository.existsByLoginId(request.getLoginId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 사용중인 로그인 ID입니다");
        }
        
        // 이메일 중복 체크
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (memberRepository.existsByEmail(request.getEmail())) {
                throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 사용중인 이메일입니다");
            }
            
            // 이메일 인증 여부 확인
            if (!emailService.isEmailVerified(request.getEmail())) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이메일 인증이 완료되지 않았습니다");
            }
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
                .provider("LOCAL")
                .emailVerified(request.getEmail() != null && !request.getEmail().isEmpty())
                .build();
        
        Member savedMember = memberRepository.save(member);
        return MemberResponse.from(savedMember);
    }
    
    /**
     * 소셜 로그인 (카카오/네이버/구글)
     * 기존 회원이면 로그인, 신규면 자동 가입 후 로그인
     */
    @Transactional
    public LoginResponse socialLogin(String provider, String providerId, String email, String name) {
        // 기존 소셜 회원 조회
        Member member = memberRepository.findByProviderAndProviderId(provider, providerId)
                .orElse(null);
        
        if (member == null) {
            // 같은 이메일로 가입된 LOCAL 회원이 있으면 연동
            if (email != null && !email.isEmpty()) {
                member = memberRepository.findByEmail(email).orElse(null);
            }
            
            if (member == null) {
                // 탈퇴한 회원이 같은 소셜 계정으로 재가입하는 경우 확인
                String loginId = provider.toLowerCase() + "_" + providerId;
                member = memberRepository.findByLoginId(loginId).orElse(null);
                
                if (member != null) {
                    // 탈퇴 회원 재활성화
                    member.activate();
                    member.linkSocialAccount(provider, providerId);
                    member.updateAdminInfo(
                            name != null ? name : "사용자",
                            email,
                            null
                    );
                } else {
                    // 신규 회원 자동 가입
                    Role userRole = roleService.getRoleByCode("USER");
                    
                    member = Member.builder()
                            .loginId(loginId)
                            .email(email)
                            .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                            .name(name != null ? name : "사용자")
                            .role(userRole)
                            .provider(provider)
                            .providerId(providerId)
                            .emailVerified(email != null && !email.isEmpty())
                            .build();
                    
                    member = memberRepository.save(member);
                }
            } else {
                // 기존 LOCAL 회원에 소셜 연동
                member.linkSocialAccount(provider, providerId);
            }
        }
        
        // JWT 토큰 생성
        String token = jwtTokenProvider.generateToken(member.getLoginId(), member.getRole().getRoleCode());
        List<String> permissions = roleService.getPermissionsByRoleCode(member.getRole().getRoleCode());
        
        return LoginResponse.of(token, MemberResponse.from(member, permissions));
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
    
    // ==================== 사용자 회원 관리 ====================
    
    /**
     * 사용자 회원 목록 조회 (페이징, 검색, 필터)
     */
    public Page<MemberResponse> getUserMembers(String keyword, String provider, Boolean active, Pageable pageable) {
        Page<Member> members = memberRepository.findUserMembers(keyword, provider, active, pageable);
        return members.map(MemberResponse::from);
    }
    
    /**
     * 사용자 회원 상세 조회
     */
    public MemberResponse getUserMemberById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        return MemberResponse.from(member);
    }
    
    /**
     * 사용자 회원 정보 수정 (로그인 ID 제외)
     */
    @Transactional
    public MemberResponse updateUserMember(Long id, UserMemberUpdateRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        
        member.updateAdminInfo(request.getName(), request.getEmail(), request.getPhoneNumber());
        
        if (request.getActive() != null) {
            if (request.getActive()) {
                member.activate();
            } else {
                member.deactivate();
            }
        }
        
        return MemberResponse.from(member);
    }
    
    /**
     * 사용자 비밀번호 초기화
     */
    @Transactional
    public void resetUserPassword(Long id, AdminPasswordResetRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        member.changePassword(passwordEncoder.encode(request.getNewPassword()));
    }
    
    /**
     * 사용자 비활성화
     */
    @Transactional
    public void deactivateUserMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        member.deactivate();
    }
    
    /**
     * 사용자 활성화
     */
    @Transactional
    public void activateUserMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        member.activate();
    }
    
    // ==================== 회원탈퇴 ====================
    
    /**
     * 회원탈퇴 (본인 요청)
     * LOCAL 회원은 비밀번호 확인 필수, 소셜 회원은 바로 탈퇴
     */
    @Transactional
    public void withdrawMember(String loginId, WithdrawRequest request) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        
        // LOCAL 회원은 비밀번호 확인
        if ("LOCAL".equals(member.getProvider())) {
            if (request.getPassword() == null || request.getPassword().isBlank()) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "비밀번호를 입력해주세요");
            }
            if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
                throw new BusinessException(ErrorCode.INVALID_PASSWORD, "비밀번호가 올바르지 않습니다");
            }
        }
        
        // 개인정보 익명화 + 비활성화
        member.withdraw();
    }
}
