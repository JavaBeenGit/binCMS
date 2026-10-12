import React, { useState } from 'react';
import { Button, Table, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminMemberApi,
  roleApi,
  AdminMemberCreateRequest,
  AdminMemberResponse,
  AdminMemberUpdateRequest,
} from '@/shared/api/endpoints/adminMember';
import PageHeader from '@/admin/components/PageHeader';
import SearchBar from '@/admin/components/SearchBar';
import ListSummary from '@/admin/components/ListSummary';
import { buildAdminMemberColumns } from './adminMemberColumns';
import AdminMemberFormModal, { AdminMemberFormMode, AdminMemberFormValues } from './AdminMemberFormModal';
import AdminMemberPasswordModal from './AdminMemberPasswordModal';

const PAGE_SIZE = 10;

/**
 * 관리자 계정 관리 — 관리자 계정 추가/수정, 비밀번호 초기화, 활성화/비활성화
 */
const AdminMemberManagement: React.FC = () => {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<AdminMemberFormMode>('create');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminMemberResponse | null>(null);
  const queryClient = useQueryClient();

  // 관리자 계정 목록 조회
  const { data: membersData, isLoading } = useQuery({
    queryKey: ['adminMembers', page, PAGE_SIZE, keyword],
    queryFn: async () => (await adminMemberApi.getAdminMembers(page, PAGE_SIZE, keyword || undefined)).data,
  });

  // 관리자 역할 목록 조회 (셀렉트박스용)
  const { data: rolesData } = useQuery({
    queryKey: ['adminRoles'],
    queryFn: async () => (await roleApi.getAdminRoles()).data,
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingMember(null);
  };

  const closePassword = () => {
    setPasswordOpen(false);
    setEditingMember(null);
  };

  // 관리자 계정 생성
  const createMutation = useMutation({
    mutationFn: (data: AdminMemberCreateRequest) => adminMemberApi.createAdminMember(data),
    onSuccess: () => {
      message.success('관리자 계정이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
      closeForm();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || '관리자 계정 생성에 실패했습니다.');
    },
  });

  // 관리자 계정 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminMemberUpdateRequest }) =>
      adminMemberApi.updateAdminMember(id, data),
    onSuccess: () => {
      message.success('관리자 계정 정보가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
      closeForm();
    },
    onError: () => {
      message.error('관리자 계정 수정에 실패했습니다.');
    },
  });

  // 비밀번호 초기화
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      adminMemberApi.resetPassword(id, { newPassword }),
    onSuccess: () => {
      message.success('비밀번호가 초기화되었습니다.');
      closePassword();
    },
    onError: () => {
      message.error('비밀번호 초기화에 실패했습니다.');
    },
  });

  // 비활성화
  const deactivateMutation = useMutation({
    mutationFn: (id: number) => adminMemberApi.deactivateAdminMember(id),
    onSuccess: () => {
      message.success('관리자 계정이 비활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
    },
    onError: () => {
      message.error('비활성화에 실패했습니다.');
    },
  });

  // 활성화
  const activateMutation = useMutation({
    mutationFn: (id: number) => adminMemberApi.activateAdminMember(id),
    onSuccess: () => {
      message.success('관리자 계정이 활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
    },
    onError: () => {
      message.error('활성화에 실패했습니다.');
    },
  });

  const openCreate = () => {
    setEditingMember(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const openEdit = (member: AdminMemberResponse) => {
    setEditingMember(member);
    setFormMode('edit');
    setFormOpen(true);
  };

  const openPasswordReset = (member: AdminMemberResponse) => {
    setEditingMember(member);
    setPasswordOpen(true);
  };

  const handleFormSubmit = (values: AdminMemberFormValues) => {
    if (formMode === 'edit') {
      if (!editingMember) return;
      updateMutation.mutate({ id: editingMember.id, data: values });
    } else {
      // 추가 모드에서는 로그인 ID·비밀번호가 필수 입력이라 검증을 통과한 값에 항상 들어 있다
      createMutation.mutate(values as AdminMemberCreateRequest);
    }
  };

  const handlePasswordSubmit = (newPassword: string) => {
    if (!editingMember) return;
    resetPasswordMutation.mutate({ id: editingMember.id, newPassword });
  };

  const total = membersData?.totalElements || 0;
  const columns = buildAdminMemberColumns({
    total,
    page,
    pageSize: PAGE_SIZE,
    onEdit: openEdit,
    onPasswordReset: openPasswordReset,
    onActivate: (id) => activateMutation.mutate(id),
    onDeactivate: (id) => deactivateMutation.mutate(id),
  });

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="관리자 계정"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            관리자 추가
          </Button>
        }
      />

      <SearchBar
        placeholder="이름, 로그인ID, 이메일 검색"
        value={keyword}
        onSearch={(k) => {
          setKeyword(k);
          setPage(0);
        }}
      />

      <ListSummary total={total} page={page} pageSize={PAGE_SIZE} />
      <Table
        bordered
        columns={columns}
        dataSource={membersData?.content || []}
        rowKey="id"
        loading={isLoading}
        // 열이 많아 좁은 화면에서 "관리" 열이 잘리던 문제 → 가로 스크롤
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page + 1,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          onChange: (p) => setPage(p - 1),
        }}
      />

      <AdminMemberFormModal
        open={formOpen}
        mode={formMode}
        editing={editingMember}
        roles={rolesData}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onCancel={closeForm}
      />
      <AdminMemberPasswordModal
        open={passwordOpen}
        member={editingMember}
        loading={resetPasswordMutation.isPending}
        onSubmit={handlePasswordSubmit}
        onCancel={closePassword}
      />
    </div>
  );
};

export default AdminMemberManagement;
