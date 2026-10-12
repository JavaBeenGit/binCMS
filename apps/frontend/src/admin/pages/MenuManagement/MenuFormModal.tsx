import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select, Space } from 'antd';
import { MenuResponse, MenuType } from '@/shared/api/endpoints/menu';

const { TextArea } = Input;

export interface MenuFormValues {
  menuType: MenuType;
  menuName: string;
  menuUrl?: string;
  parentId?: number;
  depth?: number;
  sortOrder?: number;
  icon?: string;
  description?: string;
}

interface MenuFormModalProps {
  open: boolean;
  /** null 이면 새 메뉴 */
  editing: MenuResponse | null;
  /** 새 메뉴의 기본 메뉴 타입 (현재 탭) */
  defaultMenuType: MenuType;
  /** 상위 메뉴 선택 옵션 (현재 탭의 메뉴를 깊이만큼 들여쓴 플랫 리스트) */
  parentMenuOptions: { label: string; value: number }[];
  onSubmit: (values: MenuFormValues) => void;
  onCancel: () => void;
}

/**
 * 메뉴 추가/수정 모달. 수정 시 메뉴 타입은 바꿀 수 없다.
 */
const MenuFormModal: React.FC<MenuFormModalProps> = ({ open, editing, defaultMenuType, parentMenuOptions, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  // 열릴 때마다 비우고, 수정이면 기존 값을, 추가면 현재 탭의 메뉴 타입을 채운다
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editing) {
      form.setFieldsValue({
        menuType: editing.menuType,
        menuName: editing.menuName,
        menuUrl: editing.menuUrl,
        parentId: editing.parentId,
        depth: editing.depth,
        sortOrder: editing.sortOrder,
        icon: editing.icon,
        description: editing.description,
      });
    } else {
      form.setFieldsValue({ menuType: defaultMenuType, depth: 1, sortOrder: 0 });
    }
  }, [open, editing, defaultMenuType, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values as MenuFormValues);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={editing ? '메뉴 수정' : '메뉴 추가'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
      okText={editing ? '수정' : '추가'}
      cancelText="취소"
    >
      <Form form={form} layout="vertical" initialValues={{ menuType: MenuType.ADMIN, depth: 1, sortOrder: 0 }}>
        <Form.Item name="menuType" label="메뉴 타입" rules={[{ required: true, message: '메뉴 타입을 선택해주세요.' }]}>
          <Select disabled={!!editing}>
            <Select.Option value={MenuType.ADMIN}>관리자 메뉴</Select.Option>
            <Select.Option value={MenuType.USER}>사용자 메뉴</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="parentId" label="상위 메뉴">
          <Select placeholder="최상위 메뉴로 등록하려면 선택하지 마세요" allowClear options={parentMenuOptions} />
        </Form.Item>

        <Form.Item
          name="menuName"
          label="메뉴명"
          rules={[
            { required: true, message: '메뉴명을 입력해주세요.' },
            { max: 100, message: '메뉴명은 100자 이내로 입력해주세요.' },
          ]}
        >
          <Input placeholder="메뉴명을 입력하세요" />
        </Form.Item>

        <Form.Item name="menuUrl" label="메뉴 URL" rules={[{ max: 200, message: 'URL은 200자 이내로 입력해주세요.' }]}>
          <Input placeholder="/admin/example" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="large">
          <Form.Item
            name="depth"
            label="깊이"
            rules={[{ required: true, message: '깊이를 입력해주세요.' }]}
            style={{ width: 150 }}
          >
            <InputNumber min={1} max={5} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="정렬 순서"
            rules={[{ required: true, message: '정렬 순서를 입력해주세요.' }]}
            style={{ width: 150 }}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="icon"
            label="아이콘"
            rules={[{ max: 50, message: '아이콘은 50자 이내로 입력해주세요.' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="DashboardOutlined" />
          </Form.Item>
        </Space>

        <Form.Item name="description" label="설명" rules={[{ max: 500, message: '설명은 500자 이내로 입력해주세요.' }]}>
          <TextArea rows={3} placeholder="메뉴 설명을 입력하세요" showCount maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MenuFormModal;
