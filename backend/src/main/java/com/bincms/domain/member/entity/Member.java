package com.bincms.domain.member.entity;

import com.bincms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원 엔티티
 */
@Entity
@Table(name = "TB_MEMBERS", indexes = {
    @Index(name = "IDX_MEMBERS_LOGIN_ID", columnList = "LGN_ID")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 로그인 ID
     */
    @Column(name = "LGN_ID", nullable = false, unique = true, length = 50)
    private String loginId;
    
    /**
     * 이메일 (선택사항)
     */
    @Column(name = "EMAIL", length = 100)
    private String email;
    
    /**
     * 비밀번호 (암호화 저장)
     */
    @Column(name = "PASSWORD", nullable = false)
    private String password;
    
    /**
     * 이름
     */
    @Column(name = "NAME", nullable = false, length = 50)
    private String name;
    
    /**
     * 전화번호
     */
    @Column(name = "PHONE_NUMBER", length = 20)
    private String phoneNumber;
    
    /**
     * 회원 권한
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", nullable = false, length = 20)
    private MemberRole role;
    
    /**
     * 활성화 여부
     */
    @Column(name = "ACTIVE", nullable = false)
    private Boolean active;
    
    @Builder
    public Member(String loginId, String email, String password, String name, String phoneNumber, MemberRole role) {
        this.loginId = loginId;
        this.email = email;
        this.password = password;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.role = role != null ? role : MemberRole.USER;
        this.active = true;
    }
    
    /**
     * 비밀번호 변경
     */
    public void changePassword(String newPassword) {
        this.password = newPassword;
    }
    
    /**
     * 회원 정보 수정
     */
    public void updateInfo(String name, String phoneNumber) {
        this.name = name;
        this.phoneNumber = phoneNumber;
    }
    
    /**
     * 회원 비활성화
     */
    public void deactivate() {
        this.active = false;
    }
    
    /**
     * 회원 활성화
     */
    public void activate() {
        this.active = true;
    }
    
    /**
     * 권한 변경
     */
    public void changeRole(MemberRole role) {
        this.role = role;
    }
}
