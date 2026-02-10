import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import PopupLayer from '../components/PopupLayer';
import './UserLayout.css';

const UserLayout: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 스크롤 시 헤더 그림자
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 페이지 이동 시 모바일 메뉴 닫기 & 스크롤 맨 위
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const isInteriorActive = () => location.pathname.startsWith('/interior');
  const isCommunityActive = () => location.pathname === '/free';

  return (
    <div className="user-layout">
      {/* ── HEADER ── */}
      <header className={`user-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          {/* 로고 */}
          <Link to="/" className="header-logo">
            <img src="/uploads/etc/su_design_logo.png" alt="수디자인" className="header-logo-img" />
            <span className="logo-text">수디자인</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
              HOME
            </Link>
            <Link to="/notice" className={`nav-item ${isActive('/notice') ? 'active' : ''}`}>
              공지사항
            </Link>
            <Link to="/free" className={`nav-item ${isCommunityActive() ? 'active' : ''}`}>
              자유게시판
            </Link>

            {/* 인테리어 (드롭다운) */}
            <div className="nav-item-group">
              <span className={`nav-item ${isInteriorActive() ? 'active' : ''}`}>
                인테리어
              </span>
              <div className="nav-dropdown">
                <Link to="/interior/onsite">현장시공</Link>
                <Link to="/interior/self-tip">셀프시공</Link>
                <Link to="/interior/story">인테리어스토리</Link>
              </div>
            </div>

            <Link to="/faq" className={`nav-item ${isActive('/faq') ? 'active' : ''}`}>
              자주묻는질문
            </Link>
            <Link to="/inquiry" className={`nav-item ${isActive('/inquiry') ? 'active' : ''}`}>
              견적문의
            </Link>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className={`mobile-menu-btn ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="메뉴"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ── Mobile Navigation ── */}
      <nav className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
          HOME
        </Link>
        <Link to="/notice" className={`mobile-nav-item ${isActive('/notice') ? 'active' : ''}`}>
          공지사항
        </Link>
        <Link to="/free" className={`mobile-nav-item ${isActive('/free') ? 'active' : ''}`}>
          자유게시판
        </Link>

        <span className="mobile-nav-group-title">인테리어</span>
        <Link to="/interior/onsite" className={`mobile-nav-sub-item ${isActive('/interior/onsite') ? 'active' : ''}`}>
          현장시공
        </Link>
        <Link to="/interior/self-tip" className={`mobile-nav-sub-item ${isActive('/interior/self-tip') ? 'active' : ''}`}>
          셀프시공
        </Link>
        <Link to="/interior/story" className={`mobile-nav-sub-item ${isActive('/interior/story') ? 'active' : ''}`}>
          인테리어스토리
        </Link>

        <Link to="/faq" className={`mobile-nav-item ${isActive('/faq') ? 'active' : ''}`}>
          자주묻는질문
        </Link>
        <Link to="/inquiry" className={`mobile-nav-item ${isActive('/inquiry') ? 'active' : ''}`}>
          견적문의
        </Link>
      </nav>

      {/* ── 팝업 레이어 ── */}
      <PopupLayer />

      {/* ── MAIN ── */}
      <main className="user-main">
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="user-footer">
        <div className="footer-inner">
          <div className="footer-brand-section">
            <div className="footer-brand">
              <img src="/uploads/etc/su_design_logo_footer.png" alt="수디자인" className="footer-logo-img" />
              <div className="footer-brand-text">
                <span className="footer-brand-name">수디자인</span>
                <span className="footer-brand-slogan">감각적인 디자인, 체계적인 시공</span>
              </div>
            </div>
            <p className="footer-desc">
              고객의 꿈꾸는 공간을 현실로 만들어 드립니다.
            </p>
            <div className="footer-info">
              <p>대표: 홍길동 | 사업자등록번호: 000-00-00000</p>
              <p>주소: 서울특별시 강남구 테헤란로 000, 0층</p>
              <p>전화: 02-000-0000 | 이메일: info@sudesign.co.kr</p>
            </div>
          </div>
          <div>
            <div className="footer-title">서비스</div>
            <ul className="footer-links">
              <li><Link to="/interior/onsite">현장시공</Link></li>
              <li><Link to="/interior/self-tip">셀프시공</Link></li>
              <li><Link to="/interior/story">인테리어스토리</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-title">고객지원</div>
            <ul className="footer-links">
              <li><Link to="/notice">공지사항</Link></li>
              <li><Link to="/free">자유게시판</Link></li>
              <li><Link to="/faq">자주묻는질문</Link></li>
              <li><Link to="/inquiry">견적문의</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} 수디자인. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
