package com.bincms.domain.member.entity;

import com.bincms.common.entity.BaseEntity;
import com.bincms.domain.role.entity.Role;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

/**
 * 회원 엔티티
 */
@Entity
@Table(name = "TB_MEMBERS", indexes = {
    @Index(name = "IDX_MEMBERS_LOGIN_ID", columnList = "LGN_ID")
})
@Comment("회원")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("회원 ID")
    private Long id;
    
    /**
     * 로그인 ID
     */
    @Column(name = "LGN_ID", nullable = false, unique = true, length = 50)
    @Comment("로그인 ID")
    private String loginId;
    
    /**
     * 이메일 (선택사항)
     */
    @Column(name = "EMAIL", length = 100)
    @Comment("이메일")
    private String email;
    
    /**
     * 비밀번호 (암호화 저장)
     */
    @Column(name = "PASSWORD", nullable = false)
    @Comment("비밀번호")
    private String password;
    
    /**
     * 이름
     */
    @Column(name = "NAME", nullable = false, length = 50)
    @Comment("이름")
    private String name;
    
    /**
     * 전화번호
     */
    @Column(name = "PHONE_NUMBER", length = 20)
    @Comment("전화번호")
    private String phoneNumber;
    
    /**
     * 회원 역할 (TB_ROLES FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROLE_ID", nullable = false,
            foreignKey = @ForeignKey(name = "fk_members_role"))
    @Comment("역할 ID")
    private Role role;
    
    /**
     * 활성화 여부
     */
    @Column(name = "ACTIVE", nullable = false)
    @Comment("활성화 여부")
    private Boolean active;
    
    @Builder
    public Member(String loginId, String email, String password, String name, String phoneNumber, Role role) {
        this.loginId = loginId;
        this.email = email;
        this.password = password;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.role = role;
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
     * 관리자 회원 정보 수정 (이메일 포함)
     */
    public void updateAdminInfo(String name, String email, String phoneNumber) {
        this.name = name;
        this.email = email;
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
     * 역할 변경
     */
    public void changeRole(Role role) {
        this.role = role;
    }
    
    /**
     * 역할 코드 조회 (편의 메서드)
     */
    public String getRoleCode() {
        return this.role != null ? this.role.getRoleCode() : null;
    }
}
