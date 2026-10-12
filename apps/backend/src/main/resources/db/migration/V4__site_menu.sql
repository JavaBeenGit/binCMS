-- V4: 홈페이지 메뉴 연동 (2026-10-13, 사용자 결정)
-- 1) 홈페이지 헤더가 DB 사용자 메뉴(USER)를 읽기 시작한다 → 자유게시판은 메뉴에서 숨긴다(use_yn=N, 코드·라우트는 유지).
-- 2) 운영자(형)가 직접 켜고 끄도록 "홈페이지 메뉴" 관리자 메뉴 + 권한(MENU_SITE_MENU)을 모든 관리자 역할에 준다.
-- id 가 아니라 menu_url / perm_code / role_code 기준.

UPDATE tb_menus SET use_yn = 'N', description = '자유게시판 (2026-10-13 숨김 — 홈페이지 메뉴 화면에서 다시 켤 수 있음)'
 WHERE menu_type = 'USER' AND menu_url = '/user/free';

INSERT INTO tb_permissions (mod_dt, mod_no, reg_dt, reg_no, description, perm_code, perm_group, perm_name, sort_order, use_yn)
VALUES (CURRENT_TIMESTAMP(6), 'system', CURRENT_TIMESTAMP(6), 'system',
        '홈페이지 메뉴(켜기/끄기/순서) 접근 권한', 'MENU_SITE_MENU', 'MENU', '홈페이지 메뉴 접근', 14, 'Y');

INSERT INTO tb_role_permissions (perm_id, role_id)
SELECT p.id, r.id
  FROM tb_permissions p
  JOIN tb_roles r ON r.role_code IN ('SYSTEM_ADMIN', 'OPERATION_ADMIN', 'GENERAL_ADMIN')
 WHERE p.perm_code = 'MENU_SITE_MENU';

-- 팝업 관리(6) 다음에 끼워 넣는다: 커뮤니티·회원 7→8, 시스템 관리 8→9
UPDATE tb_menus SET sort_order = sort_order + 1
 WHERE menu_type = 'ADMIN' AND parent_id IS NULL AND sort_order >= 7;

INSERT INTO tb_menus (mod_dt, mod_no, reg_dt, reg_no, depth, description, icon, menu_name, menu_type, menu_url, parent_id, sort_order, use_yn)
VALUES (CURRENT_TIMESTAMP(6), 'system', CURRENT_TIMESTAMP(6), 'system', 1,
        '홈페이지 상단 메뉴 켜기/끄기/순서 (운영자용)', 'BarsOutlined', '홈페이지 메뉴', 'ADMIN', '/admin/site-menus', NULL, 7, 'Y');
