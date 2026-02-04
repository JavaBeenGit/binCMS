import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { signup, type SignupRequest } from '../../api/endpoints/auth';
import './Signup.css';

/**
 * 회원가입 페이지
 */
const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: (response) => {
      message.success(response.message || '회원가입이 완료되었습니다');
      navigate('/login');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '회원가입에 실패했습니다');
    },
  });

  const onFinish = (values: SignupRequest) => {
    signupMutation.mutate(values);
  };

  return (
    <div className="signup-container">
      <Card className="signup-card" title="binCMS 회원가입">
        <Form
          form={form}
          name="signup"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="loginId"
            rules={[
              { required: true, message: '로그인 ID를 입력해주세요' },
              { min: 4, message: '로그인 ID는 최소 4자 이상이어야 합니다' },
              { max: 20, message: '로그인 ID는 최대 20자까지 가능합니다' },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: '로그인 ID는 영문, 숫자, 언더스코어만 사용 가능합니다',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="로그인 ID (영문, 숫자, 언더스코어)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="이메일 (선택사항)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '비밀번호를 입력해주세요' },
              { min: 8, message: '비밀번호는 최소 8자 이상이어야 합니다' },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/,
                message: '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다',
              },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호 (영문, 숫자, 특수문자 포함 8자 이상)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '비밀번호를 다시 입력해주세요' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호 확인"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="name"
            rules={[
              { required: true, message: '이름을 입력해주세요' },
              { min: 2, message: '이름은 최소 2자 이상이어야 합니다' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="이름"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            rules={[
              {
                pattern: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
                message: '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)',
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="전화번호 (선택)"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={signupMutation.isPending}
            >
              회원가입
            </Button>
          </Form.Item>

          <div className="signup-footer">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;
