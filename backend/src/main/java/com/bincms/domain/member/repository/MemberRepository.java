package com.bincms.domain.member.repository;

import com.bincms.domain.member.entity.Member;
import com.bincms.domain.member.entity.MemberRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    /**
     * 권한별 회원 목록 조회 (검색 포함)
     */
    @Query("SELECT m FROM Member m WHERE m.role = :role " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "m.name LIKE %:keyword% OR m.loginId LIKE %:keyword% OR m.email LIKE %:keyword%) " +
           "ORDER BY m.regDt DESC")
    Page<Member> findByRoleAndKeyword(@Param("role") MemberRole role,
                                      @Param("keyword") String keyword,
                                      Pageable pageable);
}
