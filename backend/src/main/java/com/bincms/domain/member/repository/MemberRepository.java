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
     * 이메일로 회원 조회
     */
    Optional<Member> findByEmail(String email);
    
    /**
     * 이메일 존재 여부 확인
     */
    boolean existsByEmail(String email);
    
    /**
     * 활성화된 회원 조회
     */
    Optional<Member> findByEmailAndActiveTrue(String email);
}
