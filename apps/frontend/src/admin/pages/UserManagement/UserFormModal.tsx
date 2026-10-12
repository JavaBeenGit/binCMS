import React, { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import type { UserMemberResponse, UserMemberUpdateRequest } from '@/shared/api/endpoints/userMember';

interface UserFormModalProps {
  open: boolean;
  /** 수정 대상 */
  user: UserMemberResponse | null;
  loading: boolean;
  onSubmit: (values: UserMemberUpdateRequest) => void;
  onCancel: () => void;
}

/**
 * 사용자 수정 모달. 등록은 없고(사용자가 직접 가입) 아이디는 보여 주기만 한다.
 */
const UserFormModal: React.FC<UserFormModalProps> = ({ open, user, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open || !user) return;
    form.resetFields();
    form.setFieldsValue({
      name: user.name,
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
    });
  }, [open, user, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch {
      // 검증 실패 메시지는 antd Form 이 각 항목 아래에 표시한다
    }
  };

  return (
    <Modal
      title={`사용자 수정 - ${user?.loginId}`}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="저장"
      cancelText="취소"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label="아이디">
          <Input value={user?.loginId} disabled />
        </Form.Item>
        <Form.Item
          name="name"
          label="이름"
          rules={[
            { required: true, message: '이름을 입력해주세요' },
            { min: 2, max: 50, message: '이름은 2자 이상 50자 이하여야 합니다' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="email" label="이메일" rules={[{ type: 'email', message: '올바른 이메일 형식이 아닙니다' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="전화번호"
          rules={[{ pattern: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, message: '올바른 전화번호 형식이 아닙니다' }]}
        >
          <Input placeholder="010-0000-0000" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
