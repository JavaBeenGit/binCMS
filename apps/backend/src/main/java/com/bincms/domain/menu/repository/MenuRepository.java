package com.bincms.domain.menu.repository;

import com.bincms.domain.menu.entity.Menu;
import com.bincms.domain.menu.entity.MenuType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    
    /**
     * 메뉴 타입별 조회 (정렬 순서대로)
     */
    List<Menu> findByMenuTypeAndUseYnOrderBySortOrderAscIdAsc(MenuType menuType, String useYn);
    
    /**
     * 메뉴 타입별 전체 조회 (정렬 순서대로)
     */
    List<Menu> findByMenuTypeOrderBySortOrderAscIdAsc(MenuType menuType);
    
    /**
     * 부모 메뉴 ID로 자식 메뉴 조회
     */
    List<Menu> findByParentIdAndUseYnOrderBySortOrderAscIdAsc(Long parentId, String useYn);
    
    /**
     * 부모 메뉴 ID로 전체 자식 메뉴 조회
     */
    List<Menu> findByParentIdOrderBySortOrderAscIdAsc(Long parentId);

    /** 순서 이동용 — 최상위 형제(부모 없음), 켜짐/꺼짐 모두 */
    List<Menu> findByMenuTypeAndParentIdIsNullOrderBySortOrderAscIdAsc(MenuType menuType);

    /** 순서 이동용 — 같은 부모의 형제, 켜짐/꺼짐 모두 */
    List<Menu> findByMenuTypeAndParentIdOrderBySortOrderAscIdAsc(MenuType menuType, Long parentId);
}
