import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { kakaoLogin } from '../../api/endpoints/oauth';
import { useAuthStore } from '../../stores/authStore';

/**
 * OAuth 콜백 처리 페이지
 * /oauth/callback/kakao?code=xxx
 */
const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const isProcessing = useRef(false); // StrictMode 중복 호출 방지

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('카카오 로그인이 취소되었습니다.');
      return;
    }

    if (!code) {
      setError('인가 코드가 없습니다.');
      return;
    }

    // 인가 코드를 백엔드로 전송하여 로그인 처리
    kakaoLogin(code)
      .then((response) => {
        setAuth(response.data.accessToken, response.data.member);
        navigate('/', { replace: true });
      })
      .catch((err: any) => {
        console.error('카카오 로그인 실패:', err);
        setError(err.response?.data?.message || '카카오 로그인에 실패했습니다.');
      });
  }, [searchParams, navigate, setAuth]);

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Result
          status="error"
          title="로그인 실패"
          subTitle={error}
          extra={[
            <Button type="primary" key="login" onClick={() => navigate('/user/login', { replace: true })}>
              로그인 페이지로
            </Button>,
            <Button key="home" onClick={() => navigate('/', { replace: true })}>
              홈으로
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
      <Spin size="large" />
      <p style={{ color: '#666', fontSize: 15 }}>카카오 로그인 처리 중...</p>
    </div>
  );
};

export default OAuthCallback;
