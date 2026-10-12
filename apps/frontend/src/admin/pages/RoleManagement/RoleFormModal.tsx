import React, { useEffect, useMemo } from 'react';
import { Card, Checkbox, Form, Input, InputNumber, Modal } from 'antd';
import type { PermissionResponse, RoleResponse } from '@/shared/api/endpoints/adminMember';

export type RoleFormMode = 'create' | 'edit';

export interface RoleFormValues {
  /** 추가 모드에서만 입력받는다 (수정 모드의 제출값에는 없음) */
  roleCode?: string;
  roleName: string;
  description?: string;
  sortOrder?: number;
  permissionCodes?: string[];
}

interface RoleFormModalProps {
  open: boolean;
  mode: RoleFormMode;
  /** 수정 모드의 대상 (상세 조회 결과 — permissions 포함) */
  editing: RoleResponse | null;
  /** 전체 권한 목록. 그룹별 체크박스로 보인다 */
  permissions?: PermissionResponse[];
  loading: boolean;
  onSubmit: (values: RoleFormValues) => void;
  onCancel: () => void;
}

const { TextArea } = Input;

const GROUP_LABELS: Record<string, string> = {
  MENU: '메뉴 접근 권한',
  SYSTEM: '시스템 관리 권한',
  DATA: '데이터 조작 권한',
};

/**
 * 역할 추가/수정 모달. 역할 코드는 추가할 때만 입력받고 수정할 때는 보여 주기만 한다.
 */
const RoleFormModal: React.FC<RoleFormModalProps> = ({ open, mode, editing, permissions, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const isEdit = mode === 'edit';

  // 권한을 그룹별로 묶기
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionResponse[]> = {};
    permissions?.forEach((p) => {
      if (!groups[p.permGroup]) groups[p.permGroup] = [];
      groups[p.permGroup].push(p);
    });
    return groups;
  }, [permissions]);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (isEdit && editing) {
      form.setFieldsValue({
        roleName: editing.roleName,
        description: editing.description,
        sortOrder: editing.sortOrder,
        permissionCodes: editing.permissions || [],
      });
    } else {
      form.setFieldsValue({ sortOrder: 0 });
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
      title={isEdit ? `역할 수정 - ${editing?.roleCode || ''}` : '역할 추가'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={isEdit ? '수정' : '추가'}
      cancelText="취소"
      width={700}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        {isEdit ? (
          <Form.Item label="역할 코드">
            <Input value={editing?.roleCode} disabled />
          </Form.Item>
        ) : (
          <Form.Item
            name="roleCode"
            label="역할 코드"
            rules={[
              { required: true, message: '역할 코드를 입력해주세요.' },
              { max: 30, message: '30자 이하로 입력해주세요.' },
              { pattern: /^[A-Z_]+$/, message: '대문자와 언더스코어만 사용 가능합니다.' },
            ]}
          >
            <Input placeholder="예: EDITOR_ADMIN" />
          </Form.Item>
        )}
        <Form.Item
          name="roleName"
          label="역할명"
          rules={[
            { required: true, message: '역할명을 입력해주세요.' },
            { max: 50, message: '50자 이하로 입력해주세요.' },
          ]}
        >
          <Input placeholder={isEdit ? '역할명을 입력하세요' : '예: 편집 관리자'} />
        </Form.Item>
        <Form.Item name="description" label="설명">
          <TextArea rows={2} placeholder="역할에 대한 설명을 입력하세요" maxLength={200} showCount />
        </Form.Item>
        <Form.Item name="sortOrder" label="정렬 순서">
          <InputNumber min={0} max={999} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="permissionCodes" label="권한 할당">
          <Checkbox.Group style={{ width: '100%' }}>
            {Object.entries(groupedPermissions).map(([group, perms]) => (
              <Card
                key={group}
                size="small"
                title={<span style={{ fontSize: 13 }}>{GROUP_LABELS[group] || group}</span>}
                style={{ marginBottom: 8 }}
                bodyStyle={{ padding: '8px 16px' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px 16px' }}>
                  {perms.map((p) => (
                    <Checkbox key={p.permCode} value={p.permCode}>
                      <span style={{ fontSize: 13 }}>{p.permName}</span>
                    </Checkbox>
                  ))}
                </div>
              </Card>
            ))}
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleFormModal;
