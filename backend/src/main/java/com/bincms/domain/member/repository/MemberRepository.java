package com.bincms.domain.member.repository;

import com.bincms.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 회원 Repository
 */
@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    /**
     * 로그인 ID로 회원 조회
     */
    Optional<Member> findByLoginId(String loginId);
    
    /**
     * 로그인 ID 존재 여부 확인
     */
    boolean existsByLoginId(String loginId);
    
    /**
     * 활성화된 회원 조회
     */
    Optional<Member> findByLoginIdAndActiveTrue(String loginId);
}
