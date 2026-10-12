import React, { useState } from 'react';
import { Button, Space, Table, Tabs, message } from 'antd';
import { CheckCircleOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { menuApi, MenuCreateRequest, MenuResponse, MenuType, MenuUpdateRequest } from '@/shared/api/endpoints/menu';
import PageHeader from '@/admin/components/PageHeader';
import ListSummary from '@/admin/components/ListSummary';
import { buildMenuColumns } from './menuColumns';
import { flattenForTable, flattenMenus } from './menuTree';
import MenuFormModal, { MenuFormValues } from './MenuFormModal';

const { TabPane } = Tabs;
const PAGE_SIZE = 10;

/**
 * 메뉴 관리 — 관리자 메뉴 / 사용자 메뉴 트리 (시스템 메뉴, SYSTEM_ADMIN 전용)
 */
const MenuManagement: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MenuResponse | null>(null);
  const [activeTab, setActiveTab] = useState<MenuType>(MenuType.ADMIN);
  const [includeInactive, setIncludeInactive] = useState(false);
  // 1부터 시작(antd Table pagination 기준). 두 탭이 공유하며 탭을 바꾸면 1로 돌아간다
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // 메뉴 목록 조회 (관리자)
  const { data: adminMenusData, isLoading: isAdminLoading } = useQuery({
    queryKey: ['menus', MenuType.ADMIN, includeInactive],
    queryFn: async () => (await menuApi.getMenusByType(MenuType.ADMIN, includeInactive)).data,
  });

  // 메뉴 목록 조회 (사용자)
  const { data: userMenusData, isLoading: isUserLoading } = useQuery({
    queryKey: ['menus', MenuType.USER, includeInactive],
    queryFn: async () => (await menuApi.getMenusByType(MenuType.USER, includeInactive)).data,
  });

  const menusData = activeTab === MenuType.ADMIN ? adminMenusData : userMenusData;

  // 부모 메뉴 선택용 (플랫 리스트)
  const parentMenuOptions = menusData
    ? flattenMenus(menusData).map((menu) => ({ label: '  '.repeat(menu.depth - 1) + menu.menuName, value: menu.id }))
    : [];

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  // 메뉴 생성
  const createMutation = useMutation({
    mutationFn: (data: MenuCreateRequest) => menuApi.createMenu(data),
    onSuccess: () => {
      message.success('메뉴가 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      closeForm();
    },
    onError: () => message.error('메뉴 생성에 실패했습니다.'),
  });

  // 메뉴 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MenuUpdateRequest }) => menuApi.updateMenu(id, data),
    onSuccess: () => {
      message.success('메뉴가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      closeForm();
    },
    onError: () => message.error('메뉴 수정에 실패했습니다.'),
  });

  // 메뉴 삭제 — 하위 메뉴가 있으면 서버가 거부하므로 그 메시지를 그대로 보여 준다
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
    },
  });

  // 메뉴 활성화
  const activateMutation = useMutation({
    mutationFn: (id: number) => menuApi.activateMenu(id),
    onSuccess: () => {
      message.success('메뉴가 활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
    onError: () => message.error('메뉴 활성화에 실패했습니다.'),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (menu: MenuResponse) => {
    setEditing(menu);
    setFormOpen(true);
  };

  const handleSubmit = (values: MenuFormValues) => {
    if (editing) {
      const { menuType, ...updateData } = values;
      updateMutation.mutate({ id: editing.id, data: updateData });
    } else {
      createMutation.mutate(values as MenuCreateRequest);
    }
  };

  const columns = buildMenuColumns({
    onEdit: openEdit,
    onActivate: (id) => activateMutation.mutate(id),
    onDelete: (id) => deleteMutation.mutate(id),
  });

  const tabs = [
    { type: MenuType.ADMIN, label: '관리자 메뉴', rows: adminMenusData ? flattenForTable(adminMenusData) : [], loading: isAdminLoading },
    { type: MenuType.USER, label: '사용자 메뉴', rows: userMenusData ? flattenForTable(userMenusData) : [], loading: isUserLoading },
  ];

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="메뉴 관리"
        extra={
          <Space>
            <Button
              icon={includeInactive ? <CheckCircleOutlined /> : <StopOutlined />}
              onClick={() => setIncludeInactive(!includeInactive)}
            >
              {includeInactive ? '전체 보기' : '사용중만 보기'}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              메뉴 추가
            </Button>
          </Space>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key as MenuType);
          setCurrentPage(1);
        }}
      >
        {tabs.map((tab) => (
          <TabPane tab={tab.label} key={tab.type}>
            <ListSummary total={tab.rows.length} page={currentPage - 1} pageSize={PAGE_SIZE} />
            <Table
              bordered
              columns={columns}
              dataSource={tab.rows}
              rowKey="id"
              loading={tab.loading}
              pagination={{ pageSize: PAGE_SIZE, showSizeChanger: false, current: currentPage, onChange: (page) => setCurrentPage(page) }}
            />
          </TabPane>
        ))}
      </Tabs>

      <MenuFormModal
        open={formOpen}
        editing={editing}
        defaultMenuType={activeTab}
        parentMenuOptions={parentMenuOptions}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
    </div>
  );
};

export default MenuManagement;
