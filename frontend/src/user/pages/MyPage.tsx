import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Form, Modal, Tag, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { withdrawMember } from '../../api/endpoints/auth';
import './MyPage.css';

/**
 * 사용자 마이페이지 — 회원정보 확인 + 회원탈퇴
 */
const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [form] = Form.useForm();

  const isLocalUser = user?.provider === 'LOCAL';

  const withdrawMutation = useMutation({
    mutationFn: withdrawMember,
    onSuccess: () => {
      message.success('회원탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
      clearAuth();
      navigate('/user');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || '회원탈퇴에 실패했습니다';
      message.error(msg);
    },
  });

  const handleWithdrawClick = () => {
    setWithdrawModalOpen(true);
  };

  const handleWithdrawConfirm = () => {
    form.validateFields().then((values) => {
      Modal.confirm({
        title: '정말 탈퇴하시겠습니까?',
        icon: <ExclamationCircleOutlined />,
        content: '탈퇴 후에는 되돌릴 수 없습니다. 모든 개인정보가 삭제됩니다.',
        okText: '탈퇴',
        okType: 'danger',
        cancelText: '취소',
        onOk() {
          withdrawMutation.mutate({
            password: values.password || undefined,
            reason: values.reason || undefined,
          });
        },
      });
    });
  };

  const getProviderLabel = (provider?: string) => {
    switch (provider) {
      case 'LOCAL': return <Tag color="blue">이메일</Tag>;
      case 'KAKAO': return <Tag color="gold">카카오</Tag>;
      case 'NAVER': return <Tag color="green">네이버</Tag>;
      case 'GOOGLE': return <Tag color="red">구글</Tag>;
      default: return <Tag>{provider}</Tag>;
    }
  };

  if (!user) {
    return (
      <div className="mypage-container">
        <div className="page-banner">
          <h1>마이페이지</h1>
          <p>로그인이 필요합니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="page-banner">
        <h1>마이페이지</h1>
        <p>회원 정보를 확인하고 관리하세요</p>
      </div>

      {/* 회원정보 확인 */}
      <div className="mypage-profile-section">
        <h2>내 정보</h2>
        <div className="profile-info-grid">
          <span className="profile-label">아이디</span>
          <span className="profile-value">{user.loginId}</span>

          <span className="profile-label">이름</span>
          <span className="profile-value">{user.name}</span>

          <span className="profile-label">이메일</span>
          <span className="profile-value">{user.email || '-'}</span>

          <span className="profile-label">전화번호</span>
          <span className="profile-value">{user.phoneNumber || '-'}</span>

          <span className="profile-label">가입 방식</span>
          <span className="profile-value">{getProviderLabel(user.provider)}</span>

          <span className="profile-label">가입일</span>
          <span className="profile-value">
            {user.regDt ? new Date(user.regDt).toLocaleDateString('ko-KR') : '-'}
          </span>
        </div>
      </div>

      {/* 회원탈퇴 */}
      <div className="mypage-withdraw-section">
        <h2>회원탈퇴</h2>
        <p className="withdraw-description">
          회원탈퇴 시 계정 정보 및 개인정보가 삭제되며, 복구할 수 없습니다.
        </p>
        <Button danger onClick={handleWithdrawClick}>
          회원탈퇴
        </Button>
      </div>

      {/* 회원탈퇴 모달 */}
      <Modal
        title="회원탈퇴"
        open={withdrawModalOpen}
        onCancel={() => {
          setWithdrawModalOpen(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setWithdrawModalOpen(false);
            form.resetFields();
          }}>
            취소
          </Button>,
          <Button
            key="withdraw"
            type="primary"
            danger
            loading={withdrawMutation.isPending}
            onClick={handleWithdrawConfirm}
            className="withdraw-btn"
          >
            탈퇴하기
          </Button>,
        ]}
      >
        <div className="withdraw-warning">
          <h4>⚠ 탈퇴 전 꼭 확인하세요</h4>
          <ul>
            <li>탈퇴 즉시 모든 개인정보(이름, 이메일, 전화번호)가 삭제됩니다.</li>
            <li>작성한 게시글·댓글은 삭제되지 않으며, "탈퇴회원"으로 표시됩니다.</li>
            <li>탈퇴 후 동일 아이디로 재가입할 수 없습니다.</li>
            <li>소셜 로그인으로 가입한 경우, 해당 소셜 계정 연동도 해제됩니다.</li>
          </ul>
        </div>

        <Form form={form} layout="vertical" className="withdraw-form">
          {isLocalUser && (
            <Form.Item
              name="password"
              label="비밀번호 확인"
              rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
            >
              <Input.Password placeholder="현재 비밀번호를 입력하세요" />
            </Form.Item>
          )}
          <Form.Item name="reason" label="탈퇴 사유 (선택)">
            <Input.TextArea
              rows={3}
              placeholder="탈퇴 사유를 알려주시면 서비스 개선에 참고하겠습니다"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyPage;
