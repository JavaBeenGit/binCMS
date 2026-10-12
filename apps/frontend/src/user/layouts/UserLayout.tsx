import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import PopupLayer from '../components/PopupLayer';
import './UserLayout.css';

const UserLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, token, clearAuth } = useAuthStore();
  const isLoggedIn = !!token;

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
  const isInteriorActive = () => location.pathname.startsWith('/user/interior');
  const isCommunityActive = () => location.pathname === '/user/free';

  const handleLogout = () => {
    clearAuth();
    message.success('로그아웃 되었습니다');
    navigate('/user');
  };

  const userMenuItems = [
    {
      key: 'mypage',
      label: '마이페이지',
      icon: <UserOutlined />,
      onClick: () => navigate('/user/mypage'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: '로그아웃',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="user-layout">
      {/* ── HEADER ── */}
      <header className={`user-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          {/* 로고 */}
          <Link to="/user" className="header-logo">
            <img src="/uploads/etc/su_design_logo.png" alt="수디자인" className="header-logo-img" />
            <span className="logo-text">수디자인</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            <Link to="/user" className={`nav-item ${isActive('/user') ? 'active' : ''}`}>
              HOME
            </Link>
            <Link to="/user/notice" className={`nav-item ${isActive('/user/notice') ? 'active' : ''}`}>
              공지사항
            </Link>
            <Link to="/user/free" className={`nav-item ${isCommunityActive() ? 'active' : ''}`}>
              자유게시판
            </Link>

            {/* 인테리어 (드롭다운) */}
            <div className="nav-item-group">
              <span className={`nav-item ${isInteriorActive() ? 'active' : ''}`}>
                인테리어
              </span>
              <div className="nav-dropdown">
                <Link to="/user/interior/onsite">현장시공</Link>
                <Link to="/user/interior/self-tip">셀프시공</Link>
                <Link to="/user/interior/story">인테리어스토리</Link>
              </div>
            </div>

            <Link to="/user/faq" className={`nav-item ${isActive('/user/faq') ? 'active' : ''}`}>
              자주묻는질문
            </Link>
            <Link to="/user/inquiry" className={`nav-item ${isActive('/user/inquiry') ? 'active' : ''}`}>
              견적문의
            </Link>
          </nav>

          {/* User Auth Area (Desktop) */}
          <div className="header-auth">
            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <button className="auth-user-btn">
                  <UserOutlined />
                  <span className="auth-user-name">{user?.name}</span>
                </button>
              </Dropdown>
            ) : (
              <div className="auth-links">
                <Link to="/user/login" className="auth-link">로그인</Link>
                <span className="auth-divider">|</span>
                <Link to="/user/signup" className="auth-link">회원가입</Link>
              </div>
            )}
          </div>

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
        <Link to="/user" className={`mobile-nav-item ${isActive('/user') ? 'active' : ''}`}>
          HOME
        </Link>
        <Link to="/user/notice" className={`mobile-nav-item ${isActive('/user/notice') ? 'active' : ''}`}>
          공지사항
        </Link>
        <Link to="/user/free" className={`mobile-nav-item ${isActive('/user/free') ? 'active' : ''}`}>
          자유게시판
        </Link>

        <span className="mobile-nav-group-title">인테리어</span>
        <Link to="/user/interior/onsite" className={`mobile-nav-sub-item ${isActive('/user/interior/onsite') ? 'active' : ''}`}>
          현장시공
        </Link>
        <Link to="/user/interior/self-tip" className={`mobile-nav-sub-item ${isActive('/user/interior/self-tip') ? 'active' : ''}`}>
          셀프시공
        </Link>
        <Link to="/user/interior/story" className={`mobile-nav-sub-item ${isActive('/user/interior/story') ? 'active' : ''}`}>
          인테리어스토리
        </Link>

        <Link to="/user/faq" className={`mobile-nav-item ${isActive('/user/faq') ? 'active' : ''}`}>
          자주묻는질문
        </Link>
        <Link to="/user/inquiry" className={`mobile-nav-item ${isActive('/user/inquiry') ? 'active' : ''}`}>
          견적문의
        </Link>

        <div className="mobile-nav-auth">
          {isLoggedIn ? (
            <>
              <span className="mobile-nav-user">
                <UserOutlined /> {user?.name}님
              </span>
              <button className="mobile-nav-logout" onClick={handleLogout}>
                <LogoutOutlined /> 로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/user/login" className="mobile-nav-auth-link">
                <LoginOutlined /> 로그인
              </Link>
              <Link to="/user/signup" className="mobile-nav-auth-link signup">
                회원가입
              </Link>
            </>
          )}
        </div>
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
              <li><Link to="/user/interior/onsite">현장시공</Link></li>
              <li><Link to="/user/interior/self-tip">셀프시공</Link></li>
              <li><Link to="/user/interior/story">인테리어스토리</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-title">고객지원</div>
            <ul className="footer-links">
              <li><Link to="/user/notice">공지사항</Link></li>
              <li><Link to="/user/free">자유게시판</Link></li>
              <li><Link to="/user/faq">자주묻는질문</Link></li>
              <li><Link to="/user/inquiry">견적문의</Link></li>
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
