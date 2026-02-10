import React, { useCallback } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { login, type LoginRequest } from '../../api/endpoints/auth';
import { getKakaoConfig, buildKakaoAuthUrl } from '../../api/endpoints/oauth';
import { useAuthStore } from '../../stores/authStore';
import './UserLogin.css';

/**
 * 사용자 로그인 페이지
 */
const UserLogin: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      message.success('로그인 성공');
      setAuth(response.data.accessToken, response.data.member);
      navigate('/');
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

  const handleKakaoLogin = useCallback(() => {
    if (kakaoConfig?.data) {
      window.location.href = buildKakaoAuthUrl(kakaoConfig.data);
    }
  }, [kakaoConfig]);

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
