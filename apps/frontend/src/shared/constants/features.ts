/**
 * 화면에서 임시로 숨기는 기능. 코드·라우트는 그대로 두고 버튼·메뉴만 감춘다 (2026-10-13, 사용자 결정).
 * 다시 켜려면 true 로 바꾸면 된다.
 */
export const FEATURES = {
  /** 회원가입 버튼·링크 (헤더·모바일 메뉴·로그인 화면). 라우트 /user/signup 은 살아 있다. */
  signup: false,
  /** 회원 로그인 버튼 (헤더·모바일 메뉴). 라우트 /user/login 은 살아 있고, 이미 로그인된 회원의 드롭다운은 그대로 보인다. 관리자 로그인(/admin/login)과 무관. */
  memberLogin: false,
} as const;
