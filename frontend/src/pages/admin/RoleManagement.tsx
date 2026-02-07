import React, { useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber,
  message, Tag, Popconfirm, Tooltip, Card, Checkbox, Descriptions, Badge,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined,
  CheckCircleOutlined, SafetyCertificateOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi, RoleResponse, PermissionResponse } from '../../api/endpoints/adminMember';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

/**
 * 권한관리 페이지
 * - 역할(Role) CRUD
 * - 역할별 권한(Permission) 할당
 */
const RoleManagement: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [detailRole, setDetailRole] = useState<RoleResponse | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();

  // 전체 역할 목록 조회
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await roleApi.getAllRoles();
      return response.data;
    },
  });

  // 전체 권한 목록 조회
  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await roleApi.getPermissions();
      return response.data;
    },
  });

  // 역할 생성
  const createMutation = useMutation({
    mutationFn: (data: { roleCode: string; roleName: string; description?: string; sortOrder?: number; permissionCodes?: string[] }) =>
      roleApi.createRole(data),
    onSuccess: () => {
      message.success('역할이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsCreateModalOpen(false);
      createForm.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || '역할 생성에 실패했습니다.');
    },
  });

  // 역할 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { roleName: string; description?: string; sortOrder?: number; permissionCodes?: string[] } }) =>
      roleApi.updateRole(id, data),
    onSuccess: () => {
      message.success('역할이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsEditModalOpen(false);
      setEditingRole(null);
      editForm.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || '역할 수정에 실패했습니다.');
    },
  });

  // 역할 삭제
  const deleteMutation = useMutation({
    mutationFn: (id: number) => roleApi.deleteRole(id),
    onSuccess: () => {
      message.success('역할이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || '역할 삭제에 실패했습니다.');
    },
  });

  // 역할 활성화
  const activateMutation = useMutation({
    mutationFn: (id: number) => roleApi.activateRole(id),
    onSuccess: () => {
      message.success('역할이 활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || '활성화에 실패했습니다.');
    },
  });

  // 역할 비활성화
  const deactivateMutation = useMutation({
    mutationFn: (id: number) => roleApi.deactivateRole(id),
    onSuccess: () => {
      message.success('역할이 비활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || '비활성화에 실패했습니다.');
    },
  });

  // 권한을 그룹별로 묶기
  const groupedPermissions = React.useMemo(() => {
    if (!permissionsData) return {};
    const groups: Record<string, PermissionResponse[]> = {};
    permissionsData.forEach((p: PermissionResponse) => {
      if (!groups[p.permGroup]) groups[p.permGroup] = [];
      groups[p.permGroup].push(p);
    });
    return groups;
  }, [permissionsData]);

  const groupLabels: Record<string, string> = {
    MENU: '메뉴 접근 권한',
    SYSTEM: '시스템 관리 권한',
    DATA: '데이터 조작 권한',
  };

  const handleCreate = () => {
    createForm.resetFields();
    createForm.setFieldsValue({ sortOrder: 0 });
    setIsCreateModalOpen(true);
  };

  const handleEdit = async (role: RoleResponse) => {
    // 상세 조회해서 권한 목록 가져오기
    try {
      const response = await roleApi.getRole(role.id);
      const detail = response.data;
      setEditingRole(detail);
      editForm.setFieldsValue({
        roleName: detail.roleName,
        description: detail.description,
        sortOrder: detail.sortOrder,
        permissionCodes: detail.permissions || [],
      });
      setIsEditModalOpen(true);
    } catch {
      message.error('역할 정보를 불러올 수 없습니다.');
    }
  };

  const handleDetail = async (role: RoleResponse) => {
    try {
      const response = await roleApi.getRole(role.id);
      setDetailRole(response.data);
      setIsDetailModalOpen(true);
    } catch {
      message.error('역할 정보를 불러올 수 없습니다.');
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      createMutation.mutate(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingRole) return;
    try {
      const values = await editForm.validateFields();
      updateMutation.mutate({ id: editingRole.id, data: values });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 기본 역할 여부 체크
  const isDefaultRole = (roleCode: string) => ['USER', 'SYSTEM_ADMIN'].includes(roleCode);

  const columns: ColumnsType<RoleResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      align: 'center',
    },
    {
      title: '역할 코드',
      dataIndex: 'roleCode',
      key: 'roleCode',
      width: 180,
      render: (code: string) => {
        const colorMap: Record<string, string> = {
          SYSTEM_ADMIN: 'red',
          OPERATION_ADMIN: 'blue',
          GENERAL_ADMIN: 'cyan',
          USER: 'default',
        };
        return <Tag color={colorMap[code] || 'purple'}>{code}</Tag>;
      },
    },
    {
      title: '역할명',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 150,
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '정렬',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
      align: 'center',
    },
    {
      title: '상태',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 80,
      align: 'center',
      render: (useYn: string) => (
        <Tag color={useYn === 'Y' ? 'green' : 'red'}>
          {useYn === 'Y' ? '사용' : '미사용'}
        </Tag>
      ),
    },
    {
      title: '권한 수',
      key: 'permissionCount',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Badge count={record.permissions?.length || 0} showZero color={record.permissions?.length ? 'blue' : 'default'} />
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 280,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="상세보기">
            <Button type="link" icon={<EyeOutlined />} size="small" onClick={() => handleDetail(record)}>
              상세
            </Button>
          </Tooltip>
          <Tooltip title="수정">
            <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
              수정
            </Button>
          </Tooltip>
          {record.useYn === 'Y' ? (
            !isDefaultRole(record.roleCode) && (
              <Popconfirm
                title="비활성화하시겠습니까?"
                description="이 역할을 가진 사용자는 영향을 받을 수 있습니다."
                onConfirm={() => deactivateMutation.mutate(record.id)}
                okText="예"
                cancelText="아니오"
              >
                <Button type="link" danger icon={<StopOutlined />} size="small">
                  비활성화
                </Button>
              </Popconfirm>
            )
          ) : (
            <Button type="link" icon={<CheckCircleOutlined />} size="small"
              onClick={() => activateMutation.mutate(record.id)}>
              활성화
            </Button>
          )}
          {!isDefaultRole(record.roleCode) && (
            <Popconfirm
              title="정말 삭제하시겠습니까?"
              description="이 작업은 되돌릴 수 없습니다."
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="삭제"
              cancelText="취소"
            >
              <Button type="link" danger icon={<DeleteOutlined />} size="small">
                삭제
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 권한 코드 → 이름 맵
  const permNameMap = React.useMemo(() => {
    if (!permissionsData) return {};
    const map: Record<string, string> = {};
    permissionsData.forEach((p: PermissionResponse) => { map[p.permCode] = p.permName; });
    return map;
  }, [permissionsData]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>
          <SafetyCertificateOutlined style={{ marginRight: 8 }} />
          권한관리
        </h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          역할 추가
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={rolesData || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        size="middle"
      />

      {/* 역할 생성 모달 */}
      <Modal
        title="역할 추가"
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => { setIsCreateModalOpen(false); createForm.resetFields(); }}
        okText="추가"
        cancelText="취소"
        width={700}
        confirmLoading={createMutation.isPending}
      >
        <Form form={createForm} layout="vertical">
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
          <Form.Item
            name="roleName"
            label="역할명"
            rules={[
              { required: true, message: '역할명을 입력해주세요.' },
              { max: 50, message: '50자 이하로 입력해주세요.' },
            ]}
          >
            <Input placeholder="예: 편집 관리자" />
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
                  title={<span style={{ fontSize: 13 }}>{groupLabels[group] || group}</span>}
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

      {/* 역할 수정 모달 */}
      <Modal
        title={`역할 수정 - ${editingRole?.roleCode || ''}`}
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => { setIsEditModalOpen(false); setEditingRole(null); editForm.resetFields(); }}
        okText="수정"
        cancelText="취소"
        width={700}
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="역할 코드">
            <Input value={editingRole?.roleCode} disabled />
          </Form.Item>
          <Form.Item
            name="roleName"
            label="역할명"
            rules={[
              { required: true, message: '역할명을 입력해주세요.' },
              { max: 50, message: '50자 이하로 입력해주세요.' },
            ]}
          >
            <Input placeholder="역할명을 입력하세요" />
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
                  title={<span style={{ fontSize: 13 }}>{groupLabels[group] || group}</span>}
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

      {/* 역할 상세보기 모달 */}
      <Modal
        title={`역할 상세 - ${detailRole?.roleName || ''}`}
        open={isDetailModalOpen}
        onCancel={() => { setIsDetailModalOpen(false); setDetailRole(null); }}
        footer={[
          <Button key="close" onClick={() => { setIsDetailModalOpen(false); setDetailRole(null); }}>
            닫기
          </Button>,
        ]}
        width={600}
      >
        {detailRole && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="역할 코드">{detailRole.roleCode}</Descriptions.Item>
              <Descriptions.Item label="역할명">{detailRole.roleName}</Descriptions.Item>
              <Descriptions.Item label="정렬 순서">{detailRole.sortOrder}</Descriptions.Item>
              <Descriptions.Item label="상태">
                <Tag color={detailRole.useYn === 'Y' ? 'green' : 'red'}>
                  {detailRole.useYn === 'Y' ? '사용' : '미사용'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="설명" span={2}>
                {detailRole.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="등록일" span={2}>
                {detailRole.regDt ? new Date(detailRole.regDt).toLocaleString('ko-KR') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginBottom: 8 }}>할당된 권한 ({detailRole.permissions?.length || 0}개)</h4>
            {detailRole.permissions && detailRole.permissions.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {detailRole.permissions.map((code) => (
                  <Tag key={code} color="blue" style={{ marginBottom: 4 }}>
                    {permNameMap[code] || code}
                  </Tag>
                ))}
              </div>
            ) : (
              <span style={{ color: '#999' }}>할당된 권한이 없습니다.</span>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default RoleManagement;
