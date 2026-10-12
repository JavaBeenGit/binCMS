# 용어집

코드 식별자와 화면 용어의 대응. 새 도메인을 추가하면 여기에 한 줄 추가한다.

| 화면 용어 | 코드(도메인·enum) | 설명 |
|---|---|---|
| 관리자 | `SYSTEM_ADMIN` / `OPERATION_ADMIN` / `GENERAL_ADMIN` (`TB_ROLES.ROLE_CODE`) | 백오피스 사용자. 시스템 메뉴는 SYSTEM_ADMIN만 |
| 회원 | `USER` 역할, `TB_MEMBERS` | 사이트 가입자(이메일·카카오·네이버·구글) |
| 게시판 | `board` (`TB_BOARDS`, `boardCode`: `notice`·`faq`·`free`) | 게시판 정의. 게시글은 `post` |
| 공지사항 / 자주묻는질문 / 자유게시판 | `boardCode` = `notice` / `faq` / `free` | |
| 댓글 | `comment` | 자유게시판 게시글에 달림 |
| 콘텐츠 | `content` (`contentKey`) | 관리자가 편집하는 고정 페이지(`/user/page/:contentKey`) |
| 팝업 | `popup` | 홈 진입 시 뜨는 레이어 |
| 인테리어 / 시공사례 | `interior`, `InteriorCategory`: `ONSITE`(현장시공) · `SELF_TIP`(셀프시공) · `STORY`(인테리어스토리) | 갤러리형 게시판 |
| 견적문의 | `inquiry` | 비로그인 방문자가 남기는 문의. 관리자가 조회 |
| 메뉴 | `menu`, `MenuType` | 관리자 사이드메뉴·사용자 GNB 정의(DB) |
| 권한 | `permission` (`permCode`: `MENU_*`) | 관리자 메뉴 접근 권한. 역할에 매핑 |
| 파일 | `file` (`TB_FILES`, `/uploads/**`) | 업로드 이미지 |
