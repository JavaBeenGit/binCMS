package com.bincms.domain.interior.repository;

import com.bincms.domain.interior.entity.Interior;
import com.bincms.domain.interior.entity.InteriorCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 인테리어 Repository
 */
@Repository
public interface InteriorRepository extends JpaRepository<Interior, Long> {
    
    Page<Interior> findByCategoryAndUseYnOrderBySortOrderAscIdDesc(
            InteriorCategory category, String useYn, Pageable pageable);
    
    Page<Interior> findByUseYnOrderBySortOrderAscIdDesc(String useYn, Pageable pageable);
    
    @Query("SELECT i FROM Interior i WHERE i.category = :category AND i.useYn = :useYn " +
           "AND (i.title LIKE %:keyword% OR i.content LIKE %:keyword%) " +
           "ORDER BY i.sortOrder ASC, i.id DESC")
    Page<Interior> searchByCategoryAndKeyword(
            @Param("category") InteriorCategory category,
            @Param("useYn") String useYn,
            @Param("keyword") String keyword,
            Pageable pageable);
    
    @Query("SELECT i FROM Interior i WHERE i.useYn = :useYn " +
           "AND (i.title LIKE %:keyword% OR i.content LIKE %:keyword%) " +
           "ORDER BY i.sortOrder ASC, i.id DESC")
    Page<Interior> searchByKeyword(
            @Param("useYn") String useYn,
            @Param("keyword") String keyword,
            Pageable pageable);
}
