import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Steps, message, Result } from 'antd';
import {
  MailOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { signup, type SignupRequest } from '../../api/endpoints/auth';
import { sendVerificationCode, verifyEmailCode } from '../../api/endpoints/email';
import './EmailSignup.css';

/**
 * 이메일 인증 기반 회원가입 페이지
 * Step 1: 이메일 입력 → 인증 코드 발송
 * Step 2: 인증 코드 입력 → 검증
 * Step 3: 회원 정보 입력 → 가입 완료
 */
const EmailSignup: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [emailForm] = Form.useForm();
  const [codeForm] = Form.useForm();
  const [signupForm] = Form.useForm();

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 인증 코드 발송
  const sendCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: () => {
      message.success('인증 코드가 발송되었습니다. 이메일을 확인해주세요.');
      setCountdown(300); // 5분
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '인증 코드 발송에 실패했습니다');
    },
  });

  // 인증 코드 검증
  const verifyCodeMutation = useMutation({
    mutationFn: verifyEmailCode,
    onSuccess: (res) => {
      message.success('이메일 인증이 완료되었습니다!');
      setVerifiedEmail(res.data.email);
      setCurrentStep(2);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '인증 코드가 올바르지 않습니다');
    },
  });

  // 회원가입
  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      setCurrentStep(3); // 완료 화면
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '회원가입에 실패했습니다');
    },
  });

  // Step 1: 이메일 입력 후 인증 코드 발송
  const handleSendCode = useCallback(() => {
    emailForm.validateFields().then((values) => {
      sendCodeMutation.mutate({ email: values.email });
      if (currentStep === 0) {
        setCurrentStep(1);
      }
    });
  }, [emailForm, sendCodeMutation, currentStep]);

  // Step 2: 인증 코드 검증
  const handleVerifyCode = useCallback(() => {
    codeForm.validateFields().then((values) => {
      const email = emailForm.getFieldValue('email');
      verifyCodeMutation.mutate({ email, code: values.code });
    });
  }, [codeForm, emailForm, verifyCodeMutation]);

  // Step 3: 회원가입
  const handleSignup = useCallback(() => {
    signupForm.validateFields().then((values) => {
      const request: SignupRequest = {
        loginId: values.loginId,
        email: verifiedEmail,
        password: values.password,
        name: values.name,
        phoneNumber: values.phoneNumber,
      };
      signupMutation.mutate(request);
    });
  }, [signupForm, verifiedEmail, signupMutation]);

  // 카운트다운 포맷
  const formatCountdown = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // 완료 화면
  if (currentStep === 3) {
    return (
      <div className="email-signup-page">
        <div className="page-banner">
          <h1>회원가입 완료</h1>
          <p>환영합니다!</p>
        </div>
        <div className="page-container">
          <div className="email-signup-card">
            <Result
              status="success"
              title="회원가입이 완료되었습니다!"
              subTitle="로그인 후 서비스를 이용해 주세요."
              extra={[
                <Button
                  type="primary"
                  key="login"
                  size="large"
                  onClick={() => navigate('/user/login')}
                >
                  로그인하기
                </Button>,
                <Button
                  key="home"
                  size="large"
                  onClick={() => navigate('/user')}
                >
                  홈으로
                </Button>,
              ]}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-signup-page">
      <div className="page-banner">
        <h1>이메일 회원가입</h1>
        <p>이메일 인증 후 간단한 정보로 가입하세요</p>
      </div>
      <div className="page-container">
        <div className="email-signup-card">
          <Steps
            current={currentStep}
            size="small"
            className="signup-steps"
            items={[
              { title: '이메일 입력' },
              { title: '인증 확인' },
              { title: '정보 입력' },
            ]}
          />

          {/* Step 1: 이메일 입력 */}
          {currentStep === 0 && (
            <div className="step-content">
              <div className="step-description">
                <MailOutlined className="step-icon" />
                <h3>이메일 주소를 입력해주세요</h3>
                <p>입력하신 이메일로 6자리 인증 코드를 보내드립니다.</p>
              </div>
              <Form form={emailForm} layout="vertical" size="large">
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '이메일을 입력해주세요' },
                    { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="example@email.com"
                    autoFocus
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    block
                    loading={sendCodeMutation.isPending}
                    className="step-btn"
                    onClick={handleSendCode}
                  >
                    인증 코드 발송
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}

          {/* Step 2: 인증 코드 입력 */}
          {currentStep === 1 && (
            <div className="step-content">
              <div className="step-description">
                <SafetyCertificateOutlined className="step-icon" />
                <h3>인증 코드를 입력해주세요</h3>
                <p>
                  <strong>{emailForm.getFieldValue('email')}</strong>으로 발송된
                  6자리 코드를 입력해주세요.
                </p>
                {countdown > 0 && (
                  <div className="countdown">
                    남은 시간: <strong>{formatCountdown(countdown)}</strong>
                  </div>
                )}
              </div>
              <Form form={codeForm} layout="vertical" size="large">
                <Form.Item
                  name="code"
                  rules={[
                    { required: true, message: '인증 코드를 입력해주세요' },
                    { len: 6, message: '6자리 코드를 입력해주세요' },
                  ]}
                >
                  <Input
                    prefix={<SafetyCertificateOutlined />}
                    placeholder="6자리 인증 코드"
                    maxLength={6}
                    autoFocus
                    className="code-input"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    block
                    loading={verifyCodeMutation.isPending}
                    className="step-btn"
                    onClick={handleVerifyCode}
                    disabled={countdown === 0}
                  >
                    인증 확인
                  </Button>
                </Form.Item>
                <div className="resend-area">
                  <span>코드를 받지 못하셨나요?</span>
                  <Button
                    type="link"
                    onClick={handleSendCode}
                    loading={sendCodeMutation.isPending}
                    disabled={countdown > 270} // 30초 후 재발송 가능
                  >
                    재발송
                  </Button>
                </div>
              </Form>
            </div>
          )}

          {/* Step 3: 회원 정보 입력 */}
          {currentStep === 2 && (
            <div className="step-content">
              <div className="step-description">
                <UserOutlined className="step-icon" />
                <h3>회원 정보를 입력해주세요</h3>
                <div className="verified-email">
                  <CheckCircleOutlined /> {verifiedEmail} 인증 완료
                </div>
              </div>
              <Form form={signupForm} layout="vertical" size="large">
                <Form.Item
                  label="아이디"
                  name="loginId"
                  rules={[
                    { required: true, message: '아이디를 입력해주세요' },
                    { min: 4, message: '최소 4자 이상' },
                    { max: 20, message: '최대 20자' },
                    {
                      pattern: /^[a-zA-Z0-9_]+$/,
                      message: '영문, 숫자, 언더스코어만 가능',
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="영문, 숫자, 언더스코어 4~20자"
                  />
                </Form.Item>

                <Form.Item
                  label="비밀번호"
                  name="password"
                  rules={[
                    { required: true, message: '비밀번호를 입력해주세요' },
                    { min: 8, message: '최소 8자 이상' },
                    {
                      pattern:
                        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/,
                      message: '영문, 숫자, 특수문자 포함',
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                  />
                </Form.Item>

                <Form.Item
                  label="비밀번호 확인"
                  name="confirmPassword"
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: '비밀번호 확인' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error('비밀번호가 일치하지 않습니다')
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="비밀번호 확인"
                  />
                </Form.Item>

                <Form.Item
                  label="이름"
                  name="name"
                  rules={[
                    { required: true, message: '이름을 입력해주세요' },
                    { min: 2, message: '최소 2자 이상' },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="이름" />
                </Form.Item>

                <Form.Item
                  label="전화번호"
                  name="phoneNumber"
                  rules={[
                    {
                      pattern: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
                      message: '올바른 전화번호 형식이 아닙니다',
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="전화번호 (선택)"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    block
                    loading={signupMutation.isPending}
                    className="step-btn"
                    onClick={handleSignup}
                  >
                    회원가입
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}

          <div className="email-signup-links">
            <Link to="/user/signup">← 다른 방법으로 가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSignup;
