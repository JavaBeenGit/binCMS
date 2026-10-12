import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/shared/stores/authStore';
import { useSiteMenus, type SiteMenu } from '@/shared/hooks/useSiteMenus';
import PopupLayer from '@/user/components/PopupLayer';
import './UserLayout.css';

import { BUSINESS } from '@/shared/constants/business';
import { FEATURES } from '@/shared/constants/features';

/**
 * 사용자(홈페이지) 레이아웃 — 헤더 메뉴는 DB 사용자 메뉴(관리자 "홈페이지 메뉴" 화면)를 따른다. 푸터는 코드에 고정.
 */
const UserLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, token, clearAuth } = useAuthStore();
  const isLoggedIn = !!token;
  const { menus } = useSiteMenus();

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

  // HOME 은 정확히 일치, 나머지는 하위 경로(상세 등)까지 활성
  const isActive = (path?: string) =>
    !!path && (path === '/user' ? location.pathname === '/user' : location.pathname.startsWith(path));
  const isGroupActive = (menu: SiteMenu) => (menu.children ?? []).some((c) => isActive(c.menuUrl));
  const hasChildren = (menu: SiteMenu) => !!menu.children && menu.children.length > 0;

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
            <img src="/logo.png" alt="수디자인" className="header-logo-img" />
            <span className="logo-text">수디자인</span>
          </Link>

          {/* Desktop Navigation — DB 메뉴 */}
          <nav className="header-nav">
            {menus.map((menu) =>
              hasChildren(menu) ? (
                <div className="nav-item-group" key={menu.id}>
                  <span className={`nav-item ${isGroupActive(menu) ? 'active' : ''}`}>{menu.menuName}</span>
                  <div className="nav-dropdown">
                    {menu.children!.map((child) => (
                      <Link key={child.id} to={child.menuUrl ?? '/user'}>
                        {child.menuName}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={menu.id} to={menu.menuUrl ?? '/user'} className={`nav-item ${isActive(menu.menuUrl) ? 'active' : ''}`}>
                  {menu.menuName}
                </Link>
              ),
            )}
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
                {FEATURES.signup && (
                  <>
                    <span className="auth-divider">|</span>
                    <Link to="/user/signup" className="auth-link">회원가입</Link>
                  </>
                )}
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

      {/* ── Mobile Navigation — DB 메뉴 ── */}
      <nav className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {menus.map((menu) =>
          hasChildren(menu) ? (
            <React.Fragment key={menu.id}>
              <span className="mobile-nav-group-title">{menu.menuName}</span>
              {menu.children!.map((child) => (
                <Link
                  key={child.id}
                  to={child.menuUrl ?? '/user'}
                  className={`mobile-nav-sub-item ${isActive(child.menuUrl) ? 'active' : ''}`}
                >
                  {child.menuName}
                </Link>
              ))}
            </React.Fragment>
          ) : (
            <Link key={menu.id} to={menu.menuUrl ?? '/user'} className={`mobile-nav-item ${isActive(menu.menuUrl) ? 'active' : ''}`}>
              {menu.menuName}
            </Link>
          ),
        )}

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
              {FEATURES.signup && (
                <Link to="/user/signup" className="mobile-nav-auth-link signup">
                  회원가입
                </Link>
              )}
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

      {/* ── FOOTER (코드 고정 — 2026-10-13 결정) ── */}
      <footer className="user-footer">
        <div className="footer-inner">
          <div className="footer-brand-section">
            <div className="footer-brand">
              <img src="/logo.png" alt={BUSINESS.name} className="footer-logo-img" />
              <div className="footer-brand-text">
                <span className="footer-brand-name">{BUSINESS.name}</span>
                <span className="footer-brand-slogan">{BUSINESS.tagline}</span>
              </div>
            </div>
            <p className="footer-desc">
              고객의 꿈꾸는 공간을 현실로 만들어 드립니다.
            </p>
            <div className="footer-info">
              <p>주소: {BUSINESS.address}</p>
              <p>전화: <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a> ({BUSINESS.hours})</p>
              <p>
                <a href={BUSINESS.blogUrl} target="_blank" rel="noopener noreferrer">네이버 블로그</a>
                {' | '}
                <a href={BUSINESS.bookingUrl} target="_blank" rel="noopener noreferrer">네이버 예약</a>
              </p>
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
