package com.bincms.domain.content.repository;

import com.bincms.domain.content.entity.Content;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {

    Page<Content> findByUseYnOrderBySortOrderAscIdDesc(String useYn, Pageable pageable);

    Page<Content> findAllByOrderBySortOrderAscIdDesc(Pageable pageable);

    Page<Content> findByCategoryAndUseYnOrderBySortOrderAscIdDesc(String category, String useYn, Pageable pageable);

    Optional<Content> findByContentKey(String contentKey);

    boolean existsByContentKey(String contentKey);

    @Query("SELECT c FROM Content c WHERE c.useYn = :useYn " +
           "AND (c.title LIKE %:keyword% OR c.contentKey LIKE %:keyword% OR c.category LIKE %:keyword%) " +
           "ORDER BY c.sortOrder ASC, c.id DESC")
    Page<Content> searchByKeyword(@Param("useYn") String useYn,
                                   @Param("keyword") String keyword,
                                   Pageable pageable);
}
