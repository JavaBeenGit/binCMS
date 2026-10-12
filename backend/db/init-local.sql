-- binCms 로컬 개발 DB·계정 생성 (네이티브 MySQL용). compose를 쓰면 불필요(환경변수가 같은 일을 함).
CREATE DATABASE IF NOT EXISTS bincms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'bincms'@'localhost' IDENTIFIED BY 'bincms1234';
CREATE USER IF NOT EXISTS 'bincms'@'%' IDENTIFIED BY 'bincms1234';
GRANT ALL PRIVILEGES ON bincms.* TO 'bincms'@'localhost';
GRANT ALL PRIVILEGES ON bincms.* TO 'bincms'@'%';
FLUSH PRIVILEGES;
