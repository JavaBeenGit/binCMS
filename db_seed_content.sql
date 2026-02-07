-- 컨텐츠 관리 메뉴/권한 데이터 추가 스크립트

-- 1. MENU_CONTENT 권한 추가 (중복 방지)
INSERT INTO tb_permissions (permission_name, description, reg_dt, mod_dt)
SELECT 'MENU_CONTENT', '컨텐츠 관리 메뉴 접근 권한', NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tb_permissions WHERE permission_name = 'MENU_CONTENT');

-- 2. SYSTEM_ADMIN 역할에 MENU_CONTENT 권한 매핑
INSERT INTO tb_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tb_roles r, tb_permissions p
WHERE r.role_name = 'SYSTEM_ADMIN' AND p.permission_name = 'MENU_CONTENT'
AND NOT EXISTS (
    SELECT 1 FROM tb_role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- 3. OPERATION_ADMIN 역할에 MENU_CONTENT 권한 매핑
INSERT INTO tb_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM tb_roles r, tb_permissions p
WHERE r.role_name = 'OPERATION_ADMIN' AND p.permission_name = 'MENU_CONTENT'
AND NOT EXISTS (
    SELECT 1 FROM tb_role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- 4. 컨텐츠 관리 메뉴 추가 (중복 방지)
INSERT INTO tb_menus (menu_type, menu_name, menu_url, depth, sort_order, icon, description, use_yn, reg_dt, mod_dt)
SELECT 'ADMIN', '컨텐츠 관리', '/admin/contents', 1, 3, 'FileTextOutlined', '컨텐츠 관리', 'Y', NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tb_menus WHERE menu_url = '/admin/contents');

-- 5. 확인
SELECT 'PERMISSIONS' AS section, id, permission_name FROM tb_permissions WHERE permission_name = 'MENU_CONTENT';
SELECT 'MENUS' AS section, id, menu_name, menu_url FROM tb_menus WHERE menu_url = '/admin/contents';
SELECT 'ROLE_PERMS' AS section, rp.role_id, r.role_name, rp.permission_id, p.permission_name
FROM tb_role_permissions rp
JOIN tb_roles r ON r.id = rp.role_id
JOIN tb_permissions p ON p.id = rp.permission_id
WHERE p.permission_name = 'MENU_CONTENT';
