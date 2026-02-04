package com.bincms.config;

import com.bincms.domain.member.entity.Member;
import com.bincms.domain.member.entity.MemberRole;
import com.bincms.domain.member.repository.MemberRepository;
import com.bincms.domain.menu.entity.Menu;
import com.bincms.domain.menu.entity.MenuType;
import com.bincms.domain.menu.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 애플리케이션 초기 데이터 생성
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {
    
    private final MemberRepository memberRepository;
    private final MenuRepository menuRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(ApplicationArguments args) {
        initAdminAccount();
        initAdminMenus();
    }
    
    /**
     * Admin 계정 초기화
     */
    private void initAdminAccount() {
        String adminLoginId = "admin";
        
        // 이미 admin 계정이 있으면 스킵
        if (memberRepository.existsByLoginId(adminLoginId)) {
            log.info("Admin account already exists");
            return;
        }
        
        // Admin 계정 생성
        Member admin = Member.builder()
                .loginId(adminLoginId)
                .email(null)  // 이메일은 선택사항
                .password(passwordEncoder.encode("1234"))
                .name("관리자")
                .role(MemberRole.ADMIN)
                .build();
        
        memberRepository.save(admin);
        log.info("Admin account created - loginId: admin, password: 1234");
    }
    
    /**
     * 관리자 메뉴 초기화
     */
    private void initAdminMenus() {
        // 이미 메뉴가 있으면 스킵
        if (menuRepository.count() > 0) {
            log.info("Menus already exist, skipping initialization");
            return;
        }
        
        log.info("Initializing admin menus...");
        
        // 1. 대시보드 (depth 1)
        Menu dashboard = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("대시보드")
                .menuUrl("/admin")
                .parentId(null)
                .depth(1)
                .sortOrder(1)
                .icon("DashboardOutlined")
                .description("관리자 대시보드")
                .build();
        menuRepository.save(dashboard);
        
        // 2. 게시글 관리 (depth 1)
        Menu posts = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("게시글 관리")
                .menuUrl("/admin/posts")
                .parentId(null)
                .depth(1)
                .sortOrder(2)
                .icon("FileTextOutlined")
                .description("게시글 관리")
                .build();
        menuRepository.save(posts);
        
        // 3. 통계 관리 (depth 1)
        Menu statistics = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("통계 관리")
                .menuUrl("/admin/statistics")
                .parentId(null)
                .depth(1)
                .sortOrder(3)
                .icon("BarChartOutlined")
                .description("통계 관리")
                .build();
        menuRepository.save(statistics);
        
        // 4. 사용자 관리 (depth 1)
        Menu users = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("사용자 관리")
                .menuUrl("/admin/users")
                .parentId(null)
                .depth(1)
                .sortOrder(4)
                .icon("UserOutlined")
                .description("사용자 관리")
                .build();
        menuRepository.save(users);
        
        // 5. 시스템 관리 (depth 1, 부모 메뉴)
        Menu system = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("시스템 관리")
                .menuUrl(null)  // 부모 메뉴는 URL 없음
                .parentId(null)
                .depth(1)
                .sortOrder(5)
                .icon("SettingOutlined")
                .description("시스템 관리")
                .build();
        menuRepository.save(system);
        Long systemId = system.getId();
        
        // 5-1. 메뉴 관리 (depth 2)
        Menu menuManagement = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("메뉴 관리")
                .menuUrl("/admin/system/menus")
                .parentId(systemId)
                .depth(2)
                .sortOrder(1)
                .icon("MenuOutlined")
                .description("메뉴 관리")
                .build();
        menuRepository.save(menuManagement);
        
        // 5-2. 관리자 회원 관리 (depth 2)
        Menu adminManagement = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("관리자 회원 관리")
                .menuUrl("/admin/system/admins")
                .parentId(systemId)
                .depth(2)
                .sortOrder(2)
                .icon("UserSwitchOutlined")
                .description("관리자 회원 관리")
                .build();
        menuRepository.save(adminManagement);
        
        // 5-3. IP 관리 (depth 2)
        Menu ipManagement = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("IP 관리")
                .menuUrl("/admin/system/ips")
                .parentId(systemId)
                .depth(2)
                .sortOrder(3)
                .icon("GlobalOutlined")
                .description("IP 관리")
                .build();
        menuRepository.save(ipManagement);
        
        // 5-4. 공통코드 관리 (depth 2)
        Menu codeManagement = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("공통코드 관리")
                .menuUrl("/admin/system/codes")
                .parentId(systemId)
                .depth(2)
                .sortOrder(4)
                .icon("CodeOutlined")
                .description("공통코드 관리")
                .build();
        menuRepository.save(codeManagement);
        
        // 5-5. 게시판 설정 (depth 2)
        Menu boardSettings = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("게시판 설정")
                .menuUrl("/admin/system/boards")
                .parentId(systemId)
                .depth(2)
                .sortOrder(5)
                .icon("LayoutOutlined")
                .description("게시판 설정")
                .build();
        menuRepository.save(boardSettings);
        
        log.info("Admin menus initialized successfully - total: 10 menus");
    }
}
