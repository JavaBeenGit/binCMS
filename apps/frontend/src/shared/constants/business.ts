/**
 * 업체 정보 — 화면(푸터·견적문의 Contact·메타)이 쓰는 단일 출처.
 * 값의 출처와 확정 여부는 docs/00-common/business.md. 2026-10-12 기준 형의 네이버 블로그에 공개된 정보이며
 * 대표 확인 전이다. 모르는 값(대표명·사업자번호·이메일)은 넣지 않는다 — 가짜 값을 표시하지 않기 위해.
 */
export const BUSINESS = {
  name: '수디자인',
  nameEn: 'BIN INTERIOR',
  slogan: '공간의 가치를 설계하는 수디자인',
  tagline: '감각적인 디자인, 체계적인 시공',
  address: '인천광역시 계양구 계양대로 195 네오빌딩 1층',
  addressShort: '인천 계양구 계양대로 195',
  phone: '0507-1464-7321',
  phoneHref: 'tel:0507-1464-7321',
  hours: '평일 09:00 ~ 18:00',
  blogUrl: 'https://blog.naver.com/willer8046',
  bookingUrl: 'https://booking.naver.com/booking/5/bizes/1360116',
  /** 공개 페이지 메타 description 기본값 */
  description: '인천 계양구 인테리어 업체 수디자인. 상가·프랜차이즈·아파트 현장시공 사례와 셀프 인테리어 팁, 무료 견적문의.',
} as const;
