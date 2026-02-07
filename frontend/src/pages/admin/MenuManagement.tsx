import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm, Tabs, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi, MenuCreateRequest, MenuUpdateRequest, MenuResponse, MenuType } from '../../api/endpoints/menu';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;
const { TabPane } = Tabs;

interface MenuFormValues {
  menuType: MenuType;
  menuName: string;
  menuUrl?: string;
  parentId?: number;
  depth?: number;
  sortOrder?: number;
  icon?: string;
  description?: string;
}

const MenuManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuResponse | null>(null);
  const [activeTab, setActiveTab] = useState<MenuType>(MenuType.ADMIN);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 메뉴 목록 조회
  const { data: menusData, isLoading } = useQuery({
    queryKey: ['menus', activeTab, includeInactive],
    queryFn: async () => {
      const response = await menuApi.getMenusByType(activeTab, includeInactive);
      return response.data;
    }
  });

  // 부모 메뉴 선택용 (플랫 리스트)
  const flattenMenus = (menus: MenuResponse[]): MenuResponse[] => {
    const result: MenuResponse[] = [];
    const traverse = (menuList: MenuResponse[]) => {
      menuList.forEach(menu => {
        result.push(menu);
        if (menu.children && menu.children.length > 0) {
          traverse(menu.children);
        }
      });
    };
    traverse(menus);
    return result;
  };

  const parentMenuOptions = menusData ? flattenMenus(menusData).map(menu => ({
    label: '  '.repeat(menu.depth - 1) + menu.menuName,
    value: menu.id
  })) : [];

  // 메뉴 생성
  const createMutation = useMutation({
    mutationFn: (data: MenuCreateRequest) => menuApi.createMenu(data),
    onSuccess: () => {
      message.success('메뉴가 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      handleCancel();
    },
    onError: () => {
      message.error('메뉴 생성에 실패했습니다.');
    }
  });

  // 메뉴 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MenuUpdateRequest }) => menuApi.updateMenu(id, data),
    onSuccess: () => {
      message.success('메뉴가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      handleCancel();
    },
    onError: () => {
      message.error('메뉴 수정에 실패했습니다.');
    }
  });

  // 메뉴 삭제
  const deleteMutation = useMutation({
    mutationFn: (id: number) => menuApi.deleteMenu(id),
    onSuccess: () => {
      message.success('메뉴가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('메뉴 삭제에 실패했습니다.');
      }
    }
  });

  // 메뉴 활성화
  const activateMutation = useMutation({
    mutationFn: (id: number) => menuApi.activateMenu(id),
    onSuccess: () => {
      message.success('메뉴가 활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
    onError: () => {
      message.error('메뉴 활성화에 실패했습니다.');
    }
  });

  const handleCreate = () => {
    setEditingMenu(null);
    form.resetFields();
    form.setFieldsValue({ menuType: activeTab, depth: 1, sortOrder: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (menu: MenuResponse) => {
    setEditingMenu(menu);
    form.setFieldsValue({
      menuType: menu.menuType,
      menuName: menu.menuName,
      menuUrl: menu.menuUrl,
      parentId: menu.parentId,
      depth: menu.depth,
      sortOrder: menu.sortOrder,
      icon: menu.icon,
      description: menu.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleActivate = (id: number) => {
    activateMutation.mutate(id);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingMenu(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: MenuFormValues = values;

      if (editingMenu) {
        const { menuType, ...updateData } = formData;
        updateMutation.mutate({ id: editingMenu.id, data: updateData });
      } else {
        createMutation.mutate(formData as MenuCreateRequest);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ColumnsType<MenuResponse> = [
    {
      title: '번호',
      key: 'no',
      width: 80,
      align: 'center',
      render: (_: any, __: MenuResponse, index: number) => index + 1,
    },
    {
      title: '메뉴명',
      dataIndex: 'menuName',
      key: 'menuName',
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (text, record) => (
        <span style={{ marginLeft: `${(record.depth - 1) * 20}px` }}>
          {record.depth > 1 && '└ '}
          {text}
        </span>
      ),
    },
    {
      title: 'URL',
      dataIndex: 'menuUrl',
      key: 'menuUrl',
      ellipsis: true,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
      title: '정렬순서',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      align: 'center',
    },
    {
      title: '깊이',
      dataIndex: 'depth',
      key: 'depth',
      width: 80,
      align: 'center',
    },
    {
      title: '상태',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 80,
      align: 'center',
      render: (useYn) => (
        <Tag color={useYn === 'Y' ? 'green' : 'red'}>
          {useYn === 'Y' ? '사용' : '미사용'}
        </Tag>
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          >
            수정
          </Button>
          {record.useYn === 'N' && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleActivate(record.id)}
              size="small"
            >
              활성화
            </Button>
          )}
          <Popconfirm
            title="메뉴를 삭제하시겠습니까?"
            description="하위 메뉴가 있으면 삭제할 수 없습니다."
            onConfirm={() => handleDelete(record.id)}
            okText="예"
            cancelText="아니오"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 트리 데이터를 플랫 리스트로 변환 (테이블 표시용)
  const flattenForTable = (menus: MenuResponse[]): MenuResponse[] => {
    const result: MenuResponse[] = [];
    const traverse = (menuList: MenuResponse[]) => {
      menuList.forEach(menu => {
        // children 제거하여 Ant Design Table의 자동 트리 확장 방지
        const { children, ...menuWithoutChildren } = menu;
        result.push(menuWithoutChildren as MenuResponse);
        if (children && children.length > 0) {
          traverse(children);
        }
      });
    };
    traverse(menus);
    return result;
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>메뉴 관리</h2>
        <Space>
          <Button 
            icon={includeInactive ? <CheckCircleOutlined /> : <StopOutlined />}
            onClick={() => setIncludeInactive(!includeInactive)}
          >
            {includeInactive ? '전체 보기' : '사용중만 보기'}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            메뉴 추가
          </Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as MenuType)}>
        <TabPane tab="관리자 메뉴" key={MenuType.ADMIN}>
          <Table
            columns={columns}
            dataSource={menusData ? flattenForTable(menusData) : []}
            rowKey="id"
            loading={isLoading}
            pagination={false}
          />
        </TabPane>
        <TabPane tab="사용자 메뉴" key={MenuType.USER}>
          <Table
            columns={columns}
            dataSource={menusData ? flattenForTable(menusData) : []}
            rowKey="id"
            loading={isLoading}
            pagination={false}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={editingMenu ? '메뉴 수정' : '메뉴 추가'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={700}
        okText={editingMenu ? '수정' : '추가'}
        cancelText="취소"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ menuType: MenuType.ADMIN, depth: 1, sortOrder: 0 }}
        >
          <Form.Item
            name="menuType"
            label="메뉴 타입"
            rules={[{ required: true, message: '메뉴 타입을 선택해주세요.' }]}
          >
            <Select disabled={!!editingMenu}>
              <Select.Option value={MenuType.ADMIN}>관리자 메뉴</Select.Option>
              <Select.Option value={MenuType.USER}>사용자 메뉴</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="parentId"
            label="상위 메뉴"
          >
            <Select
              placeholder="최상위 메뉴로 등록하려면 선택하지 마세요"
              allowClear
              options={parentMenuOptions}
            />
          </Form.Item>

          <Form.Item
            name="menuName"
            label="메뉴명"
            rules={[
              { required: true, message: '메뉴명을 입력해주세요.' },
              { max: 100, message: '메뉴명은 100자 이내로 입력해주세요.' }
            ]}
          >
            <Input placeholder="메뉴명을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="menuUrl"
            label="메뉴 URL"
            rules={[{ max: 200, message: 'URL은 200자 이내로 입력해주세요.' }]}
          >
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

          <Form.Item
            name="description"
            label="설명"
            rules={[{ max: 500, message: '설명은 500자 이내로 입력해주세요.' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="메뉴 설명을 입력하세요"
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;
