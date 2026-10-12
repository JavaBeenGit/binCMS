-- V3: 7단계 — 관리자 메뉴를 운영자(형) 기준으로 단순화. 스키마 변경 없음(데이터만).
-- id 가 아니라 menu_url / perm_code / role_code 기준으로 바꾼다 (로컬·운영 DB 의 id 가 시드와 달라도 안전).
-- 결과 트리: 대시보드 · 시공사례 · 공지사항 · 자주묻는질문 · 견적문의 · 팝업 관리 · [커뮤니티·회원] · [시스템 관리]

-- 1) 플레이스홀더(통계 · IP 관리 · 공통코드) 권한 · 역할권한 · 메뉴 삭제
DELETE rp FROM tb_role_permissions rp
  JOIN tb_permissions p ON p.id = rp.perm_id
 WHERE p.perm_code IN ('MENU_STATISTICS', 'MENU_SYSTEM_IP', 'MENU_SYSTEM_CODE');

DELETE FROM tb_permissions
 WHERE perm_code IN ('MENU_STATISTICS', 'MENU_SYSTEM_IP', 'MENU_SYSTEM_CODE');

DELETE FROM tb_menus
 WHERE menu_type = 'ADMIN'
   AND menu_url IN ('/admin/statistics', '/admin/system/ips', '/admin/system/codes');

-- 2) 운영 메뉴를 최상위로 (대시보드 1 · 시공사례 2 · 공지 3 · FAQ 4 · 견적문의 5 · 팝업 6)
UPDATE tb_menus
   SET menu_name = '시공사례', description = '시공사례(현장시공 · 셀프시공 팁 · 인테리어스토리) 관리', sort_order = 2
 WHERE menu_type = 'ADMIN' AND menu_url IS NULL AND menu_name = '인테리어 관리';

UPDATE tb_menus
   SET parent_id = NULL, depth = 1, sort_order = 3, icon = 'SoundOutlined',
       menu_name = '공지사항', description = '공지사항 관리'
 WHERE menu_type = 'ADMIN' AND menu_url = '/admin/posts/notice';

UPDATE tb_menus
   SET parent_id = NULL, depth = 1, sort_order = 4, icon = 'QuestionCircleOutlined',
       menu_name = '자주묻는질문', description = '자주묻는질문 관리'
 WHERE menu_type = 'ADMIN' AND menu_url = '/admin/posts/faq';

UPDATE tb_menus
   SET parent_id = NULL, depth = 1, sort_order = 5, icon = 'FormOutlined',
       menu_name = '견적문의', description = '견적문의 관리'
 WHERE menu_type = 'ADMIN' AND menu_url = '/admin/posts/qna';

UPDATE tb_menus SET sort_order = 6
 WHERE menu_type = 'ADMIN' AND menu_url = '/admin/popups';

-- 3) 구 "게시글 관리" 그룹 → "커뮤니티·회원" (자유게시판 · 회원 관리)
UPDATE tb_menus
   SET menu_name = '커뮤니티·회원', description = '자유게시판 · 회원 관리', icon = 'TeamOutlined',
       menu_url = NULL, sort_order = 7
 WHERE menu_type = 'ADMIN' AND menu_url = '/admin/posts';

UPDATE tb_menus
   SET sort_order = 1, menu_name = '자유게시판', description = '자유게시판 글 · 댓글 관리'
 WHERE menu_type = 'ADMIN' AND menu_url = '/admin/posts/free';

UPDATE tb_menus m
  JOIN tb_menus g ON g.menu_type = 'ADMIN' AND g.menu_url IS NULL AND g.menu_name = '커뮤니티·회원'
   SET m.parent_id = g.id, m.depth = 2, m.sort_order = 2,
       m.menu_name = '회원 관리', m.description = '회원(USER) 관리'
 WHERE m.menu_type = 'ADMIN' AND m.menu_url = '/admin/users';

-- 4) 시스템 관리 (SYSTEM_ADMIN 전용) — 컨텐츠 1 · 메뉴 2 · 게시판 설정 3 · 권한 4 · 관리자 계정 5
UPDATE tb_menus SET sort_order = 8
 WHERE menu_type = 'ADMIN' AND menu_url IS NULL AND menu_name = '시스템 관리';

UPDATE tb_menus m
  JOIN tb_menus g ON g.menu_type = 'ADMIN' AND g.menu_url IS NULL AND g.menu_name = '시스템 관리'
   SET m.parent_id = g.id, m.depth = 2, m.sort_order = 1,
       m.description = '고정 페이지(컨텐츠) 관리 — 개발자용'
 WHERE m.menu_type = 'ADMIN' AND m.menu_url = '/admin/contents';

UPDATE tb_menus SET sort_order = 2
 WHERE menu_type = 'ADMIN' AND menu_url = '/admin/system/menus';

UPDATE tb_menus SET sort_order = 3
 WHERE menu_type = 'ADMIN' AND menu_url = '/admin/system/boards';

UPDATE tb_menus SET sort_order = 4, menu_name = '권한 관리'
 WHERE menu_type = 'ADMIN' AND menu_url = '/admin/system/roles';

UPDATE tb_menus SET sort_order = 5, menu_name = '관리자 계정', description = '관리자 계정 관리'
 WHERE menu_type = 'ADMIN' AND menu_url = '/admin/system/admins';

-- 5) 권한: 컨텐츠는 SYSTEM 그룹(운영 관리자에서 제거). 모든 관리자 역할의 공통 바닥 = 운영 5메뉴
UPDATE tb_permissions
   SET perm_group = 'SYSTEM', description = '시스템 > 컨텐츠(고정 페이지) 관리 접근 권한'
 WHERE perm_code = 'MENU_CONTENT';

DELETE rp FROM tb_role_permissions rp
  JOIN tb_permissions p ON p.id = rp.perm_id
  JOIN tb_roles r ON r.id = rp.role_id
 WHERE p.perm_code = 'MENU_CONTENT' AND r.role_code = 'OPERATION_ADMIN';

INSERT INTO tb_role_permissions (perm_id, role_id)
SELECT p.id, r.id
  FROM tb_permissions p
  JOIN tb_roles r ON r.role_code = 'GENERAL_ADMIN'
 WHERE p.perm_code IN ('MENU_INTERIOR', 'MENU_POPUP')
   AND NOT EXISTS (SELECT 1 FROM tb_role_permissions x WHERE x.perm_id = p.id AND x.role_id = r.id);
