package com.bincms.domain.popup.repository;

import com.bincms.domain.popup.entity.Popup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PopupRepository extends JpaRepository<Popup, Long> {

    Page<Popup> findAllByOrderBySortOrderAscIdDesc(Pageable pageable);

    Page<Popup> findByUseYnOrderBySortOrderAscIdDesc(String useYn, Pageable pageable);

    @Query("SELECT p FROM Popup p WHERE " +
           "(p.title LIKE %:keyword%) " +
           "ORDER BY p.sortOrder ASC, p.id DESC")
    Page<Popup> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /** 현재 노출 대상인 활성 팝업 조회 */
    @Query("SELECT p FROM Popup p WHERE p.useYn = 'Y' " +
           "AND (p.startDt IS NULL OR p.startDt <= :now) " +
           "AND (p.endDt IS NULL OR p.endDt >= :now) " +
           "ORDER BY p.sortOrder ASC, p.id DESC")
    List<Popup> findActivePopups(@Param("now") LocalDateTime now);
}
