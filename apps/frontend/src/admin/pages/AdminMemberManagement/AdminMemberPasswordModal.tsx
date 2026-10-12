import React, { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import type { AdminMemberResponse } from '@/shared/api/endpoints/adminMember';

interface AdminMemberPasswordModalProps {
  open: boolean;
  /** 비밀번호를 초기화할 대상 */
  member: AdminMemberResponse | null;
  loading: boolean;
  onSubmit: (newPassword: string) => void;
  onCancel: () => void;
}

/**
 * 관리자 비밀번호 초기화 모달. 새 비밀번호를 두 번 입력받아 일치할 때만 제출한다.
 */
const AdminMemberPasswordModal: React.FC<AdminMemberPasswordModalProps> = ({ open, member, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.newPassword);
    } catch {
      // 검증 실패 메시지는 antd Form 이 각 항목 아래에 표시한다
    }
  };

  return (
    <Modal
      title={`비밀번호 초기화 - ${member?.name} (${member?.loginId})`}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="초기화"
      cancelText="취소"
      width={500}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="newPassword"
          label="새 비밀번호"
          rules={[
            { required: true, message: '새 비밀번호를 입력해주세요.' },
            { min: 8, max: 20, message: '8자 이상 20자 이하로 입력해주세요.' },
          ]}
        >
          <Input.Password placeholder="새 비밀번호를 입력하세요" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="비밀번호 확인"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '비밀번호 확인을 입력해주세요.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="비밀번호를 다시 입력하세요" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminMemberPasswordModal;
