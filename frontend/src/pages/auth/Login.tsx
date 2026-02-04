import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { login, type LoginRequest } from '../../api/endpoints/auth';
import { useAuthStore } from '../../stores/authStore';
import './Login.css';

/**
 * 로그인 페이지
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      message.success(response.message || '로그인 성공');
      setAuth(response.data.accessToken, response.data.member);
      navigate('/');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '로그인에 실패했습니다');
    },
  });

  const onFinish = (values: LoginRequest) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="binCMS 로그인">
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="loginId"
            rules={[
              { required: true, message: '로그인 ID를 입력해주세요' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="로그인 ID"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loginMutation.isPending}
            >
              로그인
            </Button>
          </Form.Item>

          <div className="login-footer">
            계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
