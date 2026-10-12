-- V1: 초기 스키마 (2026-10-12). Hibernate ddl-auto=update 가 만들던 DDL을 정리한 것.
-- 물리명은 소문자 스네이크(ADR-0004). 제약명: uk_<table>_<col>, idx_<table>_<col>, fk_<child>_<parent>.
-- 이 파일은 첫 공유 이후 수정 금지 — 변경은 V3+ 로.

CREATE TABLE `tb_roles` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '역할 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `description` varchar(200) DEFAULT NULL COMMENT '설명',
  `role_code` varchar(30) NOT NULL COMMENT '역할 코드',
  `role_name` varchar(50) NOT NULL COMMENT '역할명',
  `sort_order` int NOT NULL COMMENT '정렬 순서',
  `use_yn` varchar(1) NOT NULL COMMENT '사용 여부',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='역할';

CREATE TABLE `tb_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '권한 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `description` varchar(200) DEFAULT NULL COMMENT '설명',
  `perm_code` varchar(50) NOT NULL COMMENT '권한 코드',
  `perm_group` varchar(30) NOT NULL COMMENT '권한 그룹',
  `perm_name` varchar(100) NOT NULL COMMENT '권한명',
  `sort_order` int NOT NULL COMMENT '정렬 순서',
  `use_yn` varchar(1) NOT NULL COMMENT '사용 여부',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permissions_perm_code` (`perm_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='권한';

CREATE TABLE `tb_role_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '역할-권한 ID',
  `perm_id` bigint NOT NULL COMMENT '권한 ID',
  `role_id` bigint NOT NULL COMMENT '역할 ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permissions_role_id_perm_id` (`role_id`,`perm_id`),
  KEY `idx_role_permissions_role_id` (`role_id`),
  KEY `idx_role_permissions_perm_id` (`perm_id`),
  CONSTRAINT `fk_role_permissions_permissions` FOREIGN KEY (`perm_id`) REFERENCES `tb_permissions` (`id`),
  CONSTRAINT `fk_role_permissions_roles` FOREIGN KEY (`role_id`) REFERENCES `tb_roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='역할별 권한';

CREATE TABLE `tb_members` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '회원 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `active` bit(1) NOT NULL COMMENT '활성화 여부',
  `email` varchar(100) DEFAULT NULL COMMENT '이메일',
  `email_verified` bit(1) NOT NULL COMMENT '이메일 인증 여부',
  `lgn_id` varchar(50) NOT NULL COMMENT '로그인 ID',
  `name` varchar(50) NOT NULL COMMENT '이름',
  `password` varchar(255) NOT NULL COMMENT '비밀번호',
  `phone_number` varchar(20) DEFAULT NULL COMMENT '전화번호',
  `provider` varchar(20) NOT NULL COMMENT '인증 제공자',
  `provider_id` varchar(255) DEFAULT NULL COMMENT '소셜 제공자 ID',
  `role_id` bigint NOT NULL COMMENT '역할 ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_members_lgn_id` (`lgn_id`),
  KEY `idx_members_role_id` (`role_id`),
  CONSTRAINT `fk_members_roles` FOREIGN KEY (`role_id`) REFERENCES `tb_roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회원';

CREATE TABLE `tb_boards` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '게시판 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `board_code` varchar(50) NOT NULL COMMENT '게시판 코드',
  `board_name` varchar(100) NOT NULL COMMENT '게시판 이름',
  `description` varchar(500) DEFAULT NULL COMMENT '게시판 설명',
  `sort_order` int DEFAULT NULL COMMENT '정렬 순서',
  `use_yn` varchar(1) NOT NULL COMMENT '사용 여부',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_boards_board_code` (`board_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시판';

CREATE TABLE `tb_posts` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '게시글 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `content` text NOT NULL COMMENT '내용',
  `notice_yn` varchar(1) NOT NULL COMMENT '공지글 여부',
  `title` varchar(200) NOT NULL COMMENT '제목',
  `use_yn` varchar(1) NOT NULL COMMENT '사용 여부',
  `view_count` bigint NOT NULL COMMENT '조회수',
  `board_id` bigint NOT NULL COMMENT '게시판 ID',
  PRIMARY KEY (`id`),
  KEY `idx_posts_board_id` (`board_id`),
  KEY `idx_posts_notice_yn` (`notice_yn`),
  CONSTRAINT `fk_posts_boards` FOREIGN KEY (`board_id`) REFERENCES `tb_boards` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시글';

CREATE TABLE `tb_comments` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '댓글 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `author_name` varchar(50) NOT NULL COMMENT '작성자 이름',
  `content` varchar(2000) NOT NULL COMMENT '댓글 내용',
  `password` varchar(200) NOT NULL COMMENT '비밀번호',
  `use_yn` varchar(1) NOT NULL COMMENT '사용 여부',
  `parent_id` bigint DEFAULT NULL COMMENT '부모 댓글 ID',
  `post_id` bigint NOT NULL COMMENT '게시글 ID',
  PRIMARY KEY (`id`),
  KEY `idx_comments_post_id` (`post_id`),
  KEY `idx_comments_parent_id` (`parent_id`),
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `tb_comments` (`id`),
  CONSTRAINT `fk_comments_posts` FOREIGN KEY (`post_id`) REFERENCES `tb_posts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='댓글';

CREATE TABLE `tb_contents` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '컨텐츠 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `category` varchar(50) DEFAULT NULL COMMENT '카테고리',
  `content` longtext COMMENT '내용',
  `content_key` varchar(100) NOT NULL COMMENT '컨텐츠 키',
  `description` varchar(500) DEFAULT NULL COMMENT '설명',
  `sort_order` int DEFAULT NULL COMMENT '정렬 순서',
  `title` varchar(200) NOT NULL COMMENT '제목',
  `use_yn` varchar(1) NOT NULL COMMENT '사용 여부',
  `view_count` bigint NOT NULL COMMENT '조회수',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_contents_content_key` (`content_key`),
  KEY `idx_contents_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='컨텐츠';

CREATE TABLE `tb_email_verifications` (
  `verification_id` bigint NOT NULL AUTO_INCREMENT COMMENT '인증 ID',
  `email` varchar(100) NOT NULL COMMENT '이메일',
  `expires_at` datetime(6) NOT NULL COMMENT '만료 시각',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `verification_code` varchar(10) NOT NULL COMMENT '인증 코드',
  `verified` bit(1) NOT NULL COMMENT '인증 완료 여부',
  `verified_at` datetime(6) DEFAULT NULL COMMENT '인증 완료 시각',
  PRIMARY KEY (`verification_id`),
  KEY `idx_email_verifications_email` (`email`),
  KEY `idx_email_verifications_email_verification_code` (`email`,`verification_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tb_files` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '파일 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `content_type` varchar(100) NOT NULL COMMENT 'MIME 타입',
  `file_ext` varchar(20) DEFAULT NULL COMMENT '파일 확장자',
  `file_path` varchar(1000) NOT NULL COMMENT '파일 저장 경로',
  `file_size` bigint NOT NULL COMMENT '파일 크기(bytes)',
  `original_name` varchar(500) NOT NULL COMMENT '원본 파일명',
  `ref_id` bigint DEFAULT NULL COMMENT '참조 ID',
  `ref_type` varchar(50) DEFAULT NULL COMMENT '참조 타입 (INTERIOR, POST 등)',
  `stored_name` varchar(500) NOT NULL COMMENT '저장 파일명',
  `thumbnail_path` varchar(1000) DEFAULT NULL COMMENT '썸네일 경로',
  `use_yn` varchar(1) NOT NULL COMMENT '사용 여부',
  PRIMARY KEY (`id`),
  KEY `idx_files_ref_type_ref_id` (`ref_type`,`ref_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='파일 정보';

CREATE TABLE `tb_inquiries` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '견적문의 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `address` varchar(500) DEFAULT NULL COMMENT '시공 장소',
  `admin_memo` text COMMENT '관리자 메모',
  `budget` varchar(20) DEFAULT NULL COMMENT '예상 예산',
  `content` text NOT NULL COMMENT '문의 내용',
  `email` varchar(100) DEFAULT NULL COMMENT '이메일',
  `inquiry_type` varchar(20) NOT NULL COMMENT '시공 유형',
  `name` varchar(50) NOT NULL COMMENT '이름',
  `phone` varchar(20) NOT NULL COMMENT '연락처',
  `status` varchar(20) NOT NULL COMMENT '처리 상태',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='견적문의';

CREATE TABLE `tb_interiors` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '인테리어 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `category` enum('ONSITE','SELF_TIP','STORY') NOT NULL COMMENT '카테고리',
  `content` longtext NOT NULL COMMENT '내용',
  `sort_order` int NOT NULL COMMENT '정렬 순서',
  `thumbnail_url` varchar(500) DEFAULT NULL COMMENT '대표 이미지 URL',
  `title` varchar(200) NOT NULL COMMENT '제목',
  `use_yn` varchar(1) NOT NULL COMMENT '사용 여부',
  `view_count` bigint NOT NULL COMMENT '조회수',
  PRIMARY KEY (`id`),
  KEY `idx_interiors_category` (`category`),
  KEY `idx_interiors_use_yn` (`use_yn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='인테리어';

CREATE TABLE `tb_menus` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '메뉴 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `depth` int NOT NULL COMMENT '메뉴 깊이',
  `description` varchar(500) DEFAULT NULL COMMENT '설명',
  `icon` varchar(50) DEFAULT NULL COMMENT '아이콘',
  `menu_name` varchar(100) NOT NULL COMMENT '메뉴명',
  `menu_type` enum('ADMIN','USER') NOT NULL COMMENT '메뉴 타입',
  `menu_url` varchar(200) DEFAULT NULL COMMENT '메뉴 URL',
  `parent_id` bigint DEFAULT NULL COMMENT '부모 메뉴 ID',
  `sort_order` int NOT NULL COMMENT '정렬 순서',
  `use_yn` varchar(1) NOT NULL COMMENT '사용 여부',
  PRIMARY KEY (`id`),
  KEY `idx_menus_parent_id` (`parent_id`),
  KEY `idx_menus_menu_type` (`menu_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='메뉴';

CREATE TABLE `tb_popups` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '팝업 ID',
  `mod_dt` datetime(6) NOT NULL COMMENT '수정일시',
  `mod_no` varchar(100) DEFAULT NULL COMMENT '수정자',
  `reg_dt` datetime(6) NOT NULL COMMENT '등록일시',
  `reg_no` varchar(100) DEFAULT NULL COMMENT '등록자',
  `content` longtext COMMENT '팝업 내용 (HTML)',
  `end_dt` datetime(6) DEFAULT NULL COMMENT '노출 종료일시',
  `popup_height` int DEFAULT NULL COMMENT '팝업 높이 (px)',
  `popup_width` int DEFAULT NULL COMMENT '팝업 너비 (px)',
  `position_x` int DEFAULT NULL COMMENT '팝업 X 위치 (px)',
  `position_y` int DEFAULT NULL COMMENT '팝업 Y 위치 (px)',
  `sort_order` int DEFAULT NULL COMMENT '정렬 순서',
  `start_dt` datetime(6) DEFAULT NULL COMMENT '노출 시작일시',
  `title` varchar(200) NOT NULL COMMENT '팝업 제목',
  `use_yn` varchar(1) NOT NULL COMMENT '사용 여부',
  PRIMARY KEY (`id`),
  KEY `idx_popups_use_yn` (`use_yn`),
  KEY `idx_popups_start_dt` (`start_dt`),
  KEY `idx_popups_end_dt` (`end_dt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='팝업';
