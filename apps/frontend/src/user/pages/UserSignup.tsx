import React, { useCallback } from 'react';
import { Button } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getKakaoConfig, buildKakaoAuthUrl, getNaverConfig, buildNaverAuthUrl, getGoogleConfig, buildGoogleAuthUrl } from '../../api/endpoints/oauth';
import './UserSignup.css';

/**
 * 사용자 회원가입 선택 페이지
 * - 이메일 회원가입
 * - 소셜 로그인 (Phase 2에서 추가 예정)
 */
const UserSignup: React.FC = () => {
  const navigate = useNavigate();

  // 카카오 OAuth 설정
  const { data: kakaoConfig } = useQuery({
    queryKey: ['kakaoConfig'],
    queryFn: getKakaoConfig,
    staleTime: Infinity,
  });

  // 네이버 OAuth 설정
  const { data: naverConfig } = useQuery({
    queryKey: ['naverConfig'],
    queryFn: getNaverConfig,
    staleTime: Infinity,
  });

  // 구글 OAuth 설정
  const { data: googleConfig } = useQuery({
    queryKey: ['googleConfig'],
    queryFn: getGoogleConfig,
    staleTime: Infinity,
  });

  const handleKakaoSignup = useCallback(() => {
    if (kakaoConfig?.data) {
      window.location.href = buildKakaoAuthUrl(kakaoConfig.data);
    }
  }, [kakaoConfig]);

  const handleNaverSignup = useCallback(() => {
    if (naverConfig?.data) {
      window.location.href = buildNaverAuthUrl(naverConfig.data);
    }
  }, [naverConfig]);

  const handleGoogleSignup = useCallback(() => {
    if (googleConfig?.data) {
      window.location.href = buildGoogleAuthUrl(googleConfig.data);
    }
  }, [googleConfig]);

  return (
    <div className="user-signup-page">
      <div className="page-banner">
        <h1>회원가입</h1>
        <p>회원가입 방법을 선택해 주세요</p>
      </div>
      <div className="page-container">
        <div className="user-signup-card">
          <h2 className="user-signup-title">회원가입</h2>

          <div className="signup-methods">
            {/* 이메일 회원가입 */}
            <Button
              type="primary"
              icon={<MailOutlined />}
              block
              size="large"
              className="signup-method-btn signup-email-btn"
              onClick={() => navigate('/user/signup/email')}
            >
              이메일로 회원가입
            </Button>

            {/* 소셜 로그인 버튼 - Phase 2에서 활성화 */}
            <div className="signup-divider">
              <span>또는</span>
            </div>

            <Button
              block
              size="large"
              className="signup-method-btn signup-kakao-btn"
              onClick={handleKakaoSignup}
            >
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%233C1E1E' d='M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.56-.96 3.58-1 3.73 0 0-.02.08.04.12.06.04.13.01.13.01.17-.02 3.28-2.16 3.8-2.53.76.11 1.55.17 2.37.17 5.52 0 10-3.58 10-7.94S17.52 3 12 3z'/%3E%3C/svg%3E" alt="카카오" width="20" height="20" style={{ marginRight: 8 }} />
              카카오로 시작하기
            </Button>

            <Button
              block
              size="large"
              className="signup-method-btn signup-naver-btn"
              onClick={handleNaverSignup}
            >
              <span style={{ color: '#03C75A', fontWeight: 800, fontSize: 16, marginRight: 8 }}>N</span>
              네이버로 시작하기
            </Button>

            <Button
              block
              size="large"
              className="signup-method-btn signup-google-btn"
              onClick={handleGoogleSignup}
            >
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E" alt="구글" width="20" height="20" style={{ marginRight: 8 }} />
              구글로 시작하기
            </Button>
          </div>

          <div className="user-signup-links">
            <span>이미 회원이신가요?</span>
            <Link to="/user/login">로그인</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
