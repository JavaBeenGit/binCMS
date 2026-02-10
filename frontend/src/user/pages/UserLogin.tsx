import React, { useCallback } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { login, type LoginRequest } from '../../api/endpoints/auth';
import { getKakaoConfig, buildKakaoAuthUrl, getNaverConfig, buildNaverAuthUrl, getGoogleConfig, buildGoogleAuthUrl } from '../../api/endpoints/oauth';
import { useAuthStore } from '../../stores/authStore';
import { useAdminAuthStore } from '../../stores/adminAuthStore';
import './UserLogin.css';

/**
 * 사용자 로그인 페이지
 */
const UserLogin: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setAdminAuth = useAdminAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      message.success('로그인 성공');
      
      const { roleCode } = response.data.member;
      // 관리자 역할이면 관리자 스토어에 저장 후 관리자 화면으로
      if (roleCode === 'SYSTEM_ADMIN' || roleCode === 'OPERATION_ADMIN' || roleCode === 'GENERAL_ADMIN') {
        setAdminAuth(response.data.accessToken, response.data.member);
        navigate('/admin');
      } else {
        // 일반 사용자는 사용자 스토어에 저장
        setAuth(response.data.accessToken, response.data.member);
        navigate('/');
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '로그인에 실패했습니다');
    },
  });

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

  const handleKakaoLogin = useCallback(() => {
    if (kakaoConfig?.data) {
      window.location.href = buildKakaoAuthUrl(kakaoConfig.data);
    }
  }, [kakaoConfig]);

  const handleNaverLogin = useCallback(() => {
    if (naverConfig?.data) {
      window.location.href = buildNaverAuthUrl(naverConfig.data);
    }
  }, [naverConfig]);

  const handleGoogleLogin = useCallback(() => {
    if (googleConfig?.data) {
      window.location.href = buildGoogleAuthUrl(googleConfig.data);
    }
  }, [googleConfig]);

  const onFinish = (values: LoginRequest) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="user-login-page">
      <div className="page-banner">
        <h1>로그인</h1>
        <p>회원 서비스를 이용하시려면 로그인해 주세요</p>
      </div>
      <div className="page-container">
        <div className="user-login-card">
          <h2 className="user-login-title">로그인</h2>

          <Form
            name="user-login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="loginId"
              rules={[{ required: true, message: '아이디를 입력해주세요' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="아이디"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="비밀번호"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loginMutation.isPending}
                className="user-login-btn"
              >
                로그인
              </Button>
            </Form.Item>
          </Form>

          <Divider plain style={{ fontSize: 13, color: '#999' }}>또는</Divider>

          <div className="social-login-buttons">
            <button
              type="button"
              className="social-btn kakao-btn"
              onClick={handleKakaoLogin}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#3C1E1E" d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.56-.96 3.58-1 3.73 0 0-.02.08.04.12.06.04.13.01.13.01.17-.02 3.28-2.16 3.8-2.53.76.11 1.55.17 2.37.17 5.52 0 10-3.58 10-7.94S17.52 3 12 3z"/>
              </svg>
              카카오 로그인
            </button>
            <button
              type="button"
              className="social-btn naver-btn"
              onClick={handleNaverLogin}
            >
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>N</span>
              네이버 로그인
            </button>
            <button
              type="button"
              className="social-btn google-btn"
              onClick={handleGoogleLogin}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              구글 로그인
            </button>
          </div>

          <div className="user-login-links">
            <span>아직 회원이 아니신가요?</span>
            <Link to="/user/signup">회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
