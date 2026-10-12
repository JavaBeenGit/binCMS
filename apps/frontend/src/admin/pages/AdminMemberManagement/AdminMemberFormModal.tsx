import React, { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import type { AdminMemberResponse, RoleResponse } from '@/shared/api/endpoints/adminMember';

export type AdminMemberFormMode = 'create' | 'edit';

export interface AdminMemberFormValues {
  /** 추가 모드에서만 입력받는다 (수정 모드의 제출값에는 없음) */
  loginId?: string;
  /** 추가 모드에서만 입력받는다 (수정 모드의 제출값에는 없음) */
  password?: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  roleCode: string;
}

interface AdminMemberFormModalProps {
  open: boolean;
  mode: AdminMemberFormMode;
  /** 수정 모드의 대상 */
  editing: AdminMemberResponse | null;
  /** 권한 셀렉트박스 목록 (관리자 역할만) */
  roles?: RoleResponse[];
  loading: boolean;
  onSubmit: (values: AdminMemberFormValues) => void;
  onCancel: () => void;
}

/**
 * 관리자 계정 추가/수정 모달. 로그인 ID·비밀번호는 추가할 때만 입력받고, 수정할 때는 로그인 ID 를 보여 주기만 한다.
 */
const AdminMemberFormModal: React.FC<AdminMemberFormModalProps> = ({ open, mode, editing, roles, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (isEdit && editing) {
      form.setFieldsValue({
        name: editing.name,
        email: editing.email,
        phoneNumber: editing.phoneNumber,
        roleCode: editing.roleCode,
      });
    } else {
      form.setFieldsValue({ roleCode: 'GENERAL_ADMIN' });
    }
  }, [open, isEdit, editing, form]);

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
      title={isEdit ? '관리자 계정 수정' : '관리자 계정 추가'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={isEdit ? '수정' : '추가'}
      cancelText="취소"
      width={600}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        {isEdit ? (
          <Form.Item label="로그인 ID">
            <Input value={editing?.loginId} disabled />
          </Form.Item>
        ) : (
          <>
            <Form.Item
              name="loginId"
              label="로그인 ID"
              rules={[
                { required: true, message: '로그인 ID를 입력해주세요.' },
                { min: 4, max: 20, message: '4자 이상 20자 이하로 입력해주세요.' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '영문, 숫자, 언더스코어만 사용 가능합니다.' },
              ]}
            >
              <Input placeholder="로그인 ID를 입력하세요" />
            </Form.Item>
            <Form.Item
              name="password"
              label="비밀번호"
              rules={[
                { required: true, message: '비밀번호를 입력해주세요.' },
                { min: 8, max: 20, message: '8자 이상 20자 이하로 입력해주세요.' },
              ]}
            >
              <Input.Password placeholder="비밀번호를 입력하세요" />
            </Form.Item>
          </>
        )}
        <Form.Item
          name="name"
          label="이름"
          rules={[
            { required: true, message: '이름을 입력해주세요.' },
            { min: 2, max: 50, message: '2자 이상 50자 이하로 입력해주세요.' },
          ]}
        >
          <Input placeholder="이름을 입력하세요" />
        </Form.Item>
        <Form.Item name="email" label="이메일" rules={[{ type: 'email', message: '올바른 이메일 형식이 아닙니다.' }]}>
          <Input placeholder="이메일을 입력하세요" />
        </Form.Item>
        <Form.Item name="phoneNumber" label="전화번호">
          <Input placeholder="010-1234-5678" />
        </Form.Item>
        <Form.Item name="roleCode" label="권한" rules={[{ required: true, message: '권한을 선택해주세요.' }]}>
          <Select>
            {roles?.map((role) => (
              <Select.Option key={role.roleCode} value={role.roleCode}>
                {role.roleName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminMemberFormModal;
