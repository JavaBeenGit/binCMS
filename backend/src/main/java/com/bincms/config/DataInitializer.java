package com.bincms.config;

import com.bincms.domain.board.entity.Board;
import com.bincms.domain.board.repository.BoardRepository;
import com.bincms.domain.member.entity.Member;
import com.bincms.domain.member.repository.MemberRepository;
import com.bincms.domain.menu.entity.Menu;
import com.bincms.domain.menu.entity.MenuType;
import com.bincms.domain.menu.repository.MenuRepository;
import com.bincms.domain.role.entity.Permission;
import com.bincms.domain.role.entity.Role;
import com.bincms.domain.role.entity.RolePermission;
import com.bincms.domain.role.repository.PermissionRepository;
import com.bincms.domain.role.repository.RolePermissionRepository;
import com.bincms.domain.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 애플리케이션 초기 데이터 생성
 */
@Slf4j
@Component
@Order(1) // RoleMigrationRunner(Order=0) 이후에 실행
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {
    
    private final MemberRepository memberRepository;
    private final MenuRepository menuRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final BoardRepository boardRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(ApplicationArguments args) {
        initRolesAndPermissions();
        initAdminAccount();
        initAdminMenus();
        supplementMissingData();
        supplementPopupData();
        supplementPostSubMenus();
        supplementFreeBoardData();
        supplementInteriorData();
    }
    
    /**
     * 역할/권한 초기화
     */
    private void initRolesAndPermissions() {
        // 이미 역할이 있으면 스킵
        if (roleRepository.count() > 0) {
            log.info("Roles already exist, skipping initialization");
            return;
        }
        
        log.info("Initializing roles and permissions...");
        
        // ==================== 권한(Permission) 생성 ====================
        
        // 메뉴 접근 권한
        Permission permDashboard = createPermission("MENU_DASHBOARD", "대시보드 접근", "MENU", "대시보드 메뉴 접근 권한", 1);
        Permission permPost = createPermission("MENU_POST", "게시글 관리 접근", "MENU", "게시글 관리 메뉴 접근 권한", 2);
        Permission permStatistics = createPermission("MENU_STATISTICS", "통계 관리 접근", "MENU", "통계 관리 메뉴 접근 권한", 3);
        Permission permUser = createPermission("MENU_USER", "사용자 관리 접근", "MENU", "사용자 관리 메뉴 접근 권한", 4);
        Permission permSystemMenu = createPermission("MENU_SYSTEM_MENU", "메뉴 관리 접근", "SYSTEM", "시스템 > 메뉴 관리 접근 권한", 5);
        Permission permSystemAdmin = createPermission("MENU_SYSTEM_ADMIN", "관리자 회원 관리 접근", "SYSTEM", "시스템 > 관리자 회원 관리 접근 권한", 6);
        Permission permSystemIp = createPermission("MENU_SYSTEM_IP", "IP 관리 접근", "SYSTEM", "시스템 > IP 관리 접근 권한", 7);
        Permission permSystemCode = createPermission("MENU_SYSTEM_CODE", "공통코드 관리 접근", "SYSTEM", "시스템 > 공통코드 관리 접근 권한", 8);
        Permission permSystemBoard = createPermission("MENU_SYSTEM_BOARD", "게시판 설정 접근", "SYSTEM", "시스템 > 게시판 설정 접근 권한", 9);
        Permission permSystemRole = createPermission("MENU_SYSTEM_ROLE", "역할/권한 관리 접근", "SYSTEM", "시스템 > 역할/권한 관리 접근 권한", 10);
        Permission permContent = createPermission("MENU_CONTENT", "컨텐츠 관리 접근", "MENU", "컨텐츠 관리 메뉴 접근 권한", 11);
        
        // 데이터 조작 권한
        Permission permDataRead = createPermission("DATA_READ", "데이터 조회", "DATA", "데이터 조회 권한", 1);
        Permission permDataWrite = createPermission("DATA_WRITE", "데이터 등록/수정", "DATA", "데이터 등록 및 수정 권한", 2);
        Permission permDataDelete = createPermission("DATA_DELETE", "데이터 삭제", "DATA", "데이터 삭제 권한", 3);
        
        // ==================== 역할(Role) 생성 ====================
        
        // 일반 사용자
        Role userRole = createRole("USER", "일반 사용자", "일반 사용자 역할", 4);
        
        // 시스템 관리자 (모든 권한)
        Role systemAdmin = createRole("SYSTEM_ADMIN", "시스템 관리자", "모든 권한을 가진 시스템 관리자", 1);
        
        // 운영 관리자 (시스템 관리 메뉴 접근 불가)
        Role operationAdmin = createRole("OPERATION_ADMIN", "운영 관리자", "시스템 관리 메뉴를 제외한 운영 관리자", 2);
        
        // 일반 관리자
        Role generalAdmin = createRole("GENERAL_ADMIN", "일반 관리자", "기본 관리 기능만 접근 가능한 일반 관리자", 3);
        
        // ==================== 역할-권한 매핑 ====================
        
        // 시스템 관리자: 모든 권한
        List<Permission> allPermissions = List.of(
            permDashboard, permPost, permStatistics, permUser, permContent,
            permSystemMenu, permSystemAdmin, permSystemIp, permSystemCode, permSystemBoard, permSystemRole,
            permDataRead, permDataWrite, permDataDelete
        );
        assignPermissions(systemAdmin, allPermissions);
        
        // 운영 관리자: 시스템 관리 메뉴 제외
        List<Permission> operationPermissions = List.of(
            permDashboard, permPost, permStatistics, permUser, permContent,
            permDataRead, permDataWrite, permDataDelete
        );
        assignPermissions(operationAdmin, operationPermissions);
        
        // 일반 관리자: 기본 메뉴만
        List<Permission> generalPermissions = List.of(
            permDashboard, permPost, permStatistics,
            permDataRead, permDataWrite
        );
        assignPermissions(generalAdmin, generalPermissions);
        
        log.info("Roles and permissions initialized successfully");
    }
    
    private Permission createPermission(String code, String name, String group, String description, int sortOrder) {
        Permission permission = Permission.builder()
                .permCode(code)
                .permName(name)
                .permGroup(group)
                .description(description)
                .sortOrder(sortOrder)
                .build();
        return permissionRepository.save(permission);
    }
    
    private Role createRole(String code, String name, String description, int sortOrder) {
        Role role = Role.builder()
                .roleCode(code)
                .roleName(name)
                .description(description)
                .sortOrder(sortOrder)
                .build();
        return roleRepository.save(role);
    }
    
    private void assignPermissions(Role role, List<Permission> permissions) {
        for (Permission permission : permissions) {
            RolePermission rp = RolePermission.builder()
                    .role(role)
                    .permission(permission)
                    .build();
            rolePermissionRepository.save(rp);
        }
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
        
        // 시스템 관리자 역할 조회
        Role systemAdminRole = roleRepository.findByRoleCode("SYSTEM_ADMIN")
                .orElseThrow(() -> new RuntimeException("SYSTEM_ADMIN role not found"));
        
        // Admin 계정 생성
        Member admin = Member.builder()
                .loginId(adminLoginId)
                .email(null)
                .password(passwordEncoder.encode("1234"))
                .name("관리자")
                .role(systemAdminRole)
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
        
        // 5-6. 권한관리 (depth 2)
        Menu roleManagement = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("권한관리")
                .menuUrl("/admin/system/roles")
                .parentId(systemId)
                .depth(2)
                .sortOrder(6)
                .icon("SafetyCertificateOutlined")
                .description("역할/권한 관리")
                .build();
        menuRepository.save(roleManagement);
        
        // 6. 컨텐츠 관리 (depth 1)
        Menu contentManagement = Menu.builder()
                .menuType(MenuType.ADMIN)
                .menuName("컨텐츠 관리")
                .menuUrl("/admin/contents")
                .parentId(null)
                .depth(1)
                .sortOrder(3)
                .icon("FileTextOutlined")
                .description("컨텐츠 관리")
                .build();
        menuRepository.save(contentManagement);
        
        log.info("Admin menus initialized successfully - total: 12 menus");
    }
    
    /**
     * 기존 DB에 누락된 데이터 보충 (이미 초기화된 DB에 새로 추가된 항목 반영)
     */
    private void supplementMissingData() {
        log.info("Checking for missing data to supplement...");
        
        // 1. MENU_CONTENT 권한 보충
        if (!permissionRepository.existsByPermCode("MENU_CONTENT")) {
            Permission permContent = Permission.builder()
                    .permCode("MENU_CONTENT")
                    .permName("컨텐츠 관리 접근")
                    .permGroup("MENU")
                    .description("컨텐츠 관리 메뉴 접근 권한")
                    .sortOrder(11)
                    .build();
            permissionRepository.save(permContent);
            log.info("Supplemented missing permission: MENU_CONTENT");
            
            // SYSTEM_ADMIN 역할에 매핑
            roleRepository.findByRoleCode("SYSTEM_ADMIN").ifPresent(role -> {
                RolePermission rp = RolePermission.builder()
                        .role(role)
                        .permission(permContent)
                        .build();
                rolePermissionRepository.save(rp);
                log.info("Mapped MENU_CONTENT to SYSTEM_ADMIN");
            });
            
            // OPERATION_ADMIN 역할에 매핑
            roleRepository.findByRoleCode("OPERATION_ADMIN").ifPresent(role -> {
                RolePermission rp = RolePermission.builder()
                        .role(role)
                        .permission(permContent)
                        .build();
                rolePermissionRepository.save(rp);
                log.info("Mapped MENU_CONTENT to OPERATION_ADMIN");
            });
        }
        
        // 2. 컨텐츠 관리 메뉴 보충
        List<Menu> allMenus = menuRepository.findByMenuTypeOrderBySortOrderAscIdAsc(MenuType.ADMIN);
        boolean hasContentMenu = allMenus.stream()
                .anyMatch(m -> "/admin/contents".equals(m.getMenuUrl()));
        
        if (!hasContentMenu) {
            Menu contentMenu = Menu.builder()
                    .menuType(MenuType.ADMIN)
                    .menuName("컨텐츠 관리")
                    .menuUrl("/admin/contents")
                    .parentId(null)
                    .depth(1)
                    .sortOrder(3)
                    .icon("FileTextOutlined")
                    .description("컨텐츠 관리")
                    .build();
            menuRepository.save(contentMenu);
            log.info("Supplemented missing menu: 컨텐츠 관리");
        }
        
        log.info("Missing data supplement check completed");
    }
    
    /**
     * 게시글 관리 하위 메뉴 보충 (공지사항, 자주묻는질문, 견적문의)
     */
    private void supplementPostSubMenus() {
        List<Menu> allMenus = menuRepository.findByMenuTypeOrderBySortOrderAscIdAsc(MenuType.ADMIN);
        
        // 게시글 관리 부모 메뉴 찾기
        Menu postParent = allMenus.stream()
                .filter(m -> "/admin/posts".equals(m.getMenuUrl()))
                .findFirst().orElse(null);
        
        if (postParent == null) return;
        Long parentId = postParent.getId();
        
        // 하위 메뉴가 이미 있는지 체크
        boolean hasNotice = allMenus.stream().anyMatch(m -> "/admin/posts/notice".equals(m.getMenuUrl()));
        boolean hasFaq = allMenus.stream().anyMatch(m -> "/admin/posts/faq".equals(m.getMenuUrl()));
        boolean hasFree = allMenus.stream().anyMatch(m -> "/admin/posts/free".equals(m.getMenuUrl()));
        boolean hasQna = allMenus.stream().anyMatch(m -> "/admin/posts/qna".equals(m.getMenuUrl()));
        
        if (!hasNotice) {
            menuRepository.save(Menu.builder()
                    .menuType(MenuType.ADMIN).menuName("공지사항")
                    .menuUrl("/admin/posts/notice").parentId(parentId)
                    .depth(2).sortOrder(1).icon("FileTextOutlined")
                    .description("공지사항 관리").build());
            log.info("Supplemented missing menu: 공지사항");
        }
        if (!hasFaq) {
            menuRepository.save(Menu.builder()
                    .menuType(MenuType.ADMIN).menuName("자주묻는질문")
                    .menuUrl("/admin/posts/faq").parentId(parentId)
                    .depth(2).sortOrder(2).icon("FileTextOutlined")
                    .description("자주묻는질문 관리").build());
            log.info("Supplemented missing menu: 자주묻는질문");
        }
        if (!hasFree) {
            menuRepository.save(Menu.builder()
                    .menuType(MenuType.ADMIN).menuName("자유게시판")
                    .menuUrl("/admin/posts/free").parentId(parentId)
                    .depth(2).sortOrder(3).icon("FileTextOutlined")
                    .description("자유게시판 관리").build());
            log.info("Supplemented missing menu: 자유게시판");
        }
        if (!hasQna) {
            menuRepository.save(Menu.builder()
                    .menuType(MenuType.ADMIN).menuName("견적문의")
                    .menuUrl("/admin/posts/qna").parentId(parentId)
                    .depth(2).sortOrder(4).icon("FileTextOutlined")
                    .description("견적문의 관리").build());
            log.info("Supplemented missing menu: 견적문의");
        }
    }
    
    /**
     * 자유게시판(TB_BOARDS) 데이터 보충
     */
    private void supplementFreeBoardData() {
        // notice 게시판이 없으면 생성
        if (!boardRepository.existsByBoardCode("notice")) {
            boardRepository.save(Board.builder()
                    .boardCode("notice").boardName("공지사항")
                    .description("공지사항 게시판").sortOrder(1).build());
            log.info("Supplemented missing board: notice (공지사항)");
        }
        // faq 게시판이 없으면 생성
        if (!boardRepository.existsByBoardCode("faq")) {
            boardRepository.save(Board.builder()
                    .boardCode("faq").boardName("자주묻는질문")
                    .description("자주묻는질문 게시판").sortOrder(2).build());
            log.info("Supplemented missing board: faq (자주묻는질문)");
        }
        // free 게시판이 없으면 생성
        if (!boardRepository.existsByBoardCode("free")) {
            boardRepository.save(Board.builder()
                    .boardCode("free").boardName("자유게시판")
                    .description("자유게시판").sortOrder(3).build());
            log.info("Supplemented missing board: free (자유게시판)");
        }
    }

    /**
     * 팝업 관리 메뉴/권한 보충
     */
    private void supplementPopupData() {
        // 1. MENU_POPUP 권한 보충
        if (!permissionRepository.existsByPermCode("MENU_POPUP")) {
            Permission permPopup = Permission.builder()
                    .permCode("MENU_POPUP")
                    .permName("팝업 관리 접근")
                    .permGroup("MENU")
                    .description("팝업 관리 메뉴 접근 권한")
                    .sortOrder(12)
                    .build();
            permissionRepository.save(permPopup);
            log.info("Supplemented missing permission: MENU_POPUP");
            
            // SYSTEM_ADMIN 역할에 매핑
            roleRepository.findByRoleCode("SYSTEM_ADMIN").ifPresent(role -> {
                RolePermission rp = RolePermission.builder()
                        .role(role)
                        .permission(permPopup)
                        .build();
                rolePermissionRepository.save(rp);
                log.info("Mapped MENU_POPUP to SYSTEM_ADMIN");
            });
            
            // OPERATION_ADMIN 역할에 매핑
            roleRepository.findByRoleCode("OPERATION_ADMIN").ifPresent(role -> {
                RolePermission rp = RolePermission.builder()
                        .role(role)
                        .permission(permPopup)
                        .build();
                rolePermissionRepository.save(rp);
                log.info("Mapped MENU_POPUP to OPERATION_ADMIN");
            });
        }
        
        // 2. 팝업 관리 메뉴 보충
        List<Menu> allMenus = menuRepository.findByMenuTypeOrderBySortOrderAscIdAsc(MenuType.ADMIN);
        boolean hasPopupMenu = allMenus.stream()
                .anyMatch(m -> "/admin/popups".equals(m.getMenuUrl()));
        
        if (!hasPopupMenu) {
            Menu popupMenu = Menu.builder()
                    .menuType(MenuType.ADMIN)
                    .menuName("팝업 관리")
                    .menuUrl("/admin/popups")
                    .parentId(null)
                    .depth(1)
                    .sortOrder(4)
                    .icon("NotificationOutlined")
                    .description("팝업 관리")
                    .build();
            menuRepository.save(popupMenu);
            log.info("Supplemented missing menu: 팝업 관리");
        }
    }
    
    /**
     * 인테리어 관리 메뉴/권한 보충
     */
    private void supplementInteriorData() {
        // 1. MENU_INTERIOR 권한 보충
        if (!permissionRepository.existsByPermCode("MENU_INTERIOR")) {
            Permission permInterior = Permission.builder()
                    .permCode("MENU_INTERIOR")
                    .permName("인테리어 관리 접근")
                    .permGroup("MENU")
                    .description("인테리어 관리 메뉴 접근 권한")
                    .sortOrder(13)
                    .build();
            permissionRepository.save(permInterior);
            log.info("Supplemented missing permission: MENU_INTERIOR");
            
            // SYSTEM_ADMIN 역할에 매핑
            roleRepository.findByRoleCode("SYSTEM_ADMIN").ifPresent(role -> {
                RolePermission rp = RolePermission.builder()
                        .role(role)
                        .permission(permInterior)
                        .build();
                rolePermissionRepository.save(rp);
                log.info("Mapped MENU_INTERIOR to SYSTEM_ADMIN");
            });
            
            // OPERATION_ADMIN 역할에 매핑
            roleRepository.findByRoleCode("OPERATION_ADMIN").ifPresent(role -> {
                RolePermission rp = RolePermission.builder()
                        .role(role)
                        .permission(permInterior)
                        .build();
                rolePermissionRepository.save(rp);
                log.info("Mapped MENU_INTERIOR to OPERATION_ADMIN");
            });
        }
        
        // 2. 인테리어 관리 부모 메뉴 보충
        List<Menu> allMenus = menuRepository.findByMenuTypeOrderBySortOrderAscIdAsc(MenuType.ADMIN);
        boolean hasInteriorParent = allMenus.stream()
                .anyMatch(m -> "/admin/interiors".equals(m.getMenuUrl()) || "인테리어 관리".equals(m.getMenuName()));
        
        if (!hasInteriorParent) {
            // 부모 메뉴: 인테리어 관리
            Menu interiorParent = Menu.builder()
                    .menuType(MenuType.ADMIN)
                    .menuName("인테리어 관리")
                    .menuUrl(null)  // 부모 메뉴는 URL 없음
                    .parentId(null)
                    .depth(1)
                    .sortOrder(3)  // 게시글 관리(2) 다음
                    .icon("PictureOutlined")
                    .description("인테리어 관리")
                    .build();
            menuRepository.save(interiorParent);
            Long parentId = interiorParent.getId();
            log.info("Supplemented missing menu: 인테리어 관리");
            
            // 하위 메뉴: 현장시공
            menuRepository.save(Menu.builder()
                    .menuType(MenuType.ADMIN).menuName("현장시공")
                    .menuUrl("/admin/interiors/onsite").parentId(parentId)
                    .depth(2).sortOrder(1).icon("PictureOutlined")
                    .description("현장시공 관리").build());
            
            // 하위 메뉴: 셀프시공 팁
            menuRepository.save(Menu.builder()
                    .menuType(MenuType.ADMIN).menuName("셀프시공 팁")
                    .menuUrl("/admin/interiors/self-tip").parentId(parentId)
                    .depth(2).sortOrder(2).icon("PictureOutlined")
                    .description("셀프시공 팁 관리").build());
            
            // 하위 메뉴: 인테리어스토리
            menuRepository.save(Menu.builder()
                    .menuType(MenuType.ADMIN).menuName("인테리어스토리")
                    .menuUrl("/admin/interiors/story").parentId(parentId)
                    .depth(2).sortOrder(3).icon("PictureOutlined")
                    .description("인테리어스토리 관리").build());
            
            log.info("Supplemented interior sub-menus: 현장시공, 셀프시공 팁, 인테리어스토리");
        }
    }
}
