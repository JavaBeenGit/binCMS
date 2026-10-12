package com.bincms.domain.menu.service;

import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.menu.dto.MenuCreateRequest;
import com.bincms.domain.menu.dto.MenuResponse;
import com.bincms.domain.menu.dto.MenuUpdateRequest;
import com.bincms.domain.menu.entity.Menu;
import com.bincms.domain.menu.entity.MenuType;
import com.bincms.domain.menu.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 메뉴 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {
    
    private final MenuRepository menuRepository;
    
    /**
     * 메뉴 생성
     */
    @Transactional
    public MenuResponse createMenu(MenuCreateRequest request) {
        // 부모 메뉴가 있는 경우 검증
        if (request.getParentId() != null) {
            Menu parentMenu = menuRepository.findById(request.getParentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
            
            // 부모와 같은 타입인지 확인
            if (parentMenu.getMenuType() != request.getMenuType()) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
            }
        }
        
        Menu menu = Menu.builder()
            .menuType(request.getMenuType())
            .menuName(request.getMenuName())
            .menuUrl(request.getMenuUrl())
            .parentId(request.getParentId())
            .depth(request.getDepth())
            .sortOrder(request.getSortOrder())
            .icon(request.getIcon())
            .description(request.getDescription())
            .build();
        
        Menu savedMenu = menuRepository.save(menu);
        return MenuResponse.from(savedMenu);
    }
    
    /**
     * 메뉴 타입별 계층 구조 조회
     */
    public List<MenuResponse> getMenusByType(MenuType menuType, boolean includeInactive) {
        List<Menu> menus;
        if (includeInactive) {
            menus = menuRepository.findByMenuTypeOrderBySortOrderAscIdAsc(menuType);
        } else {
            menus = menuRepository.findByMenuTypeAndUseYnOrderBySortOrderAscIdAsc(menuType, "Y");
        }
        
        return buildMenuTree(menus);
    }
    
    /**
     * 전체 메뉴 조회 (플랫 리스트)
     */
    public List<MenuResponse> getAllMenus() {
        return menuRepository.findAll().stream()
            .map(MenuResponse::from)
            .collect(Collectors.toList());
    }
    
    /**
     * 메뉴 상세 조회
     */
    public MenuResponse getMenuById(Long id) {
        Menu menu = menuRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
        return MenuResponse.from(menu);
    }
    
    /**
     * 메뉴 수정
     */
    @Transactional
    public MenuResponse updateMenu(Long id, MenuUpdateRequest request) {
        Menu menu = menuRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
        
        menu.update(
            request.getMenuName(),
            request.getMenuUrl(),
            request.getSortOrder(),
            request.getIcon(),
            request.getDescription()
        );
        
        return MenuResponse.from(menu);
    }
    
    /**
     * 메뉴 삭제 (비활성화)
     */
    @Transactional
    public void deleteMenu(Long id) {
        Menu menu = menuRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
        
        // 자식 메뉴가 있는지 확인
        List<Menu> children = menuRepository.findByParentIdOrderBySortOrderAscIdAsc(id);
        if (!children.isEmpty()) {
            throw new BusinessException(ErrorCode.MENU_HAS_CHILDREN);
        }
        
        menu.deactivate();
    }
    
    /**
     * 메뉴 활성화
     */
    @Transactional
    public void activateMenu(Long id) {
        Menu menu = menuRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
        menu.activate();
    }
    
    /**
     * 메뉴 끄기 — 홈페이지(사용자 메뉴)·관리자 사이드메뉴에서 빠진다. 부모를 끄면 자식도 트리에서 함께 빠진다.
     * 삭제 대신 쓴다(홈페이지 메뉴 화면에는 삭제가 없다 — 2026-10-13 결정).
     */
    @Transactional
    public void deactivateMenu(Long id) {
        Menu menu = menuRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
        menu.deactivate();
    }

    /**
     * 순서 이동 — 같은 부모 아래 형제와 자리를 바꾼다. 끝에서 더 가면 그대로 둔다.
     * 형제의 정렬 순서를 1..n 으로 다시 매긴 뒤 교환하므로 같은 값이 섞여 있어도 안전하다.
     */
    @Transactional
    public void moveMenu(Long id, String direction) {
        boolean up = "up".equalsIgnoreCase(direction);
        if (!up && !"down".equalsIgnoreCase(direction)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        Menu menu = menuRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.MENU_NOT_FOUND));
        List<Menu> siblings = menu.getParentId() == null
            ? menuRepository.findByMenuTypeAndParentIdIsNullOrderBySortOrderAscIdAsc(menu.getMenuType())
            : menuRepository.findByMenuTypeAndParentIdOrderBySortOrderAscIdAsc(menu.getMenuType(), menu.getParentId());

        for (int i = 0; i < siblings.size(); i++) {
            siblings.get(i).changeSortOrder(i + 1);
        }
        int idx = -1;
        for (int i = 0; i < siblings.size(); i++) {
            if (siblings.get(i).getId().equals(id)) idx = i;
        }
        int target = up ? idx - 1 : idx + 1;
        if (idx < 0 || target < 0 || target >= siblings.size()) {
            return;
        }
        Menu other = siblings.get(target);
        Integer tmp = siblings.get(idx).getSortOrder();
        siblings.get(idx).changeSortOrder(other.getSortOrder());
        other.changeSortOrder(tmp);
    }

    /**
     * 메뉴 트리 구조 생성
     */
    private List<MenuResponse> buildMenuTree(List<Menu> menus) {
        Map<Long, MenuResponse> menuMap = new HashMap<>();
        List<MenuResponse> rootMenus = new ArrayList<>();
        
        // 1단계: 모든 메뉴를 MenuResponse로 변환하여 맵에 저장
        for (Menu menu : menus) {
            MenuResponse menuResponse = MenuResponse.from(menu);
            menuMap.put(menu.getId(), menuResponse);
        }
        
        // 2단계: 부모-자식 관계 설정
        for (Menu menu : menus) {
            MenuResponse menuResponse = menuMap.get(menu.getId());
            
            if (menu.getParentId() == null) {
                // 최상위 메뉴
                rootMenus.add(menuResponse);
            } else {
                // 자식 메뉴
                MenuResponse parent = menuMap.get(menu.getParentId());
                if (parent != null) {
                    parent.addChild(menuResponse);
                }
            }
        }
        
        // 3단계: 루트 메뉴 및 자식 메뉴를 sortOrder 기준으로 정렬
        sortMenuTree(rootMenus);
        
        return rootMenus;
    }
    
    /**
     * 메뉴 트리를 sortOrder 기준으로 재귀 정렬
     */
    private void sortMenuTree(List<MenuResponse> menus) {
        menus.sort((a, b) -> {
            int cmp = Integer.compare(a.getSortOrder(), b.getSortOrder());
            return cmp != 0 ? cmp : Long.compare(a.getId(), b.getId());
        });
        for (MenuResponse menu : menus) {
            if (menu.getChildren() != null && !menu.getChildren().isEmpty()) {
                sortMenuTree(menu.getChildren());
            }
        }
    }
}
