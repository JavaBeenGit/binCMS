import React, { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import type { UserMemberResponse, UserPasswordResetRequest } from '@/shared/api/endpoints/userMember';

interface UserPasswordModalProps {
  open: boolean;
  /** 비밀번호를 초기화할 대상 (LOCAL 가입자만) */
  user: UserMemberResponse | null;
  loading: boolean;
  onSubmit: (values: UserPasswordResetRequest) => void;
  onCancel: () => void;
}

/**
 * 사용자 비밀번호 초기화 모달. 새 비밀번호를 두 번 입력받아 일치할 때만 제출한다.
 */
const UserPasswordModal: React.FC<UserPasswordModalProps> = ({ open, user, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleOk = async () => {
    try {
      // 폼 값(newPassword·confirmPassword)을 그대로 넘긴다 — 분할 전과 같은 요청 본문
      const values = await form.validateFields();
      onSubmit(values);
    } catch {
      // 검증 실패 메시지는 antd Form 이 각 항목 아래에 표시한다
    }
  };

  return (
    <Modal
      title={`비밀번호 초기화 - ${user?.loginId}`}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="초기화"
      cancelText="취소"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="newPassword"
          label="새 비밀번호"
          rules={[
            { required: true, message: '새 비밀번호를 입력해주세요' },
            { min: 8, max: 20, message: '비밀번호는 8자 이상 20자 이하여야 합니다' },
          ]}
        >
          <Input.Password placeholder="8자 이상 입력" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="비밀번호 확인"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '비밀번호를 다시 입력해주세요' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('비밀번호가 일치하지 않습니다'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="비밀번호 확인" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserPasswordModal;
