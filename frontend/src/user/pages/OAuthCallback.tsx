import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { kakaoLogin, naverLogin, googleLogin } from '../../api/endpoints/oauth';
import { useAuthStore } from '../../stores/authStore';

interface OAuthCallbackProps {
  provider: 'kakao' | 'naver' | 'google';
}

const PROVIDER_LABELS: Record<string, string> = {
  kakao: '카카오',
  naver: '네이버',
  google: '구글',
};

/**
 * OAuth 콜백 처리 페이지
 * /oauth/callback/kakao?code=xxx
 * /oauth/callback/naver?code=xxx&state=xxx
 */
const OAuthCallback: React.FC<OAuthCallbackProps> = ({ provider }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const isProcessing = useRef(false); // StrictMode 중복 호출 방지

  const label = PROVIDER_LABELS[provider] || provider;

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`${label} 로그인이 취소되었습니다.`);
      return;
    }

    if (!code) {
      setError('인가 코드가 없습니다.');
      return;
    }

    // provider에 따라 적절한 로그인 API 호출
    let loginPromise;
    if (provider === 'naver') {
      const state = searchParams.get('state') || '';
      loginPromise = naverLogin(code, state);
    } else if (provider === 'google') {
      loginPromise = googleLogin(code);
    } else {
      loginPromise = kakaoLogin(code);
    }

    loginPromise
      .then((response) => {
        setAuth(response.data.accessToken, response.data.member);
        navigate('/', { replace: true });
      })
      .catch((err: any) => {
        console.error(`${label} 로그인 실패:`, err);
        setError(err.response?.data?.message || `${label} 로그인에 실패했습니다.`);
      });
  }, [searchParams, navigate, setAuth, provider, label]);

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
      <p style={{ color: '#666', fontSize: 15 }}>{label} 로그인 처리 중...</p>
    </div>
  );
};

export default OAuthCallback;
