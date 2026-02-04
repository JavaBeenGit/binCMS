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
        
        return rootMenus;
    }
}
