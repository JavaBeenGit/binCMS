-- V2: 기준 시드 (2026-10-12). 운영에도 필요한 데이터만: 역할·권한·역할권한·게시판·메뉴.
-- 관리자 계정은 BCrypt 가 필요해 AdminAccountInitializer 가 최초 기동 시 만든다. 샘플 콘텐츠는 넣지 않는다.

-- tb_roles (4건)
INSERT INTO `tb_roles` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `role_code`, `role_name`, `sort_order`, `use_yn`) VALUES (1,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','일반 사용자 역할','USER','일반 사용자',4,'Y');
INSERT INTO `tb_roles` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `role_code`, `role_name`, `sort_order`, `use_yn`) VALUES (2,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','모든 권한을 가진 시스템 관리자','SYSTEM_ADMIN','시스템 관리자',1,'Y');
INSERT INTO `tb_roles` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `role_code`, `role_name`, `sort_order`, `use_yn`) VALUES (3,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','시스템 관리 메뉴를 제외한 운영 관리자','OPERATION_ADMIN','운영 관리자',2,'Y');
INSERT INTO `tb_roles` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `role_code`, `role_name`, `sort_order`, `use_yn`) VALUES (4,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','기본 관리 기능만 접근 가능한 일반 관리자','GENERAL_ADMIN','일반 관리자',3,'Y');

-- tb_permissions (16건)
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (1,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','대시보드 메뉴 접근 권한','MENU_DASHBOARD','MENU','대시보드 접근',1,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (2,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','게시글 관리 메뉴 접근 권한','MENU_POST','MENU','게시글 관리 접근',2,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (3,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','통계 관리 메뉴 접근 권한','MENU_STATISTICS','MENU','통계 관리 접근',3,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (4,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','사용자 관리 메뉴 접근 권한','MENU_USER','MENU','사용자 관리 접근',4,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (5,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','시스템 > 메뉴 관리 접근 권한','MENU_SYSTEM_MENU','SYSTEM','메뉴 관리 접근',5,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (6,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','시스템 > 관리자 회원 관리 접근 권한','MENU_SYSTEM_ADMIN','SYSTEM','관리자 회원 관리 접근',6,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (7,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','시스템 > IP 관리 접근 권한','MENU_SYSTEM_IP','SYSTEM','IP 관리 접근',7,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (8,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','시스템 > 공통코드 관리 접근 권한','MENU_SYSTEM_CODE','SYSTEM','공통코드 관리 접근',8,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (9,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','시스템 > 게시판 설정 접근 권한','MENU_SYSTEM_BOARD','SYSTEM','게시판 설정 접근',9,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (10,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','시스템 > 역할/권한 관리 접근 권한','MENU_SYSTEM_ROLE','SYSTEM','역할/권한 관리 접근',10,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (11,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','컨텐츠 관리 메뉴 접근 권한','MENU_CONTENT','MENU','컨텐츠 관리 접근',11,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (12,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','데이터 조회 권한','DATA_READ','DATA','데이터 조회',1,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (13,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','데이터 등록 및 수정 권한','DATA_WRITE','DATA','데이터 등록/수정',2,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (14,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','데이터 삭제 권한','DATA_DELETE','DATA','데이터 삭제',3,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (15,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','팝업 관리 메뉴 접근 권한','MENU_POPUP','MENU','팝업 관리 접근',12,'Y');
INSERT INTO `tb_permissions` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `description`, `perm_code`, `perm_group`, `perm_name`, `sort_order`, `use_yn`) VALUES (16,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','인테리어 관리 메뉴 접근 권한','MENU_INTERIOR','MENU','인테리어 관리 접근',13,'Y');

-- tb_role_permissions (31건)
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (1,1,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (2,2,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (3,3,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (4,4,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (6,5,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (7,6,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (8,7,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (9,8,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (10,9,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (11,10,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (5,11,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (12,12,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (13,13,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (14,14,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (28,15,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (30,16,2);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (15,1,3);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (16,2,3);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (17,3,3);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (18,4,3);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (19,11,3);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (20,12,3);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (21,13,3);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (22,14,3);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (29,15,3);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (31,16,3);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (23,1,4);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (24,2,4);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (25,3,4);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (26,12,4);
INSERT INTO `tb_role_permissions` (`id`, `perm_id`, `role_id`) VALUES (27,13,4);

-- tb_boards (3건)
INSERT INTO `tb_boards` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `board_code`, `board_name`, `description`, `sort_order`, `use_yn`) VALUES (1,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','notice','공지사항','공지사항 게시판',1,'Y');
INSERT INTO `tb_boards` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `board_code`, `board_name`, `description`, `sort_order`, `use_yn`) VALUES (2,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','faq','자주묻는질문','자주묻는질문 게시판',2,'Y');
INSERT INTO `tb_boards` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `board_code`, `board_name`, `description`, `sort_order`, `use_yn`) VALUES (3,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system','free','자유게시판','자유게시판',3,'Y');

-- tb_menus (30건)
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (1,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'관리자 대시보드','DashboardOutlined','대시보드','ADMIN','/admin',NULL,1,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (2,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'게시글 관리','FileTextOutlined','게시글 관리','ADMIN','/admin/posts',NULL,2,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (3,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'통계 관리','BarChartOutlined','통계 관리','ADMIN','/admin/statistics',NULL,3,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (4,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'사용자 관리','UserOutlined','사용자 관리','ADMIN','/admin/users',NULL,4,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (5,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'시스템 관리','SettingOutlined','시스템 관리','ADMIN',NULL,NULL,5,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (6,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'메뉴 관리','MenuOutlined','메뉴 관리','ADMIN','/admin/system/menus',5,1,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (7,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'관리자 회원 관리','UserSwitchOutlined','관리자 회원 관리','ADMIN','/admin/system/admins',5,2,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (8,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'IP 관리','GlobalOutlined','IP 관리','ADMIN','/admin/system/ips',5,3,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (9,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'공통코드 관리','CodeOutlined','공통코드 관리','ADMIN','/admin/system/codes',5,4,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (10,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'게시판 설정','LayoutOutlined','게시판 설정','ADMIN','/admin/system/boards',5,5,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (11,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'역할/권한 관리','SafetyCertificateOutlined','권한관리','ADMIN','/admin/system/roles',5,6,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (12,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'컨텐츠 관리','FileTextOutlined','컨텐츠 관리','ADMIN','/admin/contents',NULL,3,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (13,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'팝업 관리','NotificationOutlined','팝업 관리','ADMIN','/admin/popups',NULL,4,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (14,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'공지사항 관리','FileTextOutlined','공지사항','ADMIN','/admin/posts/notice',2,1,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (15,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'자주묻는질문 관리','FileTextOutlined','자주묻는질문','ADMIN','/admin/posts/faq',2,2,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (16,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'자유게시판 관리','FileTextOutlined','자유게시판','ADMIN','/admin/posts/free',2,3,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (17,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'견적문의 관리','FileTextOutlined','견적문의','ADMIN','/admin/posts/qna',2,4,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (18,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'인테리어 관리','PictureOutlined','인테리어 관리','ADMIN',NULL,NULL,3,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (19,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'현장시공 관리','PictureOutlined','현장시공','ADMIN','/admin/interiors/onsite',18,1,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (20,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'셀프시공 팁 관리','PictureOutlined','셀프시공 팁','ADMIN','/admin/interiors/self-tip',18,2,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (21,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'인테리어스토리 관리','PictureOutlined','인테리어스토리','ADMIN','/admin/interiors/story',18,3,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (22,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'사용자 홈','HomeOutlined','HOME','USER','/user',NULL,1,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (23,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'공지사항','NotificationOutlined','공지사항','USER','/user/notice',NULL,2,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (24,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'자유게시판','CommentOutlined','자유게시판','USER','/user/free',NULL,3,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (25,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'인테리어','PictureOutlined','인테리어','USER',NULL,NULL,4,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (26,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'현장시공','PictureOutlined','현장시공','USER','/user/interior/onsite',25,1,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (27,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'셀프시공 팁','ToolOutlined','셀프시공','USER','/user/interior/self-tip',25,2,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (28,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',2,'인테리어스토리','BookOutlined','인테리어스토리','USER','/user/interior/story',25,3,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (29,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'자주묻는질문','QuestionCircleOutlined','자주묻는질문','USER','/user/faq',NULL,5,'Y');
INSERT INTO `tb_menus` (`id`, `mod_dt`, `mod_no`, `reg_dt`, `reg_no`, `depth`, `description`, `icon`, `menu_name`, `menu_type`, `menu_url`, `parent_id`, `sort_order`, `use_yn`) VALUES (30,CURRENT_TIMESTAMP(6),'system',CURRENT_TIMESTAMP(6),'system',1,'견적문의','FormOutlined','견적문의','USER','/user/inquiry',NULL,6,'Y');

