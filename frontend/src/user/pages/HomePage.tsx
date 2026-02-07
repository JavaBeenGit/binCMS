import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">
            당신의 공간을<br />
            <span className="hero-accent">새롭게 디자인</span>합니다
          </h1>
          <p className="hero-subtitle">
            감각적인 디자인과 체계적인 시공으로<br />
            꿈꾸는 공간을 현실로 만들어 드립니다.
          </p>
          <div className="hero-actions">
            <Link to="/interior/onsite" className="hero-btn primary">시공사례 보기</Link>
            <Link to="/inquiry" className="hero-btn secondary">견적문의</Link>
          </div>
        </div>
      </section>

      {/* ── Service Section ── */}
      <section className="section services-section">
        <div className="section-inner">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">고객의 라이프스타일에 맞는 최적의 인테리어를 제안합니다</p>
          <div className="services-grid">
            <Link to="/interior/onsite" className="service-card">
              <div className="service-icon">🏗️</div>
              <h3>현장시공</h3>
              <p>전문 시공팀이 직접 방문하여 고품질 인테리어 시공을 진행합니다.</p>
            </Link>
            <Link to="/interior/self-tip" className="service-card">
              <div className="service-icon">🔧</div>
              <h3>셀프시공</h3>
              <p>누구나 쉽게 따라할 수 있는 셀프 인테리어 팁을 공유합니다.</p>
            </Link>
            <Link to="/interior/story" className="service-card">
              <div className="service-icon">📖</div>
              <h3>인테리어스토리</h3>
              <p>트렌디한 인테리어 이야기와 영감을 드리는 콘텐츠입니다.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="cta-section">
        <div className="section-inner">
          <h2>인테리어 상담이 필요하신가요?</h2>
          <p>무료 견적 상담을 통해 합리적인 가격의 맞춤 인테리어를 경험해 보세요.</p>
          <Link to="/inquiry" className="cta-btn">무료 견적문의</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
