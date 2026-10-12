import React, { useState } from 'react';
import { Button, Table, message } from 'antd';
import { PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleApi, RoleResponse } from '@/shared/api/endpoints/adminMember';
import PageHeader from '@/admin/components/PageHeader';
import { buildRoleColumns } from './roleColumns';
import RoleFormModal, { RoleFormMode, RoleFormValues } from './RoleFormModal';
import RoleDetailModal from './RoleDetailModal';

/**
 * 권한관리 페이지
 * - 역할(Role) CRUD
 * - 역할별 권한(Permission) 할당
 */
const RoleManagement: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<RoleFormMode>('create');
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRole, setDetailRole] = useState<RoleResponse | null>(null);
  const queryClient = useQueryClient();

  // 전체 역할 목록 조회
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await roleApi.getAllRoles()).data,
  });

  // 전체 권한 목록 조회 (추가/수정 체크박스·상세 권한명 표시용)
  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await roleApi.getPermissions()).data,
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingRole(null);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailRole(null);
  };

  // 역할 생성
  const createMutation = useMutation({
    mutationFn: (data: RoleFormValues & { roleCode: string }) => roleApi.createRole(data),
    onSuccess: () => {
      message.success('역할이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      closeForm();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || '역할 생성에 실패했습니다.');
    },
  });

  // 역할 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleFormValues }) => roleApi.updateRole(id, data),
    onSuccess: () => {
      message.success('역할이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      closeForm();
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

  const openCreate = () => {
    setEditingRole(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const openEdit = async (role: RoleResponse) => {
    // 상세 조회해서 권한 목록 가져오기
    try {
      const detail = (await roleApi.getRole(role.id)).data;
      setEditingRole(detail);
      setFormMode('edit');
      setFormOpen(true);
    } catch {
      message.error('역할 정보를 불러올 수 없습니다.');
    }
  };

  const openDetail = async (role: RoleResponse) => {
    try {
      setDetailRole((await roleApi.getRole(role.id)).data);
      setDetailOpen(true);
    } catch {
      message.error('역할 정보를 불러올 수 없습니다.');
    }
  };

  const handleSubmit = (values: RoleFormValues) => {
    if (formMode === 'edit') {
      if (!editingRole) return;
      updateMutation.mutate({ id: editingRole.id, data: values });
    } else {
      // 추가 모드에서는 역할 코드가 필수 입력이라 검증을 통과한 값에 항상 들어 있다
      createMutation.mutate(values as RoleFormValues & { roleCode: string });
    }
  };

  const total = rolesData?.length || 0;
  const columns = buildRoleColumns({
    total,
    onDetail: openDetail,
    onEdit: openEdit,
    onActivate: (id) => activateMutation.mutate(id),
    onDeactivate: (id) => deactivateMutation.mutate(id),
    onDelete: (id) => deleteMutation.mutate(id),
  });

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title={
          <>
            <SafetyCertificateOutlined style={{ marginRight: 8 }} />
            권한 관리
          </>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            역할 추가
          </Button>
        }
      />

      {/* 페이지네이션 없는 목록이라 ListSummary(페이지 표기) 대신 건수만 보인다 */}
      <div style={{ marginBottom: 8, color: '#666', fontSize: 14 }}>총 {total}건</div>
      <Table
        scroll={{ x: 'max-content' }}
        bordered
        columns={columns}
        dataSource={rolesData || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        size="middle"
      />

      <RoleFormModal
        open={formOpen}
        mode={formMode}
        editing={editingRole}
        permissions={permissionsData}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
      <RoleDetailModal open={detailOpen} role={detailRole} permissions={permissionsData} onClose={closeDetail} />
    </div>
  );
};

export default RoleManagement;
